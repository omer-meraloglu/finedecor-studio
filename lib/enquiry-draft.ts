import {applications,getDecor,getFinish,getVariant} from './catalog';
import {requestSchema} from './validation';
import type {z} from 'zod';

export type EnquiryPayload=z.infer<typeof requestSchema>;
export type EmailDraft={recipient:string;subject:string;body:string};
export const enquiryRecipient='info@finedecor.de';

/** Only validated source IDs enter a draft; contact details stay in page memory. */
export function buildEnquiryEmailDraft(input:EnquiryPayload):EmailDraft{
  const value=requestSchema.parse(input),de=value.locale==='de';
  const text=(en:string,german:string)=>de?german:en;
  const application=applications.find(item=>item.id===value.application)?.name[value.locale]||text('Other / to discuss','Andere / zu besprechen');
  const references=value.variantIds.map(id=>{
    const variant=getVariant(id)!;
    return `${getDecor(variant).name} · ${getDecor(variant).code} · ${getFinish(variant).name}\n${variant.id}`;
  });
  const subject=value.kind==='samples'?text('Fine Decor — sample enquiry','Fine Decor — Musteranfrage'):text('Fine Decor — project enquiry','Fine Decor — Projektanfrage');
  const body=[
    `${text('Name','Name')}: ${value.name}`,
    `${text('Company','Unternehmen')}: ${value.company}`,
    `${text('Email','E-Mail')}: ${value.email}`,
    `${text('Country / region','Land / Region')}: ${value.country}`,
    `${text('Application','Anwendung')}: ${application}`,
    '',value.details,
    ...(references.length?['',text('Surface references','Oberflächenreferenzen'),...references]:[]),
    ...(value.projectId?['',`${text('Saved local project','Lokal gespeichertes Projekt')}: ${value.projectId}`]:[]),
    ...(references.length?['',text('Source-referenced demo materials. Please confirm current products, suitability and sample terms.','Quellenbasierte Demo-Materialien. Bitte aktuelle Produkte, Eignung und Musterbedingungen bestätigen.')]:[])
  ].join('\n');
  return {recipient:enquiryRecipient,subject,body};
}

/** Long mailto URIs are unreliable across email apps; copying is the full-text fallback. */
export function emailDraftLink(draft:EmailDraft):{href:string;includesBody:boolean}{
  const full=`mailto:${enquiryRecipient}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
  const includesBody=full.length<=1800;
  return {href:includesBody?full:`mailto:${enquiryRecipient}?subject=${encodeURIComponent(draft.subject)}`,includesBody};
}
