import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GET,POST} from '../app/api/[...path]/route';
import {defaultProject,variants} from '../lib/catalog';
import {publicOrigin} from '../lib/runtime';

test('Hosted review reads source catalog without SQLite and rejects persistence rather than silently losing data',async()=>{
  const old=process.env.VERCEL,oldDir=process.env.FD_DATA_DIR;
  process.env.VERCEL='1';process.env.FD_DATA_DIR='/read-only-do-not-write/';
  try{
    const catalog=await GET(new Request('https://preview.example/api/catalog'),{params:Promise.resolve({path:['catalog']})});
    assert.equal(catalog.status,200);assert.equal(catalog.headers.get('set-cookie'),null);
    const content=await catalog.json();assert.equal(content.variants.length,variants.length);assert.equal(content.capabilities.serverPersistence,false);
    const save=await POST(new Request('https://preview.example/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(defaultProject)}),{params:Promise.resolve({path:['projects']})});
    assert.equal(save.status,503);assert.match((await save.json()).error,/keeps drafts on your device/);
    const enquiry=await POST(new Request('https://preview.example/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),{params:Promise.resolve({path:['enquiries']})});
    assert.equal(enquiry.status,503);
  }finally{old===undefined?delete process.env.VERCEL:process.env.VERCEL=old;oldDir===undefined?delete process.env.FD_DATA_DIR:process.env.FD_DATA_DIR=oldDir}
});

test('Hosted canonical origin uses trusted deployment configuration without request-header inference',()=>{
  const keys=['FD_PUBLIC_ORIGIN','VERCEL_PROJECT_PRODUCTION_URL','VERCEL_URL'] as const,old=keys.map(k=>process.env[k]);
  try{
    delete process.env.FD_PUBLIC_ORIGIN;process.env.VERCEL_PROJECT_PRODUCTION_URL='finedecor-preview.vercel.app';process.env.VERCEL_URL='build-specific.vercel.app';
    assert.equal(publicOrigin(),'https://finedecor-preview.vercel.app');
    process.env.FD_PUBLIC_ORIGIN='https://review.example/';assert.equal(publicOrigin(),'https://review.example');
  }finally{keys.forEach((k,i)=>old[i]===undefined?delete process.env[k]:process.env[k]=old[i])}
});
