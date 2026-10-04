import {getVariant} from './catalog';

/** Explicit studio IDs take priority without replacing the user's device shortlist. */
export function requestSelection(single: string|null, study: string|null, shortlist: readonly string[]) {
  const validShortlist = [...new Set(shortlist.filter(id => !!getVariant(id)))].slice(0,12);
  const raw = study !== null ? study.split(',') : single ? [single] : [];
  const unique = [...new Set(raw)];
  const invalid = unique.some(id => !getVariant(id)) || unique.length > 12 || (study?.length ?? 0) > 4096;
  const explicit = unique.length <= 12 && (study?.length ?? 0) <= 4096 ? unique.filter(id => !!getVariant(id)) : [];
  const ids = explicit.length ? study !== null ? [...new Set([...explicit,...validShortlist])].slice(0,12) : explicit : validShortlist;
  const omittedShortlist = explicit.length && study !== null ? validShortlist.filter(id => !ids.includes(id)).length : 0;
  return {ids, invalid, omittedShortlist};
}
