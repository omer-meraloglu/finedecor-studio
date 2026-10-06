import assert from 'node:assert/strict';
const origin=process.env.FD_PUBLIC_ORIGIN||'http://127.0.0.1:4173';
async function read(path,status=200){const r=await fetch(origin+path,{redirect:'manual'});assert.equal(r.status,status,path);return {r,body:await r.text()};}
const catalog=await read('/api/catalog');const data=JSON.parse(catalog.body);assert.equal(data.variants.length,86);assert.ok(data.variants.every(v=>v.demo&&v.familyId===null&&v.sku===null));
assert.equal(JSON.parse((await read('/api/catalog?q=373')).body).variants.length,2);
await read('/api/catalog?finish=imaginary',400);
const studio=await read('/en/studio');assert.ok(studio.body.includes('SURFACE LIBRARY'));assert.ok(studio.body.includes('demo-373-frosted'));assert.ok(!studio.body.includes('<canvas'));assert.equal(studio.r.headers.get('referrer-policy'),'no-referrer');assert.ok(studio.r.headers.get('x-robots-tag')?.includes('noindex'));
const en=await read('/en/products/demo-373-frosted');assert.ok(en.body.includes('demo-373-frosted'));assert.ok(/hrefLang="de"/i.test(en.body));
assert.ok(en.body.includes('href="/en/studio?variant=demo-373-frosted"'));assert.ok(en.body.includes('Inspect in 3D'));assert.ok(!en.body.includes('id="product-preview"'));
const de=await read('/de/products/demo-373-frosted');assert.ok(/<html[^>]*lang="de"/i.test(de.body));
assert.ok(de.body.includes('href="/de/studio?variant=demo-373-frosted"'));
const home=await read('/en');const nav=home.body.match(/<nav[^>]*id="primary-navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1]||'';
const primaryRoutes=Array.from(nav.matchAll(/href="\/en\/(collections|applications|company|studio|knowledge|contact)"/g),match=>match[1]);
assert.deepEqual(primaryRoutes,['collections','applications','company','studio','knowledge','contact']);
for(const path of ['/en/request?variant=demo-932-gloss','/en/contact','/de/contact']){const page=await read(path);assert.equal((page.body.match(/<form\b/g)||[]).length,1,path);assert.ok(page.body.includes('name="email"'));assert.ok(page.body.includes('name="details"'));assert.ok(page.body.includes('mailto:info@finedecor.de'));}
await read('/en/products/demo-255-gloss',404);await read('/tr',404);await read('/en/unrecognised-route',404);
const persistent=data.capabilities.serverPersistence;
await read('/api/admin',persistent?401:503);await read('/api/documents/unknown',persistent?404:503);await read('/api/projects/e353764d-bcf1-4fc3-b6ee-efefe8bf9eb7',persistent?404:503);
const robot=await read('/robots.txt');assert.ok(robot.body.includes('Disallow: /'));const sitemap=await read('/sitemap.xml');assert.ok(!sitemap.body.includes('demo-'));assert.ok(!sitemap.body.includes('/shared/'));
console.log('HTTP smoke passed: catalog, invalid variants, SSR without canvas, exact Studio links, navigation order, DE/EN enquiry forms, private access, staging SEO. No writes or messages.');
