import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {buildEnquiryEmailDraft,emailDraftLink,type EnquiryPayload} from '../lib/enquiry-draft';
import {getDecor,getFinish,getVariant} from '../lib/catalog';
import {requestSchema} from '../lib/validation';

const brief=(overrides:Partial<EnquiryPayload>={}):EnquiryPayload=>({name:'Synthetic QA',company:'Review only',email:'qa@example.test',country:'Germany',application:'other',details:'Synthetic project question. No actual email sending.',kind:'technical',variantIds:[],projectId:null,serviceAcknowledgement:true,website:'',locale:'en',idempotencyKey:randomUUID(),...overrides});

test('Contact enquiries allow no surfaces; samples still require validated source IDs',()=>{
  const contact=brief();
  assert.equal(requestSchema.safeParse(contact).success,true);
  assert.match(buildEnquiryEmailDraft(contact).body,/Synthetic project question/);
  assert.doesNotMatch(buildEnquiryEmailDraft(contact).body,/Surface references|idempotency|serviceAcknowledgement/);
  assert.equal(requestSchema.safeParse(brief({kind:'samples'})).success,false);
  assert.throws(()=>buildEnquiryEmailDraft(brief({variantIds:['unknown']})));
  assert.throws(()=>buildEnquiryEmailDraft(brief({variantIds:['demo-373-frosted','demo-373-frosted']})));
});

test('Email drafts retain exact validated variant IDs, decor and finish relationships, with project scope',()=>{
  const variant=getVariant('demo-932-gloss')!,projectId=randomUUID();
  const draft=buildEnquiryEmailDraft(brief({kind:'samples',variantIds:[variant.id],projectId}));
  assert.match(draft.subject,/sample enquiry/);
  assert.ok(draft.body.includes(`${getDecor(variant).name} · ${getDecor(variant).code} · ${getFinish(variant).name}\n${variant.id}`));
  assert.ok(draft.body.includes(projectId));
  assert.match(draft.body,/Source-referenced demo materials/);
  const german=buildEnquiryEmailDraft(brief({locale:'de',kind:'samples',variantIds:[variant.id]}));
  assert.match(german.subject,/Musteranfrage/);assert.match(german.body,/Oberflächenreferenzen/);
  assert.ok(german.body.includes(variant.id));
});

test('Mailto encoding keeps user text in the body and uses only the fixed Fine Decor recipient',()=>{
  const draft=buildEnquiryEmailDraft(brief({name:'Ömer QA',details:'A brief &bcc=attacker@example.test?subject=changed\nA second line.'}));
  const link=emailDraftLink(draft);
  assert.equal(link.includesBody,true);
  const url=new URL(link.href);
  assert.equal(url.pathname,'info@finedecor.de');
  assert.equal(url.searchParams.get('body'),draft.body);assert.equal(url.searchParams.get('subject'),draft.subject);
  assert.deepEqual([...url.searchParams.keys()],['subject','body']);
  assert.match(url.searchParams.get('body')!,/Ömer QA/);
});

test('Long edited drafts use a copy fallback without contact data in the mailto URI',()=>{
  const draft=buildEnquiryEmailDraft(brief({details:'Long synthetic review message. '.repeat(90)}));
  const link=emailDraftLink(draft),url=new URL(link.href);
  assert.equal(link.includesBody,false);assert.equal(url.searchParams.has('body'),false);
  assert.equal(link.href.includes('qa%40example.test'),false);
  assert.ok(draft.body.includes('qa@example.test'));
  const edited={...draft,body:'Edited and reviewed project brief.'};
  assert.equal(new URL(emailDraftLink(edited).href).searchParams.get('body'),edited.body);
});
