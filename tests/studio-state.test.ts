import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,variants} from '../lib/catalog';
import {projectSchema} from '../lib/validation';
import type {Project} from '../lib/model';
import {
  activeVariantIds, assignMaterial, cameraPreset, changeScene, cloneProject,
  commitHistory, createHistory, redoHistory, retainReferenceIds, setComparison, undoHistory,
  supportsAccent,
} from '../lib/studio-state';

const olive = 'demo-373-frosted';
const grey = 'demo-425-gloss';
const cashmere = 'demo-255-frosted';
const sand = 'demo-1121-frosted';

test('Selecting surfaces replaces active IDs and never requests historical material selections', () => {
  const original = cloneProject(defaultProject);
  let project = assignMaterial(original, 'fronts', grey);
  project = assignMaterial(project, 'fronts', cashmere);
  assert.deepEqual(project.variantIds, [cashmere]);
  assert.deepEqual(activeVariantIds(project), [cashmere]);
  assert.deepEqual(original.variantIds, [olive]);
  assert.equal(original.assignments.fronts, olive);
  assert.ok(projectSchema.safeParse(project).success);
  assert.throws(() => assignMaterial(project, 'fronts', 'demo-255-gloss'), /missing or unavailable/);
  assert.throws(() => assignMaterial(project, 'fronts', 'unknown'), /missing or unavailable/);
  assert.throws(() => assignMaterial(project, 'floor' as 'fronts', grey), /Unsupported material slot/);
});

test('Comparison cleanup preserves shared assignments and explicitly held references', () => {
  let project = changeScene(defaultProject, 'kitchen');
  project = assignMaterial(project, 'accent', grey);
  project = setComparison(project, cashmere, [sand]);
  assert.deepEqual(project.variantIds, [olive, grey, cashmere, sand]);
  project = setComparison(project, null, [sand]);
  assert.deepEqual(project.variantIds, [olive, grey, sand]);
  project = setComparison(project, grey, [sand]);
  project = setComparison(project, null, [sand]);
  assert.deepEqual(project.variantIds, [olive, grey, sand]);
  assert.ok(projectSchema.safeParse(project).success);
  assert.throws(() => retainReferenceIds(project, ['demo-1121-gloss']), /missing or unavailable/);
});

test('Scene changes drop unsupported accents, keep explicit references and fit the new model', () => {
  const kitchen = assignMaterial(changeScene(defaultProject, 'kitchen'), 'accent', grey);
  const panel = changeScene(kitchen, 'panel');
  assert.deepEqual(panel.assignments, {fronts: olive});
  assert.deepEqual(panel.variantIds, [olive]);
  assert.deepEqual(panel.camera, cameraPreset('panel', 'perspective'));
  assert.equal(kitchen.assignments.accent, grey);
  assert.throws(() => assignMaterial(panel, 'accent', grey), /fronts slot only/);
  assert.deepEqual(changeScene(kitchen, 'panel', [grey]).variantIds, [olive, grey]);
  assert.ok(projectSchema.safeParse(panel).success);
  for (const scene of ['panel', 'kitchen', 'unit', 'table'] as const) {
    for (const preset of ['perspective', 'front', 'detail'] as const) {
      const project = {...changeScene(defaultProject, scene), camera: cameraPreset(scene, preset)};
      assert.ok(projectSchema.safeParse(project).success, `${scene}/${preset} serializes as a valid camera`);
    }
  }
  const camera = cameraPreset('kitchen', 'front');
  camera.position[0] = 29;
  assert.equal(cameraPreset('kitchen', 'front').position[0], .45);
});

test('Table transitions keep tabletop and comparison IDs, drop accents and restore through undo', () => {
  const kitchen = setComparison(assignMaterial(changeScene(defaultProject, 'kitchen'), 'accent', grey), cashmere, [sand]);
  const table = changeScene(kitchen, 'table', [sand]);
  assert.equal(table.scene, 'table');
  assert.deepEqual(table.assignments, {fronts: olive});
  assert.deepEqual(table.variantIds, [olive, cashmere, sand]);
  assert.deepEqual(table.camera, cameraPreset('table', 'perspective'));
  assert.deepEqual(activeVariantIds(table), [olive, cashmere]);
  assert.ok(projectSchema.safeParse(table).success);
  assert.equal(supportsAccent('table'), false);
  assert.equal(supportsAccent('panel'), false);
  assert.equal(supportsAccent('kitchen'), true);
  assert.equal(supportsAccent('unit'), true);
  assert.throws(() => assignMaterial(table, 'accent', grey), /fronts slot only/);
  assert.equal(projectSchema.safeParse({...table, assignments: {...table.assignments, accent: grey}, variantIds: [...table.variantIds, grey]}).success, false);
  const updated = assignMaterial(table, 'fronts', grey, [sand]);
  assert.deepEqual(updated.variantIds, [grey, cashmere, sand]);
  assert.deepEqual(setComparison(updated, null, [sand]).variantIds, [grey, sand]);
  const front = cameraPreset('table', 'front');
  assert.ok(front.position[1] > front.target[1], 'Front view looks down enough to reveal the tabletop');
  const history = commitHistory(createHistory(kitchen), table);
  assert.deepEqual(undoHistory(history).present, kitchen);
  assert.deepEqual(redoHistory(undoHistory(history)).present, table);
});

test('Full studies reject additions atomically and accept a replacement or a released reference slot', () => {
  const references=variants.filter(v=>v.id!==olive).slice(0,11).map(v=>v.id);
  const full=retainReferenceIds(changeScene(defaultProject,'kitchen'),references);
  const original=cloneProject(full),originalReferences=[...references];
  const next=variants.find(v=>!full.variantIds.includes(v.id))!.id;
  assert.equal(full.variantIds.length,12);
  assert.ok(projectSchema.safeParse(full).success);
  assert.throws(()=>retainReferenceIds(full,[...references,next]),/up to 12 variants/);
  assert.throws(()=>setComparison(full,next,references),/up to 12 variants/);
  assert.throws(()=>assignMaterial(full,'accent',next,references),/up to 12 variants/);
  assert.deepEqual(full,original,'Rejected additions preserve assignments, IDs and camera');
  assert.deepEqual(references,originalReferences,'Rejected additions do not poison reference bookkeeping');
  const replacement=assignMaterial(full,'fronts',next,references);
  assert.equal(replacement.variantIds.length,12);
  assert.equal(replacement.assignments.fronts,next);
  assert.ok(!replacement.variantIds.includes(olive));
  const accepted=setComparison(full,next,references.slice(0,-1));
  assert.equal(accepted.variantIds.length,12);
  assert.equal(accepted.compareId,next);
  assert.equal(accepted.assignments.fronts,olive);
  assert.ok(projectSchema.safeParse(accepted).success);
  assert.deepEqual(full,original,'A successful retry also leaves its input snapshot untouched');
});

test('Bounded undo and redo restore whole projects and discard abandoned future edits', () => {
  let history = createHistory(defaultProject, 2);
  history = commitHistory(history, assignMaterial(history.present, 'fronts', grey));
  history = commitHistory(history, changeScene(history.present, 'kitchen'));
  history = commitHistory(history, setComparison(history.present, cashmere));
  assert.equal(history.past.length, 2);
  const latest = cloneProject(history.present);
  history = undoHistory(history);
  assert.equal(history.present.compareId, null);
  history = undoHistory(history);
  assert.equal(history.present.scene, 'panel');
  assert.equal(history.present.assignments.fronts, grey);
  assert.equal(undoHistory(history), history);
  history = redoHistory(history);
  assert.equal(history.present.scene, 'kitchen');
  history = redoHistory(history);
  assert.deepEqual(history.present, latest);
  assert.equal(redoHistory(history), history);
  history = undoHistory(history);
  history = commitHistory(history, assignMaterial(history.present, 'accent', sand));
  assert.equal(history.future.length, 0);
  assert.equal(history.present.assignments.accent, sand);
  assert.equal(commitHistory(history, cloneProject(history.present)), history);
  assert.throws(() => createHistory(defaultProject, 0), /limit/);
  assert.throws(() => createHistory(defaultProject, 101), /limit/);
});

test('History snapshots remain independent of caller mutations and clone every saved camera field', () => {
  const mutable = cloneProject(defaultProject);
  const history = createHistory(mutable);
  mutable.camera.position[0] = 20;
  mutable.camera.target[0] = 21;
  mutable.variantIds.push(sand);
  mutable.assignments.fronts = sand;
  assert.deepEqual(history.present, defaultProject);
  const next: Project = {...cloneProject(defaultProject), name: 'Material review', camera: cameraPreset('panel', 'detail')};
  const committed = commitHistory(history, next);
  next.camera.position[0] = 22;
  next.name = 'Caller changed';
  assert.equal(committed.present.name, 'Material review');
  assert.deepEqual(committed.present.camera, cameraPreset('panel', 'detail'));
  assert.deepEqual(history.present, defaultProject);
});
