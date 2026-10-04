import {test} from 'node:test';
import assert from 'node:assert/strict';
import {variants} from '../lib/catalog';
import {requestSelection} from '../lib/request-selection';

test('A full shortlist cannot displace explicit studio IDs or mutate the shortlist',()=>{
  const shortlist=variants.slice(0,12).map(v=>v.id), original=[...shortlist];
  const study=variants.slice(12,15).map(v=>v.id);
  const result=requestSelection(null,study.join(','),shortlist);
  assert.deepEqual(result.ids.slice(0,3),study);
  assert.equal(result.ids.length,12);
  assert.equal(result.omittedShortlist,3);
  assert.deepEqual(shortlist,original);
});
test('Enquiry links validate IDs, deduplicate references and reject oversized study selections',()=>{
  const id=variants[0].id, fallback=variants[1].id;
  assert.deepEqual(requestSelection(null,`${id},${id}`,[id]).ids,[id]);
  const missing=requestSelection(null,`${id},missing`,[]);
  assert.equal(missing.invalid,true);assert.deepEqual(missing.ids,[id]);
  const oversized=requestSelection(null,variants.slice(0,13).map(v=>v.id).join(','),[fallback]);
  assert.equal(oversized.invalid,true);assert.deepEqual(oversized.ids,[fallback]);
});
test('A product enquiry retains the explicit single variant and ordinary enquiries use the shortlist',()=>{
  const id=variants[0].id, shortlist=[variants[1].id];
  assert.deepEqual(requestSelection(id,null,shortlist).ids,[id]);
  assert.deepEqual(requestSelection(null,null,shortlist).ids,shortlist);
  assert.equal(requestSelection('missing',null,shortlist).invalid,true);
});
