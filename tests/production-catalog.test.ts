import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {variants,decors,materials,getVariant,getDecor,filterCatalog} from '../lib/catalog';
import {productionSourceEntries,productionVariants} from '../lib/production-catalog';
import {projectSchema} from '../lib/validation';
import {defaultProject} from '../lib/catalog';

test('Every imported pair has one catalog variant and its verified company swatch',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../docs/production-catalog-import.json',import.meta.url),'utf8'));
  assert.equal(productionSourceEntries.length,86);
  assert.equal(productionSourceEntries.filter(entry=>entry.finish==='frosted').length,41);
  assert.equal(productionSourceEntries.filter(entry=>entry.finish==='gloss').length,45);
  assert.equal(new Set(productionSourceEntries.map(entry=>`${entry.code}/${entry.finish}`)).size,86);
  assert.equal(new Set(variants.map(variant=>variant.id)).size,86);
  assert.equal(decors.length,78);
  assert.equal(new Set(decors.map(decor=>decor.id)).size,78);
  for(const source of productionSourceEntries){
    const variant=getVariant(source.id);
    assert.ok(variant,source.id);
    assert.equal(variant.finishId,source.finish);
    assert.equal(getDecor(variant).code,source.code);
    assert.equal(variant.swatch,source.swatch);
    assert.ok(source.sourceImageUrl.startsWith('https://www.finedecor.de/wp-content/uploads/'));
    const record=manifest.entries.find((entry:{id:string})=>entry.id===source.id);
    const bytes=readFileSync(new URL('../public'+source.swatch,import.meta.url));
    assert.equal(bytes[0],0xff);
    assert.equal(bytes[1],0xd8);
    assert.equal(record.width,200);
    assert.equal(record.height,200);
    assert.equal(bytes.length,record.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
    assert.equal(record.sourceMatchesLocal,true);
  }
  assert.deepEqual(manifest.unresolvedAssets,[]);
});

test('Expanded catalog preserves six saved-study materials while new references stay 2D-only demos',()=>{
  const expected=[['demo-373-frosted','#747b54'],['demo-255-frosted','#b3a998'],['demo-1121-frosted','#d4cab3'],['demo-425-frosted','#5b625b'],['demo-373-gloss','#737956'],['demo-425-gloss','#4f5550']];
  assert.deepEqual(variants.slice(0,6).map(variant=>[variant.id,variant.hex]),expected);
  assert.equal(productionVariants.length,80);
  for(const variant of productionVariants){assert.equal(variant.materialId,null);assert.equal(variant.demo,true);assert.equal(variant.approval,'draft');assert.equal(variant.familyId,null);assert.equal(variant.sku,null);assert.equal(variant.dimensions,null);assert.deepEqual(variant.documentIds,[]);assert.deepEqual(variant.compatibleApplications,[])}
  assert.equal(materials.reduce((count,material)=>count+material.variantIds.length,0),6);
  assert.ok(materials.every(material=>material.variantIds.every(id=>getVariant(id)?.materialId===material.id)));
  assert.ok(projectSchema.safeParse(defaultProject).success);
  const source2D='demo-8366-gloss';
  assert.ok(projectSchema.safeParse({...defaultProject,variantIds:[source2D],assignments:{fronts:source2D}}).success);
});

test('Hyphenated codes and source name conflicts do not synthesize finish relationships',()=>{
  assert.equal(getDecor(getVariant('demo-548-1-frosted')!).code,'548-1');
  assert.equal(getDecor(getVariant('demo-505-2-frosted')!).code,'505-2');
  assert.equal(getVariant('demo-548-1-gloss'),undefined);
  assert.equal(getVariant('demo-255-gloss'),undefined);
  assert.equal(getVariant('demo-1121-gloss'),undefined);
  for(const code of ['412','570','8362']){
    const frosted=getVariant(`demo-${code}-frosted`)!,gloss=getVariant(`demo-${code}-gloss`)!;
    assert.notEqual(frosted.decorId,gloss.decorId);
    assert.notEqual(getDecor(frosted).name,getDecor(gloss).name);
  }
  assert.equal(getVariant('demo-540-frosted')!.decorId,getVariant('demo-540-gloss')!.decorId);
  assert.equal(filterCatalog(variants,'demo-8366-gloss','gloss','yellow').length,1);
  assert.equal(filterCatalog(variants,'255','gloss').length,0);
  assert.equal(filterCatalog(variants,'','all','all','fineflex').length,0);
});
