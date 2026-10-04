import assert from 'node:assert/strict';
const origin=process.env.FD_PUBLIC_ORIGIN||'http://127.0.0.1:4173';
async function read(path,status=200){const r=await fetch(origin+path,{redirect:'manual'});assert.equal(r.status,status,path);return {r,body:await r.text()};}
const catalog=await read('/api/catalog');const data=JSON.parse(catalog.body);assert.equal(data.variants.length,6);assert.ok(data.variants.every(v=>v.demo&&v.familyId===null&&v.sku===null));
assert.equal(JSON.parse((await read('/api/catalog?q=373')).body).variants.length,2);
await read('/api/catalog?finish=imaginary',400);
const studio=await read('/en/studio');assert.ok(studio.body.includes('SURFACE LIBRARY'));assert.ok(studio.body.includes('demo-373-frosted'));assert.ok(!studio.body.includes('<canvas'));assert.equal(studio.r.headers.get('referrer-policy'),'no-referrer');assert.ok(studio.r.headers.get('x-robots-tag')?.includes('noindex'));
const en=await read('/en/products/demo-373-frosted');assert.ok(en.body.includes('demo-373-frosted'));assert.ok(/hrefLang="de"/i.test(en.body));
const de=await read('/de/products/demo-373-frosted');assert.ok(/<html[^>]*lang="de"/i.test(de.body));
await read('/en/products/demo-255-gloss',404);await read('/tr',404);await read('/en/unrecognised-route',404);
await read('/api/admin',401);await read('/api/documents/unknown',404);await read('/api/projects/e353764d-bcf1-4fc3-b6ee-efefe8bf9eb7',404);
const robot=await read('/robots.txt');assert.ok(robot.body.includes('Disallow: /'));const sitemap=await read('/sitemap.xml');assert.ok(!sitemap.body.includes('demo-'));assert.ok(!sitemap.body.includes('/shared/'));
console.log('HTTP smoke passed: catalog, invalid filters/variants, SSR controls without canvas, DE/EN equivalence, private access, staging robots/sitemap. No writes or messages.');
