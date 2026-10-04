import {getVariant} from './catalog';
import type {Project} from './model';

export type MaterialTarget = 'fronts' | 'accent' | 'compare';
export const supportsAccent = (scene: Project['scene']): boolean => scene === 'kitchen' || scene === 'unit';
export type StudioHistory = {
  past: Project[];
  present: Project;
  future: Project[];
  limit: number;
};

// Reference-camera positions describe these illustrative models, not product dimensions.
const cameraPresets: Record<Project['scene'], Record<Project['camera']['preset'], Project['camera']>> = {
  panel: {
    perspective: {preset: 'perspective', position: [2.3, 1.9, 3.6], target: [0, 1.04, 0]},
    front: {preset: 'front', position: [0, 1.04, 4.7], target: [0, 1.04, 0]},
    detail: {preset: 'detail', position: [.95, 1.25, 2.05], target: [0, 1.04, 0]},
  },
  kitchen: {
    perspective: {preset: 'perspective', position: [3.9, 2.6, 5.3], target: [.45, 1.15, 0]},
    front: {preset: 'front', position: [.45, 1.15, 7.2], target: [.45, 1.15, 0]},
    detail: {preset: 'detail', position: [1.45, 1.3, 2.3], target: [.3, .8, .15]},
  },
  unit: {
    perspective: {preset: 'perspective', position: [3, 1.9, 4.1], target: [0, .9, 0]},
    front: {preset: 'front', position: [0, .9, 6.1], target: [0, .9, 0]},
    detail: {preset: 'detail', position: [1.1, 1.12, 2.35], target: [0, .94, .12]},
  },
  table: {
    perspective: {preset: 'perspective', position: [2.6, 1.95, 3.5], target: [0, .62, 0]},
    // An elevated front preset keeps this horizontal reference surface visible.
    front: {preset: 'front', position: [0, 1.9, 4.8], target: [0, .72, 0]},
    detail: {preset: 'detail', position: [1.1, 1.5, 2], target: [0, .75, 0]},
  },
};

export function cloneProject(project: Project): Project {
  return {
    ...project,
    variantIds: [...project.variantIds],
    assignments: {...project.assignments},
    camera: {
      ...project.camera,
      position: [...project.camera.position],
      target: [...project.camera.target],
    },
  };
}

function requireVariant(id: string): string {
  if (!getVariant(id)) throw new Error('Variant is missing or unavailable');
  return id;
}

export function cameraPreset(scene: Project['scene'], preset: Project['camera']['preset']): Project['camera'] {
  const camera = cameraPresets[scene]?.[preset];
  if (!camera) throw new Error('Unsupported scene or camera preset');
  return {...camera, position: [...camera.position], target: [...camera.target]};
}

/** Only surfaces visible in a material slot or comparison belong to the active selection. */
export function activeVariantIds(project: Project): string[] {
  const ids = [project.assignments.fronts];
  if (supportsAccent(project.scene) && project.assignments.accent) ids.push(project.assignments.accent);
  if (project.compareId) ids.push(project.compareId);
  return [...new Set(ids.map(requireVariant))];
}

/** Extra project references must be intentional; cycling through the catalog adds no history IDs. */
export function retainReferenceIds(project: Project, referenceIds: readonly string[] = []): Project {
  const next = cloneProject(project);
  next.variantIds = [...new Set([...activeVariantIds(next), ...referenceIds.map(requireVariant)])];
  if (next.variantIds.length > 12) throw new Error('A study supports up to 12 variants');
  return next;
}

export function assignMaterial(
  project: Project,
  target: MaterialTarget,
  variantId: string,
  referenceIds: readonly string[] = [],
): Project {
  requireVariant(variantId);
  if (!['fronts', 'accent', 'compare'].includes(target)) throw new Error('Unsupported material slot');
  if (target === 'accent' && !supportsAccent(project.scene)) throw new Error('This scene supports the fronts slot only');
  const next = cloneProject(project);
  if (target === 'compare') next.compareId = variantId;
  else next.assignments[target] = variantId;
  return retainReferenceIds(next, referenceIds);
}

export function setComparison(
  project: Project,
  variantId: string | null,
  referenceIds: readonly string[] = [],
): Project {
  const next = cloneProject(project);
  next.compareId = variantId === null ? null : requireVariant(variantId);
  return retainReferenceIds(next, referenceIds);
}

export function changeScene(
  project: Project,
  scene: Project['scene'],
  referenceIds: readonly string[] = [],
): Project {
  const next = cloneProject(project);
  next.scene = scene;
  if (!supportsAccent(scene)) next.assignments = {fronts: next.assignments.fronts};
  next.camera = cameraPreset(scene, 'perspective');
  return retainReferenceIds(next, referenceIds);
}

/** Immutable snapshots keep undo safe from later edits to arrays or camera tuples. */
export function createHistory(project: Project, limit = 30): StudioHistory {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('History limit must be between 1 and 100');
  return {past: [], present: cloneProject(project), future: [], limit};
}

export function commitHistory(history: StudioHistory, project: Project): StudioHistory {
  if (JSON.stringify(history.present) === JSON.stringify(project)) return history;
  return {
    past: [...history.past.map(cloneProject), cloneProject(history.present)].slice(-history.limit),
    present: cloneProject(project),
    future: [],
    limit: history.limit,
  };
}

export function undoHistory(history: StudioHistory): StudioHistory {
  if (!history.past.length) return history;
  return {
    past: history.past.slice(0, -1).map(cloneProject),
    present: cloneProject(history.past[history.past.length - 1]),
    future: [cloneProject(history.present), ...history.future.map(cloneProject)].slice(0, history.limit),
    limit: history.limit,
  };
}

export function redoHistory(history: StudioHistory): StudioHistory {
  if (!history.future.length) return history;
  return {
    past: [...history.past.map(cloneProject), cloneProject(history.present)].slice(-history.limit),
    present: cloneProject(history.future[0]),
    future: history.future.slice(1).map(cloneProject),
    limit: history.limit,
  };
}
