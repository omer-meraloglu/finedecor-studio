import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject} from '../lib/catalog';
import type {Project} from '../lib/model';
import {buildStudyExport} from '../lib/study-export';
import {cameraPreset} from '../lib/studio-state';

const date = new Date('2026-10-04T12:00:00Z');
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aQ1sAAAAASUVORK5CYII=';
const project: Project = {
  ...defaultProject,
  name: 'Kitchen material study',
  scene: 'kitchen',
  light: 'warm',
  variantIds: ['demo-373-frosted', 'demo-425-frosted', 'demo-373-gloss'],
  assignments: {fronts: 'demo-373-frosted', accent: 'demo-425-frosted'},
  compareId: 'demo-373-gloss',
};
const build = (overrides: Partial<Parameters<typeof buildStudyExport>[0]> = {}) => buildStudyExport({project, projectId: 'private-project-id', locale: 'en', previewDataUrl: null, date, ...overrides});

test('Study export preserves chosen IDs, assignments, comparison and preview limitations', () => {
  const html = build();
  for (const id of project.variantIds) assert.ok(html.includes(id));
  for (const label of ['A · Main fronts', 'Accent front · fixed in A and B', 'B · Comparison fronts', 'Pending owner approval', 'Illustrative warm light', 'Camera position', '2026-10-04']) assert.ok(html.includes(label));
  assert.ok(html.includes('not a technical specification'));
  assert.ok(html.includes('Demo variants are excluded from fulfilment'));
  assert.ok(html.includes('no 3D image captured'));
  assert.equal(html.includes('Saved local enquiry reference'), false);
  assert.equal(html.includes('<img '), false);
  assert.equal(html.includes('<script'), false);
});

test('Study export localizes all document labels and carries an explicitly supplied enquiry reference', () => {
  const html = build({locale: 'de', enquiryId: 'local-enquiry-id'});
  assert.ok(html.includes('<html lang="de">'));
  for (const label of ['Oberflächenstudie', 'Küchenvignette', 'Illustratives warmes Licht', 'A · Hauptfronten', 'B · Vergleichsfronten', 'Varianten-ID', 'Eigentümerfreigabe ausstehend', 'keine technische Spezifikation', 'Referenz der lokal gespeicherten Anfrage', '4. Oktober 2026']) assert.ok(html.includes(label));
  assert.ok(html.includes('local-enquiry-id'));
  for (const untranslated of ['Family pending review', 'Chosen material references', 'Saved local enquiry reference', 'No 3D image captured']) assert.equal(html.includes(untranslated), false);
});

test('Study export escapes user text and rejects injected image URLs', () => {
  const name = '<script>alert("name")</script>&';
  const html = build({project: {...project, name}, projectId: '"><svg onload="alert(1)">', enquiryId: '<img src=x onerror=alert(1)>'});
  assert.ok(html.includes('&lt;script&gt;alert(&quot;name&quot;)&lt;/script&gt;&amp;'));
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('<svg '), false);
  assert.equal(html.includes('<img src=x'), false);
  for (const previewDataUrl of ['javascript:alert(1)', 'data:image/svg+xml,<svg onload="alert(1)">', `${png}" onerror="alert(1)`, 'data:image/png;base64,AAAA', 'data:image/png;base64,iVBORw0KGgo-not-base64']) {
    const rejected = build({previewDataUrl});
    assert.equal(rejected.includes('<img '), false);
    assert.ok(rejected.includes('no 3D image captured'));
  }
});

test('Study export embeds only a valid PNG and uses role-based fallback for repeated or missing references', () => {
  const html = build({previewDataUrl: png});
  assert.ok(html.includes(`src="${png}"`));
  assert.equal(html.includes('no 3D image captured'), false);
  const missing = build({project: {...project, variantIds: ['unavailable<script>'], assignments: {fronts: 'unavailable<script>'}, compareId: 'unavailable<script>'}});
  assert.ok(missing.includes('Material unavailable'));
  assert.ok(missing.includes('unavailable&lt;script&gt;'));
  assert.equal(missing.includes('unavailable<script>'), false);
  assert.equal((missing.match(/class="colour"/g) || []).length, 2);
});

test('Study export names cameras by their saved coordinates rather than a stale preset tag', () => {
  const front = cameraPreset('kitchen', 'front');
  const preset = build({project: {...project, camera: {...front, preset: 'detail'}}});
  assert.ok(preset.includes('<dt>Saved camera</dt><dd>Front</dd>'));
  const custom = {...front, position: [front.position[0] + .3, front.position[1], front.position[2]] as [number, number, number]};
  const en = build({project: {...project, camera: custom}});
  const de = build({project: {...project, camera: custom}, locale: 'de'});
  assert.ok(en.includes('<dt>Saved camera</dt><dd>Custom view</dd>'));
  assert.ok(de.includes('<dt>Gespeicherte Kamera</dt><dd>Eigene Ansicht</dd>'));
});
