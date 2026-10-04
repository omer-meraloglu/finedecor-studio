// Read-only local production asset budget. No contact or enquiry data is read.
import {readFileSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
const origin=process.env.FD_QA_ORIGIN||'http://127.0.0.1:4173';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))throw Error('Asset measurement is restricted to a local preview.');
const response=await fetch(origin+'/en/studio');if(!response.ok)throw Error('Start the production preview first.');
const html=await response.text();
const scripts=[...new Set(Array.from(html.matchAll(/<script[^>]*src="([^"]+)"/g),m=>m[1]))];
const other=[...new Set([...Array.from(html.matchAll(/<link[^>]*href="([^"]+\.css)"/g),m=>m[1]),...Array.from(html.matchAll(/<img[^>]*src="(\/media\/[^"?]+)"/g),m=>m[1])])];
const root=resolve('.');
function local(url){const decoded=decodeURIComponent(url);if(decoded.startsWith('/_next/static/'))return join(root,'.next',decoded.slice('/_next/'.length));if(decoded.startsWith('/media/'))return join(root,'public',decoded);throw Error('Unexpected nonlocal asset');}
function size(path,label=path){const bytes=readFileSync(path);return {path:label,rawBytes:bytes.length,gzipBytes:gzipSync(bytes).length};}
function walk(path){return readdirSync(path,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(path,entry.name)):[join(path,entry.name)]);}
const initialScripts=scripts.map(url=>size(local(url),url));const initialPaths=new Set(scripts.map(local));
const threeIntentChunks=walk(join(root,'.next/static/chunks')).filter(path=>path.endsWith('.js')&&!initialPaths.has(path)&&/WebGLRenderer|Illustrative 3D surface|3D-Kontext/.test(readFileSync(path,'utf8'))).map(path=>size(path,path.slice(root.length+1)));
const additionalStudioCssImages=other.map(url=>size(local(url),url));
const total=(items,key)=>items.reduce((sum,item)=>sum+item[key],0);
console.log(JSON.stringify({checkedAt:new Date().toISOString().slice(0,10),buildId:readFileSync('.next/BUILD_ID','utf8').trim(),method:'Raw local production files plus estimated gzip; includes conditional polyfill as a conservative upper bound. No external geometry or texture assets. HTTP overhead is excluded.',initialScripts,threeIntentChunks,additionalStudioCssImages,initialRawBytes:total(initialScripts,'rawBytes'),initialGzipBytes:total(initialScripts,'gzipBytes'),studioRawBytes:total(threeIntentChunks,'rawBytes'),studioGzipBytes:total(threeIntentChunks,'gzipBytes'),htmlRawBytes:Buffer.byteLength(html),measuredRawStudioTotal:Buffer.byteLength(html)+total([...initialScripts,...threeIntentChunks,...additionalStudioCssImages],'rawBytes'),SSRcontrolsPresent:html.includes('Load interactive 3D')&&html.includes('Front panel'),SSRnoCanvas:!html.includes('<canvas')},null,2));
