'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Check,Copy,LoaderCircle,Mail,Phone} from 'lucide-react';
import {Button,api,text as t} from './controls';
import {applications} from '@/lib/catalog';
import {requestSchema} from '@/lib/validation';
import {buildEnquiryEmailDraft,emailDraftLink,type EmailDraft} from '@/lib/enquiry-draft';
import './enquiry-form.css';

type Locale='en'|'de';
type Kind='samples'|'technical';
type Field='name'|'company'|'email'|'country'|'details';
type Props={
  locale:Locale;
  serverPersistence:boolean;
  variantIds?:string[];
  projectId?:string|null;
  initialKind?:Kind;
  allowKindChoice?:boolean;
  identityContext?:string;
  onSaved?:(id:string,projectId:string|null)=>void;
  onBusyChange?:(busy:boolean)=>void;
};

export function DirectContact({locale,children}:{locale:Locale;children?:React.ReactNode}){
  const de=locale==='de';
  return <aside className="concise-direct-contact" aria-label={t(de,'Contact Fine Decor','Fine Decor kontaktieren')}>
    <h2>{t(de,'Talk to Fine Decor.','Sprechen Sie mit Fine Decor.')}</h2>
    <div className="concise-contact-methods">
      <a className="concise-contact-method" href="mailto:info@finedecor.de"><Mail size={22} aria-hidden="true"/><span><small>{t(de,'EMAIL','E-MAIL')}</small><strong>info@finedecor.de</strong></span><ArrowUpRight aria-hidden="true"/></a>
      <a className="concise-contact-method" href="tel:+492522937970"><Phone size={22} aria-hidden="true"/><span><small>{t(de,'PHONE','TELEFON')}</small><strong>+49 2522 937 97 0</strong></span><ArrowUpRight aria-hidden="true"/></a>
    </div>
    {children}
  </aside>;
}

export default function EnquiryForm({locale,serverPersistence,variantIds=[],projectId=null,initialKind='technical',allowKindChoice=false,identityContext='',onSaved,onBusyChange}:Props){
  const de=locale==='de',id=useId();
  const [values,setValues]=useState<Record<Field,string>>({name:'',company:'',email:'',country:'',details:''});
  const [kind,setKind]=useState<Kind>(initialKind),[application,setApplication]=useState('other'),[ack,setAck]=useState(false);
  const [errors,setErrors]=useState<Partial<Record<Field|'serviceAcknowledgement',string>>>({}),[error,setError]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState('');
  const [draft,setDraft]=useState<EmailDraft|null>(null),[copyStatus,setCopyStatus]=useState('');
  const mounted=useRef(true),submitting=useRef(false),identity=useRef<{signature:string;key:string}|null>(null);
  const errorRef=useRef<HTMLDivElement>(null),successRef=useRef<HTMLDivElement>(null),draftRef=useRef<HTMLDivElement>(null),draftBodyRef=useRef<HTMLTextAreaElement>(null);
  const context=`${locale}:${identityContext}:${variantIds.join(',')}:${projectId||''}`,activeContext=useRef(context);
  activeContext.current=context;
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false}},[]);
  useEffect(()=>{setKind(initialKind)},[initialKind,identityContext,locale]);
  useEffect(()=>{setDraft(null);setDone('');setError('');setErrors({});setCopyStatus('');identity.current=null},[context]);
  useEffect(()=>{if(error)errorRef.current?.focus()},[error]);
  useEffect(()=>{if(done)successRef.current?.focus()},[done]);
  useEffect(()=>{if(draft)draftRef.current?.focus()},[!!draft]);
  const fieldId=(field:string)=>`${id}-${field}`;
  const labels:Record<Field,string>={name:t(de,'Name','Name'),company:t(de,'Company','Unternehmen'),email:t(de,'Work email','Geschäftliche E-Mail'),country:t(de,'Country / region','Land / Region'),details:t(de,'Your message','Ihre Nachricht')};
  const update=(field:Field,value:string)=>{setValues(current=>({...current,[field]:value}));setErrors(current=>({...current,[field]:undefined}));setError('')};

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(submitting.current)return;
    const website=String(new FormData(event.currentTarget).get('website')||'');
    const payload={...values,application,kind,variantIds:[...variantIds],projectId,serviceAcknowledgement:ack,website,locale};
    const signature=JSON.stringify(payload);
    if(!identity.current||identity.current.signature!==signature)identity.current={signature,key:crypto.randomUUID()};
    const parsed=requestSchema.safeParse({...payload,idempotencyKey:identity.current.key});
    if(!parsed.success){
      const next:Partial<Record<Field|'serviceAcknowledgement',string>>={};
      for(const issue of parsed.error.issues){
        const field=String(issue.path[0]||'');
        if(field in labels)next[field as Field]=field==='email'?t(de,'Enter a valid email address.','Geben Sie eine gültige E-Mail-Adresse ein.'):field==='details'?t(de,'Use 10–3,000 characters.','Verwenden Sie 10–3.000 Zeichen.'):t(de,'Enter at least 2 characters.','Geben Sie mindestens 2 Zeichen ein.');
        if(field==='serviceAcknowledgement')next.serviceAcknowledgement=t(de,'Please acknowledge the notice below.','Bitte bestätigen Sie den Hinweis unten.');
      }
      setErrors(next);setError(kind==='samples'&&!variantIds.length?t(de,'Choose a surface, or select technical advice.','Wählen Sie eine Oberfläche oder technische Beratung.'):t(de,'Please check the marked fields.','Bitte prüfen Sie die markierten Felder.'));errorRef.current?.focus();return;
    }
    setError('');setErrors({});
    if(!serverPersistence){setDraft(buildEnquiryEmailDraft(parsed.data));setCopyStatus('');return;}
    const submittedContext=context;
    submitting.current=true;setBusy(true);onBusyChange?.(true);
    try{
      const result=await api('enquiries',parsed.data);
      if(mounted.current&&activeContext.current===submittedContext){setDone(result.id);onSaved?.(result.id,projectId)}
    }catch(caught){if(mounted.current&&activeContext.current===submittedContext)setError((caught as Error).message)}
    finally{submitting.current=false;if(mounted.current){setBusy(false);onBusyChange?.(false)}}
  }

  async function copyDraft(){
    if(!draft)return;
    try{await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);setCopyStatus(t(de,'Draft copied. Paste it into your email app.','Entwurf kopiert. Fügen Sie ihn in Ihr E-Mail-Programm ein.'))}
    catch{draftBodyRef.current?.focus();draftBodyRef.current?.select();setCopyStatus(t(de,'Select and copy the draft below.','Wählen und kopieren Sie den Entwurf unten.'))}
  }

  if(done)return <div className="concise-enquiry concise-enquiry-success" role="status" tabIndex={-1} ref={successRef}>
    <Check size={28} aria-hidden="true"/><h2>{t(de,'Saved for local review.','Zur lokalen Prüfung gespeichert.')}</h2><p>{t(de,'No message was sent or sample dispatch arranged.','Es wurde keine Nachricht versendet und kein Musterversand veranlasst.')}</p><code>{done}</code><Link className="btn" href={`/${locale}/studio`}>{t(de,'Back to the studio','Zurück zum Studio')}<ArrowUpRight size={17}/></Link>
  </div>;
  if(draft){
    const email=emailDraftLink(draft);
    return <div className="concise-enquiry concise-draft-review" tabIndex={-1} ref={draftRef} aria-labelledby={fieldId('draft-title')}>
      <h2 id={fieldId('draft-title')}>{t(de,'Review your email draft.','E-Mail-Entwurf prüfen.')}</h2>
      <p>{t(de,'To info@finedecor.de. Send it from your email app. This website has not sent or stored your enquiry.','An info@finedecor.de. Senden Sie ihn in Ihrem E-Mail-Programm. Die Website hat Ihre Anfrage weder versendet noch gespeichert.')}</p>
      <label htmlFor={fieldId('draft-body')}>{t(de,'Email draft — editable','E-Mail-Entwurf — bearbeitbar')}<textarea id={fieldId('draft-body')} ref={draftBodyRef} value={draft.body} maxLength={7000} onChange={event=>{setDraft({...draft,body:event.target.value});setCopyStatus('')}} rows={12}/></label>
      <div className="concise-enquiry-action"><a className="btn" href={email.href}>{t(de,'Open email draft','E-Mail-Entwurf öffnen')}<ArrowUpRight size={17} aria-hidden="true"/></a><Button variant="outline" type="button" onClick={copyDraft}><Copy size={16} aria-hidden="true"/>{t(de,'Copy draft','Entwurf kopieren')}</Button></div>
      {!email.includesBody&&<p className="concise-draft-note">{t(de,'Long draft: copy it first, then paste it into your email app.','Langer Entwurf: erst kopieren, dann im E-Mail-Programm einfügen.')}</p>}
      <p className="concise-copy-status" role="status" aria-live="polite">{copyStatus}</p><Button variant="ghost" type="button" onClick={()=>setDraft(null)}>{t(de,'Edit details','Angaben bearbeiten')}</Button>
    </div>;
  }
  return <form onSubmit={submit} className="concise-enquiry" noValidate aria-busy={busy} aria-label={allowKindChoice?t(de,'Sample and technical enquiry','Muster- und technische Anfrage'):t(de,'Contact enquiry','Kontaktanfrage')}>
    <h2>{allowKindChoice?t(de,'Your enquiry.','Ihre Anfrage.'):t(de,'Send us your brief.','Beschreiben Sie Ihr Vorhaben.')}</h2>
    <fieldset disabled={busy}>
      <legend className="sr-only">{t(de,'Required project and contact details','Erforderliche Projekt- und Kontaktdaten')}</legend>
      <div className="concise-enquiry-grid">
        {(['name','company','email','country'] as Field[]).map(field=><label htmlFor={fieldId(field)} key={field}>{labels[field]} *<input id={fieldId(field)} name={field} value={values[field]} onChange={event=>update(field,event.target.value)} type={field==='email'?'email':'text'} required minLength={field==='email'?undefined:2} maxLength={field==='email'?180:field==='company'?150:field==='country'?80:100} autoComplete={field==='name'?'name':field==='company'?'organization':field==='email'?'email':'country-name'} aria-invalid={!!errors[field]} aria-describedby={errors[field]?fieldId(`${field}-error`):undefined}/>{errors[field]&&<span className="concise-field-error" id={fieldId(`${field}-error`)}>{errors[field]}</span>}</label>)}
        {allowKindChoice&&<label htmlFor={fieldId('kind')}>{t(de,'Enquiry','Anfrage')}<select id={fieldId('kind')} name="kind" value={kind} onChange={event=>{setKind(event.target.value as Kind);setError('')}}><option value="samples">{t(de,'Physical samples','Physische Muster')}</option><option value="technical">{t(de,'Technical advice','Technische Beratung')}</option></select></label>}
        <label htmlFor={fieldId('application')}>{t(de,'Application','Anwendung')}<select id={fieldId('application')} name="application" value={application} onChange={event=>setApplication(event.target.value)}><option value="other">{t(de,'Other / to discuss','Andere / zu besprechen')}</option>{applications.map(item=><option key={item.id} value={item.id}>{item.name[locale]}</option>)}</select></label>
      </div>
      <label className="enquiry-message" htmlFor={fieldId('details')}>{labels.details} *<textarea id={fieldId('details')} name="details" value={values.details} onChange={event=>update('details',event.target.value)} required minLength={10} maxLength={3000} rows={5} placeholder={t(de,'What are you working on?','Woran arbeiten Sie?')} aria-invalid={!!errors.details} aria-describedby={errors.details?fieldId('details-error'):undefined}/>{errors.details&&<span className="concise-field-error" id={fieldId('details-error')}>{errors.details}</span>}</label>
      <label className="honey" aria-hidden="true" htmlFor={fieldId('website')}>Website<input id={fieldId('website')} name="website" tabIndex={-1} autoComplete="off"/></label>
      <label className="concise-service-check" htmlFor={fieldId('ack')}><input id={fieldId('ack')} type="checkbox" checked={ack} onChange={event=>{setAck(event.target.checked);setErrors(current=>({...current,serviceAcknowledgement:undefined}));setError('')}} required aria-invalid={!!errors.serviceAcknowledgement} aria-describedby={errors.serviceAcknowledgement?fieldId('ack-error'):undefined}/><span>{serverPersistence?t(de,'Local demo storage only. No message is sent.','Nur lokale Demo-Speicherung. Kein Nachrichtenversand.'):t(de,'Email draft only. I send it from my email app.','Nur ein E-Mail-Entwurf. Ich sende ihn im E-Mail-Programm.')} <Link href={`/${locale}/legal`} target="_blank" rel="noopener noreferrer" aria-label={t(de,'Privacy information (opens in a new tab)','Datenschutzinformationen (öffnet neuen Tab)')}>{t(de,'Privacy','Datenschutz')}</Link></span></label>
      {errors.serviceAcknowledgement&&<p className="concise-field-error" id={fieldId('ack-error')}>{errors.serviceAcknowledgement}</p>}
      {error&&<div className="concise-form-error" role="alert" tabIndex={-1} ref={errorRef}><p>{error}</p></div>}
      <div className="concise-enquiry-action"><Button className="btn" type="submit" disabled={busy}>{busy?<LoaderCircle size={17} className="journey-spinner" aria-hidden="true"/>:<ArrowUpRight size={17} aria-hidden="true"/>}{busy?t(de,'Saving…','Wird gespeichert…'):serverPersistence?t(de,'Save demo enquiry','Demo-Anfrage speichern'):t(de,'Prepare email draft','E-Mail-Entwurf vorbereiten')}</Button><p>{serverPersistence?t(de,'Saved locally for review.','Lokal zur Prüfung gespeichert.'):t(de,'Review first. Nothing is sent automatically.','Erst prüfen. Kein automatischer Versand.')}</p></div>
    </fieldset>
  </form>;
}
