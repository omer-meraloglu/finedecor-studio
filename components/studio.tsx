'use client';
import {useCallback,useEffect,useId,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {useRouter,useSearchParams} from 'next/navigation';
import {ArrowUpRight,Bookmark,Check,RotateCcw,ZoomIn,ZoomOut,Save,Share2,Download,Layers,Copy,Link2,Search,X,Undo2,Redo2,Maximize2,Minimize2,ArrowLeftRight,MoveLeft,MoveRight,MoveUp,MoveDown,Info,Plus,PanelTop,LayoutGrid,Armchair,Table2,Sun,Sunrise,Lamp,ChevronDown} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from '@/components/ui/dialog';
import {Switch} from '@/components/ui/switch';
import {Checkbox} from '@/components/ui/checkbox';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Button,Input,Choice,api,text as t} from './controls';
import {useLibrary} from './library';
import {defaultProject,getVariant,getDecor,getFinish,materials,filterCatalog} from '@/lib/catalog';
import {projectSchema} from '@/lib/validation';
import {supportsAccent,cloneProject,activeVariantIds,retainReferenceIds,assignMaterial,changeScene as sceneProject,setComparison,cameraPreset,createHistory,commitHistory,undoHistory,redoHistory} from '@/lib/studio-state';
import {buildStudyExport} from '@/lib/study-export';
import type {Project} from '@/lib/model';
import './studio.css';

const SceneView=dynamic(()=>import('./scene-view'),{ssr:false,loading:()=> <div className="scene-loading" role="status"><Layers size={25}/><span>3D…</span></div>});
type Target='fronts'|'accent'|'compare';
type SavedProject=Project & {id:string;createdAt:string};
type FullscreenMode='native'|'viewport'|null;
function freshProject(scene:Project['scene']='kitchen'):Project{return {...cloneProject(defaultProject),scene,camera:cameraPreset(scene,'perspective')}}
function fields(p:Project):Project{return {name:p.name,variantIds:p.variantIds,assignments:p.assignments,scene:p.scene,light:p.light,camera:p.camera,compareId:p.compareId}}
function equal(a:Project|null,b:Project){return a!==null&&JSON.stringify(a)===JSON.stringify(b)}

export default function Studio({locale,initialId,embedded=false,shareToken}:{locale:'en'|'de';initialId?:string;embedded?:boolean;shareToken?:string}){
  const de=locale==='de',lib=useLibrary(),router=useRouter(),params=useSearchParams(),queryVariant=params.get('variant');
  const [p,setP]=useState<Project>(()=>freshProject(embedded?'panel':'kitchen')),[target,setTarget]=useState<Target>('fronts');
  const [mode,setMode]=useState<'2d'|'3d'>('2d'),[failed,setFailed]=useState(false);
  const [fullscreen,setFullscreen]=useState<FullscreenMode>(null),[fullscreenBusy,setFullscreenBusy]=useState(false),[fullscreenStatus,setFullscreenStatus]=useState('');
  const [filter,setFilter]=useState('all'),[q,setQ]=useState(''),[busy,setBusy]=useState<'save'|'share'|'revoke'|null>(null),[error,setError]=useState('');
  const [savedId,setSavedId]=useState<string|null>(null),[savedState,setSavedState]=useState<Project|null>(null),[savedList,setSavedList]=useState<SavedProject[]>([]);
  const [shareOpen,setShareOpen]=useState(false),[shareAck,setShareAck]=useState(false),[shareUrl,setShareUrl]=useState(''),[exportHtml,setExportHtml]=useState(''),[helpOpen,setHelpOpen]=useState(false);
  const [loaded,setLoaded]=useState(!shareToken),[missing,setMissing]=useState<string[]>([]),[announcement,setAnnouncement]=useState(''),[historyVersion,setHistoryVersion]=useState(0),[nameDraft,setNameDraft]=useState(p.name);
  const pRef=useRef(p),revision=useRef(0),history=useRef(createHistory(p)),references=useRef<string[]>([]),restored=useRef(false),live=useRef(true);
  const requestedAt=useRef(0),capture=useRef<(()=>string)|null>(null),search=useRef<HTMLInputElement>(null),workspace=useRef<HTMLDivElement>(null);
  const fullscreenMode=useRef<FullscreenMode>(null),fullscreenOrigin=useRef<HTMLElement|null>(null),fullscreenExit=useRef<HTMLButtonElement>(null),restoreFullscreenFocus=useRef(true),fullscreenFocusFrame=useRef<number|null>(null),fullscreenRequest=useRef(0),fullscreenWanted=useRef(false),fullscreenTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const dirty=!equal(savedState,p)||nameDraft.trim()!==p.name,active=activeVariantIds(p),selectedId=target==='compare'?p.compareId:target==='accent'?(p.assignments.accent||p.assignments.fronts):p.assignments.fronts;
  const selected=getVariant(selectedId||p.assignments.fronts)!,front=getVariant(p.assignments.fronts)!;
  const list=filterCatalog(lib.items,q,filter),extra=p.variantIds.filter(id=>!active.includes(id));
  const can3d=active.every(id=>{const v=getVariant(id);return !!v?.materialId&&materials.some(m=>m.id===v.materialId&&m.variantIds.includes(id))});
  const currentIdentity=useRef({savedId,dirty,revision:revision.current});currentIdentity.current={savedId,dirty,revision:revision.current};pRef.current=p;
  const sceneNames={panel:t(de,'Front panel','Frontplatte'),kitchen:t(de,'Kitchen','Küche'),unit:t(de,'Furniture unit','Möbeleinheit'),table:t(de,'Table','Tisch')};
  const targetName=(value:Target)=>value==='compare'?t(de,'B · Comparison','B · Vergleich'):value==='accent'?t(de,'Accent front','Akzentfront'):p.scene==='table'?t(de,'A · Tabletop','A · Tischplatte'):t(de,'A · Main fronts','A · Hauptfronten');
  const surfaceName=(id:string)=>{const v=getVariant(id)!;return `${getDecor(v).name} / ${getFinish(v).name}`};
  const referenceIds=()=>references.current;
  const libraryScrollHint=useId(),libraryScroll=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(libraryScroll.current)libraryScroll.current.scrollTop=0},[q,filter]);

  useEffect(()=>{live.current=true;return()=>{live.current=false}},[]);
  function restore(next:Project,id:string|null){
    restored.current=true;revision.current++;pRef.current=next;setP(next);setNameDraft(next.name);history.current=createHistory(next);setHistoryVersion(v=>v+1);
    references.current=next.variantIds.filter(x=>!activeVariantIds(next).includes(x));setTarget('fronts');setSavedId(id);setSavedState(id?cloneProject(next):null);setError('');setShareUrl('');setShareAck(false);setShareOpen(false);setExportHtml('');
  }
  useEffect(()=>{
    let mounted=true;
    if(shareToken){
      setLoaded(false);
      api('shares/'+shareToken).then(d=>{
        if(!mounted)return;setMissing(d.missingVariantIds||[]);const state=projectSchema.safeParse(fields(d));
        if(!state.success){setMissing(d.variantIds||[]);throw Error(t(de,'Some materials in this shared study are unavailable.','Einige Materialien dieser Studie sind nicht verfügbar.'))}
        restore(state.data,d.id);setLoaded(true);
      }).catch(e=>{if(mounted)setError(e.message)});
      return()=>{mounted=false};
    }
    if(!lib.ready)return;
    const id=initialId||queryVariant;
    if(id){
      if(getVariant(id)){const next={...freshProject(embedded?'panel':'kitchen'),variantIds:[id],assignments:{fronts:id}};restore(next,null)}
      else{restore(freshProject(embedded?'panel':'kitchen'),null);setError(t(de,'The requested surface is unavailable. Choose a source reference below.','Die gewünschte Oberfläche ist nicht verfügbar. Wählen Sie eine Quellenreferenz.'))}
    }else if(!restored.current){
      const state=projectSchema.safeParse(lib.project);
      if(state.success)restore(state.data,lib.projectId);else restore(freshProject(embedded?'panel':'kitchen'),null);
    }
    if(!embedded&&lib.serverPersistence)api('projects').then(d=>{if(mounted)setSavedList(d.projects)}).catch(()=>{if(mounted)setError(t(de,'Saved studies could not be loaded. Your device draft remains available.','Gespeicherte Studien konnten nicht geladen werden. Ihr Geräteentwurf bleibt verfügbar.'))});
    return()=>{mounted=false};
    // Restore once after device storage is ready; edits must not retrigger restoration.
  },[lib.ready,initialId,queryVariant,shareToken]);
  useEffect(()=>{
    if(!restored.current||shareToken||embedded)return;
    lib.setProject({...p,name:nameDraft.trim()||p.name});const id=dirty?null:savedId;if(lib.projectId!==id)lib.setProjectId(id);
  },[p,nameDraft,dirty,savedId,shareToken,embedded]);
  useEffect(()=>{
    // An explicit surface link is an intent to inspect it in 3D, even after a 2D visit.
    const requested=initialId||queryVariant;
    if(lib.ready&&!shareToken&&(embedded||(requested&&getVariant(requested))||lib.studioMode==='3d'))enable3d();
  },[lib.ready,initialId,queryVariant,shareToken,embedded]);
  useEffect(()=>{setShareUrl('');setShareAck(false);setShareOpen(false);setExportHtml('')},[savedId,dirty]);
  useEffect(()=>{if(!can3d&&mode==='3d'){setMode('2d');if(!embedded)lib.setStudioMode('2d')}},[can3d,mode]);
  useEffect(()=>{
    const el=workspace.current;if(!el)return;
    const changed=()=>{
      if(document.fullscreenElement===el){if(!fullscreenWanted.current){void document.exitFullscreen().catch(()=>{});return}if(fullscreenTimer.current!==null)clearTimeout(fullscreenTimer.current);updateFullscreen('native');setFullscreenBusy(false);setFullscreenStatus('');focusFullscreenExit()}
      else if(fullscreenMode.current==='native'){fullscreenWanted.current=false;updateFullscreen(null);setFullscreenBusy(false);if(restoreFullscreenFocus.current)restoreFullscreenButton();restoreFullscreenFocus.current=true}
    };
    document.addEventListener('fullscreenchange',changed);
    return()=>{fullscreenRequest.current++;fullscreenWanted.current=false;if(fullscreenTimer.current!==null)clearTimeout(fullscreenTimer.current);document.removeEventListener('fullscreenchange',changed);if(fullscreenFocusFrame.current!==null)cancelAnimationFrame(fullscreenFocusFrame.current);if(document.fullscreenElement===el)void document.exitFullscreen().catch(()=>{})};
  },[loaded]);
  useEffect(()=>{
    const el=workspace.current;if(!fullscreen||!el)return;
    // A fixed fallback needs the same keyboard isolation as native fullscreen.
    // Restore every existing inert/scroll state when leaving or navigating.
    const isolated:HTMLElement[]=[];
    for(let branch:HTMLElement|null=el;branch?.parentElement&&branch.parentElement!==document.documentElement;branch=branch.parentElement){
      for(const sibling of Array.from(branch.parentElement.children)){if(sibling!==branch&&sibling instanceof HTMLElement&&!sibling.inert){sibling.inert=true;isolated.push(sibling)}}
    }
    const oldOverflow=document.body.style.overflow,hadClass=document.body.classList.contains('fd-studio-fullscreen');
    document.body.style.overflow='hidden';document.body.classList.add('fd-studio-fullscreen');
    const keydown=(e:KeyboardEvent)=>{
      // Handle Escape ourselves as well as listening for native changes. Some
      // embedded browsers exit their top layer before dispatching that event.
      if(e.key==='Escape'&&fullscreenMode.current){e.preventDefault();void leaveFullscreen();return}
      if(e.key!=='Tab')return;
      const controls=Array.from(el.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')).filter(control=>control.tabIndex>=0&&control.getClientRects().length>0&&!control.closest('[inert]'));
      if(!controls.length)return;
      const first=controls[0],last=controls[controls.length-1],activeElement=document.activeElement;
      if(e.shiftKey&&(activeElement===first||!el.contains(activeElement))){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&(activeElement===last||!el.contains(activeElement))){e.preventDefault();first.focus()}
    };
    const keyup=(e:KeyboardEvent)=>{if(e.key==='Escape'&&fullscreenMode.current==='native'&&document.fullscreenElement!==el)void leaveFullscreen()};
    document.addEventListener('keydown',keydown,true);document.addEventListener('keyup',keyup,true);
    return()=>{isolated.forEach(sibling=>{sibling.inert=false});document.body.style.overflow=oldOverflow;if(!hadClass)document.body.classList.remove('fd-studio-fullscreen');document.removeEventListener('keydown',keydown,true);document.removeEventListener('keyup',keyup,true)};
  },[fullscreen]);

  function updateFullscreen(next:FullscreenMode){fullscreenMode.current=next;setFullscreen(next)}
  function focusFullscreenExit(){
    if(fullscreenFocusFrame.current!==null)cancelAnimationFrame(fullscreenFocusFrame.current);
    fullscreenFocusFrame.current=requestAnimationFrame(()=>{fullscreenFocusFrame.current=null;fullscreenExit.current?.focus({preventScroll:true})});
  }
  function restoreFullscreenButton(){
    if(fullscreenFocusFrame.current!==null)cancelAnimationFrame(fullscreenFocusFrame.current);
    fullscreenFocusFrame.current=requestAnimationFrame(()=>{fullscreenFocusFrame.current=null;if(fullscreenOrigin.current?.isConnected)fullscreenOrigin.current.focus({preventScroll:true})});
  }
  async function leaveFullscreen(restoreFocus=true):Promise<boolean>{
    const el=workspace.current;restoreFullscreenFocus.current=restoreFocus;fullscreenWanted.current=false;fullscreenRequest.current++;if(fullscreenTimer.current!==null)clearTimeout(fullscreenTimer.current);
    if(el&&document.fullscreenElement===el){
      try{await document.exitFullscreen()}catch{if(live.current)setFullscreenStatus(t(de,'Use Escape or the browser fullscreen control to leave this view.','Mit Escape oder der Vollbildsteuerung des Browsers diese Ansicht verlassen.'));return false}
    }
    if(!live.current)return false;
    updateFullscreen(null);setFullscreenBusy(false);setFullscreenStatus('');if(restoreFocus)restoreFullscreenButton();return true;
  }
  async function toggleFullscreen(event:React.MouseEvent<HTMLButtonElement>){
    if(fullscreenMode.current){await leaveFullscreen();return}
    const el=workspace.current;if(!el||fullscreenBusy)return;
    fullscreenOrigin.current=event.currentTarget;restoreFullscreenFocus.current=true;fullscreenWanted.current=true;setFullscreenBusy(true);const request=++fullscreenRequest.current;
    fullscreenTimer.current=setTimeout(()=>{if(!live.current||request!==fullscreenRequest.current||document.fullscreenElement===el)return;updateFullscreen('viewport');setFullscreenBusy(false);setFullscreenStatus(t(de,'The browser has not opened fullscreen. This view fills the browser window.','Der Browser hat Vollbild nicht geöffnet. Diese Ansicht füllt das Browserfenster.'));focusFullscreenExit()},2000);
    try{
      if(!el.requestFullscreen||document.fullscreenEnabled===false)throw Error('Fullscreen unavailable');
      // This call remains in the explicit click activation; no preparatory await.
      await el.requestFullscreen({navigationUI:'hide'});
      if(!live.current||request!==fullscreenRequest.current)return;
      if(document.fullscreenElement!==el)throw Error('Fullscreen not entered');
      updateFullscreen('native');setFullscreenStatus('');focusFullscreenExit();
    }catch{
      if(!live.current||request!==fullscreenRequest.current)return;
      updateFullscreen('viewport');setFullscreenStatus(t(de,'Browser fullscreen is unavailable. This view fills the browser window.','Browser-Vollbild ist nicht verfügbar. Diese Ansicht füllt das Browserfenster.'));focusFullscreenExit();
    }finally{if(request===fullscreenRequest.current){if(fullscreenTimer.current!==null)clearTimeout(fullscreenTimer.current);if(live.current)setFullscreenBusy(false)}}
  }
  async function openHelp(event:React.MouseEvent<HTMLButtonElement>){
    const trigger=event.currentTarget;if(!await leaveFullscreen(false)||!live.current)return;
    // Radix portals to body. Exit first, then keep its close-focus return on Help.
    requestAnimationFrame(()=>{if(!live.current)return;trigger.focus({preventScroll:true});setHelpOpen(true)});
  }

  function mutate(next:Project,record=true){
    if(equal(pRef.current,next))return;
    restored.current=true;revision.current++;pRef.current=next;setP(next);setError('');
    if(record){history.current=commitHistory(history.current,next);setHistoryVersion(v=>v+1)}
  }
  function applyStudyChange(build:()=>Project,nextReferences:readonly string[]=referenceIds()):boolean{
    try{
      // Commit reference bookkeeping only after the complete project validates.
      // A rejected addition must leave both the draft and its next edit usable.
      const next=build();references.current=[...nextReferences];mutate(next);return true;
    }catch(e){
      setError(e instanceof Error&&e.message==='A study supports up to 12 variants'
        ?t(de,'A study can contain up to 12 surface references. Remove a retained reference before adding another surface or comparison. Your study has not changed.','Eine Studie kann bis zu 12 Oberflächenreferenzen enthalten. Entfernen Sie eine zusätzliche Referenz, bevor Sie eine weitere Oberfläche oder einen Vergleich hinzufügen. Ihre Studie bleibt unverändert.')
        :t(de,'This surface could not be assigned. Your study has not changed.','Diese Oberfläche konnte nicht zugewiesen werden. Ihre Studie bleibt unverändert.'));
      return false;
    }
  }
  function choose(id:string){const nextReferences=references.current.filter(x=>x!==id);if(applyStudyChange(()=>assignMaterial(pRef.current,target,id,nextReferences),nextReferences))setAnnouncement(`${targetName(target)}: ${surfaceName(id)}`)}
  function changeScene(scene:Project['scene']){if(scene===p.scene)return;setTarget('fronts');mutate(sceneProject(pRef.current,scene,referenceIds()));setAnnouncement(sceneNames[scene])}
  function historyStep(direction:'undo'|'redo'){
    history.current=direction==='undo'?undoHistory(history.current):redoHistory(history.current);setHistoryVersion(v=>v+1);
    const next=cloneProject(history.current.present);setNameDraft(next.name);references.current=next.variantIds.filter(id=>!activeVariantIds(next).includes(id));
    if(!supportsAccent(next.scene)&&target==='accent'||!next.compareId&&target==='compare')setTarget('fronts');mutate(next,false);
    setAnnouncement(t(de,direction==='undo'?'Last change undone':'Change restored',direction==='undo'?'Letzte Änderung rückgängig':'Änderung wiederhergestellt'));
  }
  const onCamera=useCallback((camera:Project['camera'],phase?:'start'|'end')=>{const next={...pRef.current,camera};if(equal(pRef.current,next))return;revision.current++;pRef.current=next;setP(next);if(phase!=='start'){history.current=commitHistory(history.current,next);setHistoryVersion(v=>v+1)}},[]);
  const onCapture=useCallback((fn:(()=>string)|null)=>{capture.current=fn},[]);
  const fail3d=useCallback(()=>{setFailed(true);setMode('2d');lib.setStudioMode('2d')},[]);
  function enable3d(){
    if(!can3d){lib.message(t(de,'A selected surface has no 3D asset. Use its source reference.','Für eine gewählte Oberfläche fehlt ein 3D-Asset. Nutzen Sie die Quellenreferenz.'));return}
    requestedAt.current=performance.now();
    try{const gl=document.createElement('canvas').getContext('webgl2');if(!gl)throw Error();gl.getExtension('WEBGL_lose_context')?.loseContext();setFailed(false);setMode('3d');if(!embedded&&!shareToken)lib.setStudioMode('3d')}
    catch{setFailed(true);setMode('2d');lib.message(t(de,'3D is unavailable. All selection and project tools still work in 2D.','3D ist nicht verfügbar. Auswahl und Projektwerkzeuge funktionieren in 2D.'))}
  }
  function setPreview(next:'2d'|'3d'){if(next==='3d')enable3d();else{setMode('2d');if(!embedded&&!shareToken)lib.setStudioMode('2d')}}
  function comparisonToggle(on:boolean){
    if(!on){mutate(setComparison(p,null,referenceIds()));if(target==='compare')setTarget('fronts');return}
    const pair=lib.items.find(v=>v.decorId===front.decorId&&v.finishId!==front.finishId)||lib.items.find(v=>v.id!==front.id);
    if(pair&&applyStudyChange(()=>setComparison(p,pair.id,referenceIds()))){setTarget('compare');setAnnouncement(t(de,'Choose surface B from the library.','Wählen Sie Oberfläche B aus der Bibliothek.'))}
  }
  function swap(){if(!p.compareId)return;const next={...p,assignments:{...p.assignments,fronts:p.compareId},compareId:p.assignments.fronts};mutate(retainReferenceIds(next,referenceIds()))}
  function zoom(factor:number){const c=pRef.current.camera,delta=c.position.map((v,i)=>v-c.target[i]),distance=Math.hypot(...delta),scale=Math.max(1.4,Math.min(11,distance*factor))/distance;mutate({...pRef.current,camera:{...c,position:delta.map((v,i)=>c.target[i]+v*scale) as [number,number,number]}})}
  function orbit(horizontal:number,vertical=0){const c=pRef.current.camera,[x,y,z]=c.position.map((v,i)=>v-c.target[i]),r=Math.hypot(x,y,z),theta=Math.atan2(x,z)+horizontal,phi=Math.max(.12,Math.min(Math.PI/2,Math.acos(y/r)+vertical));mutate({...pRef.current,camera:{...c,position:[c.target[0]+r*Math.sin(phi)*Math.sin(theta),c.target[1]+r*Math.cos(phi),c.target[2]+r*Math.sin(phi)*Math.cos(theta)]}})}
  function keyboard(e:React.KeyboardEvent<HTMLDivElement>){
    if(mode!=='3d'||e.target!==e.currentTarget)return;
    const actions:Record<string,()=>void>={ArrowLeft:()=>orbit(-Math.PI/12),ArrowRight:()=>orbit(Math.PI/12),ArrowUp:()=>orbit(0,-Math.PI/18),ArrowDown:()=>orbit(0,Math.PI/18),'+':()=>zoom(.85),'=':()=>zoom(.85),'-':()=>zoom(1.15),'0':()=>mutate({...pRef.current,camera:cameraPreset(pRef.current.scene,'perspective')})};
    if(actions[e.key]){e.preventDefault();actions[e.key]()}
  }
  async function refreshProjects(){const d=await api('projects');if(live.current)setSavedList(d.projects)}
  async function save(){
    if(!lib.serverPersistence){if(nameDraft.trim()){const kept=lib.setProject({...cloneProject(pRef.current),name:nameDraft.trim()});lib.message(kept?t(de,'Study kept privately on this device. Server snapshots and share links are unavailable in this hosted review.','Studie privat auf diesem Gerät behalten. Server-Stände und Freigabelinks sind in dieser gehosteten Vorschau nicht verfügbar.'):t(de,'Device storage is unavailable. Your study is held only for this visit.','Gerätespeicher ist nicht verfügbar. Ihre Studie bleibt nur für diesen Besuch erhalten.'))}return}
    if(busy)return;if(!nameDraft.trim()){setError(t(de,'Give the study a name before saving.','Geben Sie der Studie vor dem Speichern einen Namen.'));return}setBusy('save');setError('');const version=revision.current,snapshot={...cloneProject(pRef.current),name:nameDraft.trim()};
    try{const saved=await api('projects',snapshot);if(!live.current)return;
      if(revision.current===version){setP(snapshot);pRef.current=snapshot;setNameDraft(snapshot.name);setSavedId(saved.id);setSavedState(snapshot);lib.setProject(snapshot);lib.setProjectId(saved.id);lib.message(t(de,'Private snapshot saved in this local preview.','Privater Stand in dieser lokalen Vorschau gespeichert.'))}
      else lib.message(t(de,'Snapshot saved. Your newer changes remain in the device draft.','Stand gespeichert. Neuere Änderungen bleiben im Geräteentwurf.'));
      await refreshProjects();
    }catch(e){if(live.current&&revision.current===version)setError((e as Error).message)}finally{if(live.current)setBusy(null)}
  }
  async function share(){
    if(busy||!savedId||dirty||!shareAck)return;const id=savedId,version=revision.current;setBusy('share');setError('');
    try{const d=await api(`projects/${id}/share`,{acknowledgeVisible:true});if(!live.current||currentIdentity.current.savedId!==id||revision.current!==version||currentIdentity.current.dirty)return;
      setShareUrl(`${location.origin}/${locale}/shared/${d.token}`);lib.message(t(de,'Share link created for this saved snapshot.','Freigabelink für diesen gespeicherten Stand erstellt.'));
    }catch(e){if(live.current&&currentIdentity.current.savedId===id)setError((e as Error).message)}finally{if(live.current)setBusy(null)}
  }
  async function revoke(){
    if(busy||!savedId)return;const id=savedId;setBusy('revoke');
    try{await api(`projects/${id}/revoke`,{});if(live.current&&currentIdentity.current.savedId===id){setShareUrl('');lib.message(t(de,'All links to this saved snapshot were revoked.','Alle Links zu diesem gespeicherten Stand wurden widerrufen.'))}}
    catch(e){if(live.current&&currentIdentity.current.savedId===id)setError((e as Error).message)}finally{if(live.current)setBusy(null)}
  }
  function exportStudy(){if(!savedId||dirty)return;try{setExportHtml(buildStudyExport({project:p,projectId:savedId,locale,previewDataUrl:mode==='3d'?capture.current?.()||null:null,enquiryId:lib.projectId===savedId?lib.enquiryId:null}))}catch{setError(t(de,'The preview could not be captured. Switch to 2D and export again.','Die Vorschau konnte nicht erfasst werden. Wechseln Sie zu 2D und exportieren Sie erneut.'))}}
  function downloadStudy(){if(!exportHtml||!savedId)return;const url=URL.createObjectURL(new Blob([exportHtml],{type:'text/html'})),a=document.createElement('a');a.href=url;a.download=`fine-decor-study-${savedId.slice(0,8)}.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function addShortlist(){const nextReferences=Array.from(new Set([...references.current,...lib.shortlist.filter(id=>!active.includes(id))]));if(applyStudyChange(()=>retainReferenceIds(pRef.current,nextReferences),nextReferences))setAnnouncement(t(de,'Shortlisted references added to this study.','Gemerkte Referenzen zur Studie hinzugefügt.'))}
  function removeReference(id:string){references.current=references.current.filter(x=>x!==id);mutate(retainReferenceIds(p,referenceIds()))}
  async function requestSamples(){const ids=[...p.variantIds];if(!await leaveFullscreen(false)||!live.current)return;router.push(`/${locale}/request?variants=${ids.join(',')}`)}
  function selectAssignment(slot:Target){setTarget(slot);if(window.matchMedia('(max-width:960px)').matches){const el=workspace.current?.querySelector<HTMLElement>('.studio-library');el?.focus({preventScroll:true});el?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'})}}
  function newStudy(){references.current=[];setSavedId(null);setSavedState(null);setNameDraft(freshProject().name);setTarget('fronts');mutate(freshProject());setAnnouncement(t(de,'New private study started. Undo can restore your last draft.','Neue private Studie gestartet. Zurück stellt den letzten Entwurf wieder her.'))}
  const presetActive=(preset:Project['camera']['preset'])=>{const c=cameraPreset(p.scene,preset);return c.position.every((v,i)=>Math.abs(v-p.camera.position[i])<.0001)&&c.target.every((v,i)=>Math.abs(v-p.camera.target[i])<.0001)};
  const customView=!(['perspective','front','detail'] as const).some(presetActive);
  const stageSurfaces:[Target,string][]=[['fronts',p.assignments.fronts],...(p.compareId?[['compare',p.compareId] as [Target,string]]:[])];
  if(shareToken&&!loaded)return <div className="page-wrap empty"><h1>{error?t(de,'Shared study unavailable.','Geteilte Studie nicht verfügbar.'):t(de,'Opening the shared study…','Geteilte Studie wird geöffnet…')}</h1><p role="status">{error}</p>{missing.length>0&&<p>{t(de,'Unavailable references','Nicht verfügbare Referenzen')}: {missing.join(', ')}</p>}<Link className="btn" href={`/${locale}/studio`}>{t(de,'Open my studio','Mein Studio öffnen')}</Link></div>;
  return <div className={`studio-page studio-v2 ${embedded?'embedded':''}`} data-history-version={historyVersion}>
    <div className="studio-heading"><div><span className="eyebrow">{embedded?t(de,'SURFACE PREVIEW','OBERFLÄCHENVORSCHAU'):'FINE DECOR / MATERIAL STUDIO'}</span><h1>{t(de,'Give your surface a setting.','Geben Sie Ihrer Oberfläche einen Raum.')}</h1><p>{t(de,'Explore a finish. Compare a direction. Keep a considered study.','Finish entdecken. Ideen vergleichen. Eine durchdachte Studie speichern.')}</p></div>
      {!embedded&&<div className="studio-top-actions">{!shareToken?<><Button variant="outline" onClick={save} disabled={!!busy||(lib.serverPersistence&&!dirty&&nameDraft.trim()===p.name)}><Save size={17}/>{!lib.serverPersistence?t(de,'Keep on device','Auf Gerät behalten'):busy==='save'?t(de,'Saving…','Wird gespeichert…'):dirty?t(de,'Save privately','Privat speichern'):t(de,'Snapshot saved','Stand gespeichert')}</Button><Button className="btn" onClick={requestSamples}>{t(de,'Request samples','Muster anfragen')}<ArrowUpRight size={16}/></Button></>:<Button className="btn" onClick={()=>{lib.setProject(cloneProject(p));lib.setProjectId(null);router.push(`/${locale}/studio`)}}><Copy size={16}/>{t(de,'Make a private copy','Private Kopie erstellen')}</Button>}</div>}
    </div>
    {shareToken&&<p className="studio-status-banner">{t(de,'Shared snapshot · edits are temporary until you make a private copy.','Geteilter Stand · Änderungen bleiben temporär, bis Sie eine private Kopie erstellen.')}</p>}
    {error&&<p className="form-error studio-error" role="alert">{error}</p>}
    <div className={`studio-workspace ${fullscreen?`fullscreen fullscreen-${fullscreen}`:''}`} ref={workspace} role={fullscreen?'dialog':undefined} aria-modal={fullscreen?true:undefined} aria-label={fullscreen?t(de,'Material Studio fullscreen workspace','Material Studio Vollbild-Arbeitsbereich'):undefined} data-fullscreen={fullscreen||'off'}>
      {fullscreen&&<div className="studio-fullscreen-header"><div><strong>Fine Decor · Material Studio</strong><small>{p.name}</small></div><div className="fullscreen-header-actions">{!embedded&&!shareToken&&<Button variant="outline" onClick={save} disabled={!!busy||!dirty}><Save size={16}/>{!lib.serverPersistence?t(de,'Keep on device','Auf Gerät behalten'):busy==='save'?t(de,'Saving…','Wird gespeichert…'):t(de,'Save','Speichern')}</Button>}<Button ref={fullscreenExit} variant="outline" onClick={()=>void leaveFullscreen()}><Minimize2 size={17}/>{t(de,'Exit fullscreen','Vollbild verlassen')}</Button></div><p className="fullscreen-status" role="status">{fullscreenStatus||t(de,'Escape exits this view. Your study stays intact.','Escape beendet diese Ansicht. Ihre Studie bleibt erhalten.')}</p><output className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</output>{error&&<p className="form-error" role="alert">{error}</p>}</div>}
      <div className="studio-main">
        <div className="scene-toolbar"><Tabs value={p.scene} onValueChange={v=>changeScene(v as Project['scene'])}><TabsList aria-label={t(de,'Reference scene','Referenzszene')}><TabsTrigger value="panel"><PanelTop size={16}/>{sceneNames.panel}</TabsTrigger><TabsTrigger value="kitchen"><LayoutGrid size={16}/>{sceneNames.kitchen}</TabsTrigger><TabsTrigger value="unit"><Armchair size={16}/>{sceneNames.unit}</TabsTrigger><TabsTrigger value="table"><Table2 size={16}/>{sceneNames.table}</TabsTrigger></TabsList></Tabs><div className="mode-controls" role="group" aria-label={t(de,'Preview mode','Vorschaumodus')}><Button aria-pressed={mode==='2d'} variant="ghost" onClick={()=>setPreview('2d')}>2D</Button><Button aria-pressed={mode==='3d'} variant="ghost" onClick={()=>setPreview('3d')} disabled={!can3d}>3D<Layers size={15}/></Button><Button variant="ghost" onClick={toggleFullscreen} disabled={fullscreenBusy} aria-pressed={!!fullscreen} aria-label={fullscreen?t(de,'Exit fullscreen','Vollbild verlassen'):t(de,'Enter fullscreen','Vollbild öffnen')}>{fullscreen?<Minimize2 size={17}/>:<Maximize2 size={17}/>}</Button></div></div>
        <div className={`viewer ${p.compareId?'comparison':''}`} tabIndex={mode==='3d'?0:undefined} role="group" aria-label={t(de,'Interactive preview. Arrow keys rotate; plus and minus zoom; zero resets.','Interaktive Vorschau. Pfeiltasten drehen; Plus und Minus zoomen; Null setzt zurück.')} onKeyDown={keyboard}>
          <div className="viewer-labels">{stageSurfaces.map(([slot,id])=><button key={slot} onClick={()=>setTarget(slot)} aria-pressed={target===slot}><span className="surface-letter">{slot==='fronts'?'A':'B'}</span><span>{surfaceName(id)}<small>{getDecor(getVariant(id)!).code}</small></span></button>)}</div>
          {mode==='3d'?<SceneView requestedAt={requestedAt.current} project={p} onCamera={onCamera} onCapture={onCapture} onFailure={fail3d} de={de}/>:<div className="two-d-view">{stageSurfaces.map(([slot,id])=>{const v=getVariant(id)!;return <figure key={slot}><img src={v.swatch} alt={`${getDecor(v).name} ${getFinish(v).name} ${t(de,'source swatch','Quellmuster')}`} width="400" height="400"/><figcaption>{t(de,'Source swatch · appearance is indicative','Quellmuster · Darstellung ist indikativ')}</figcaption></figure>})}<div className="intent-overlay"><span>{failed?t(de,'3D unavailable. Your study is preserved.','3D nicht verfügbar. Ihre Studie bleibt erhalten.'):!can3d?t(de,'No 3D asset for this selection.','Kein 3D-Asset für diese Auswahl.'):t(de,'See the surface in context.','Die Oberfläche im Kontext sehen.')}</span>{can3d&&<Button className="btn" onClick={enable3d}>{failed?t(de,'Retry 3D','3D erneut laden'):t(de,'Load interactive 3D','Interaktive 3D-Vorschau laden')}<Layers size={17}/></Button>}</div></div>}
          {p.compareId&&<span className="compare-seam" aria-hidden="true"/>}
          <div className="viewer-note">{t(de,'Illustrative preview — verify with a physical sample','Illustrative Vorschau — mit physischem Muster prüfen')}</div>
        </div>
        <div className="camera-toolbar"><div className="camera-buttons">{(['perspective','front','detail'] as const).map(preset=><Button key={preset} disabled={mode!=='3d'} aria-pressed={presetActive(preset)} variant="ghost" onClick={()=>mutate({...p,camera:cameraPreset(p.scene,preset)})}>{preset==='perspective'?t(de,'Perspective','Perspektive'):preset==='front'?t(de,'Front','Front'):t(de,'Detail','Detail')}</Button>)}{mode==='3d'&&customView&&<span className="custom-view">{t(de,'Custom view','Eigene Ansicht')}</span>}</div><div className="camera-icons"><Button variant="ghost" disabled={mode!=='3d'} aria-label={t(de,'Zoom in','Vergrößern')} onClick={()=>zoom(.85)}><ZoomIn size={18}/></Button><Button variant="ghost" disabled={mode!=='3d'} aria-label={t(de,'Zoom out','Verkleinern')} onClick={()=>zoom(1.15)}><ZoomOut size={18}/></Button><Button variant="ghost" disabled={mode!=='3d'} aria-label={t(de,'Reset view','Ansicht zurücksetzen')} onClick={()=>mutate({...p,camera:cameraPreset(p.scene,'perspective')})}><RotateCcw size={17}/></Button></div></div>
        <details className="studio-rotation"><summary>{t(de,'Rotate view','Ansicht drehen')}<ChevronDown size={14}/></summary><div className="orbit-buttons" role="group" aria-label={t(de,'Rotate view','Ansicht drehen')}><Button variant="ghost" disabled={mode!=='3d'} onClick={()=>orbit(-Math.PI/12)} aria-label={t(de,'Rotate left','Nach links drehen')}><MoveLeft size={18}/></Button><Button variant="ghost" disabled={mode!=='3d'} onClick={()=>orbit(Math.PI/12)} aria-label={t(de,'Rotate right','Nach rechts drehen')}><MoveRight size={18}/></Button><Button variant="ghost" disabled={mode!=='3d'} onClick={()=>orbit(0,-Math.PI/18)} aria-label={t(de,'Rotate up','Nach oben drehen')}><MoveUp size={18}/></Button><Button variant="ghost" disabled={mode!=='3d'} onClick={()=>orbit(0,Math.PI/18)} aria-label={t(de,'Rotate down','Nach unten drehen')}><MoveDown size={18}/></Button></div><p>{t(de,'Or focus the preview and use the arrow keys.','Oder die Vorschau fokussieren und Pfeiltasten verwenden.')}</p></details>
        <div className="studio-lightbar"><span className="control-caption">{t(de,'LIGHT','LICHT')}</span><div role="group" aria-label={t(de,'Lighting presets','Lichtvoreinstellungen')}>{([['neutral',t(de,'Studio','Studio'),Sun],['daylight',t(de,'Daylight','Tageslicht'),Sunrise],['warm',t(de,'Warm','Warm'),Lamp]] as const).map(([light,label,Icon])=><Button key={light} variant="ghost" disabled={mode!=='3d'} aria-pressed={p.light===light} onClick={()=>mutate({...p,light})}><Icon size={16}/>{label}</Button>)}</div><div className="compare-toggle"><label htmlFor={`compare-${embedded?'embedded':'main'}`}>{t(de,'Compare A / B','A / B vergleichen')}</label><Switch id={`compare-${embedded?'embedded':'main'}`} checked={!!p.compareId} onCheckedChange={comparisonToggle}/></div>{p.compareId&&<Button variant="ghost" onClick={swap} aria-label={t(de,'Swap surfaces A and B','Oberflächen A und B tauschen')}><ArrowLeftRight size={17}/></Button>}</div>
        <p className="comparison-note">{!p.compareId?t(de,'Use A / B to compare under the same scene, camera and lighting.','A / B vergleicht bei gleicher Szene, Kamera und Beleuchtung.'):p.compareId===front.id?t(de,'A and B are the same variant. Choose a different surface to compare.','A und B sind dieselbe Variante. Wählen Sie eine andere Oberfläche.'):t(de,'A and B share the same scene, camera and lighting. Explicit accent assignments stay fixed.','A und B nutzen dieselbe Szene, Kamera und Beleuchtung. Separat zugewiesene Akzentfronten bleiben gleich.')}</p>
        <div className="assignment-strip" role="group" aria-label={t(de,'Current mesh assignments','Aktuelle Materialzuordnung')}>{([['fronts',p.assignments.fronts],...(supportsAccent(p.scene)?[['accent',p.assignments.accent||p.assignments.fronts]]:[]),...(p.compareId?[['compare',p.compareId]]:[])] as [Target,string][]).map(([slot,id])=><button key={slot} aria-pressed={target===slot} onClick={()=>selectAssignment(slot)}><img src={getVariant(id)!.swatch} width="36" height="36" alt=""/><span><small>{targetName(slot)}{slot==='accent'&&!p.assignments.accent?` · ${t(de,'follows A','wie A')}`:''}</small>{surfaceName(id)}</span><ChevronDown size={14}/></button>)}</div>
        <div className="studio-utility"><div className="history-controls"><Button variant="ghost" disabled={!history.current.past.length} aria-label={t(de,'Undo last change','Letzte Änderung rückgängig')} onClick={()=>historyStep('undo')}><Undo2 size={17}/>{t(de,'Undo','Zurück')}</Button><Button variant="ghost" disabled={!history.current.future.length} aria-label={t(de,'Redo change','Änderung wiederherstellen')} onClick={()=>historyStep('redo')}><Redo2 size={17}/>{t(de,'Redo','Wiederholen')}</Button></div><Button variant="ghost" onClick={openHelp}><Info size={16}/>{t(de,'Controls & accuracy','Steuerung & Genauigkeit')}</Button></div>
      </div>
      <aside className="studio-library" tabIndex={-1} aria-label={t(de,'Surface library','Oberflächenbibliothek')}>
        <div className="library-heading"><span className="eyebrow">{t(de,'SURFACE LIBRARY','OBERFLÄCHENBIBLIOTHEK')}</span><span>{lib.items.length}</span></div>
        <div className="target-control"><span className="control-caption">{t(de,'APPLY TO','ZUWEISEN ZU')}</span><div role="group" aria-label={t(de,'Material target','Materialziel')}><button aria-pressed={target==='fronts'} onClick={()=>setTarget('fronts')}>{p.scene==='table'?t(de,'A · Top','A · Platte'):t(de,'A · Fronts','A · Fronten')}</button>{supportsAccent(p.scene)&&<button aria-pressed={target==='accent'} onClick={()=>setTarget('accent')}>{t(de,'Accent','Akzent')}</button>}{p.compareId&&<button aria-pressed={target==='compare'} onClick={()=>setTarget('compare')}>{t(de,'B · Compare','B · Vergleich')}</button>}</div><small>{t(de,'Choose a swatch to apply it here.','Ein Muster wählen, um es hier zuzuweisen.')}</small></div>
        <div className="search"><Search size={16} aria-hidden="true"/><Input ref={search} aria-label={t(de,'Search studio surfaces','Studio-Oberflächen suchen')} maxLength={80} value={q} onChange={e=>setQ(e.target.value)} placeholder={t(de,'Decor name or code','Dekorname oder Code')}/>{q&&<Button variant="ghost" aria-label={t(de,'Clear surface search','Oberflächensuche leeren')} onClick={()=>{setQ('');search.current?.focus()}}><X size={16}/></Button>}</div>
        <Tabs value={filter} onValueChange={setFilter}><TabsList aria-label={t(de,'Filter finishes','Oberflächen filtern')}><TabsTrigger value="all">{t(de,'All finishes','Alle Finishes')}</TabsTrigger><TabsTrigger value="frosted">Frosted</TabsTrigger><TabsTrigger value="gloss">Gloss</TabsTrigger></TabsList></Tabs>
        <div className="studio-library-results"><p className="studio-result-count" role="status">{list.length} {t(de,list.length===1?'surface':'surfaces',list.length===1?'Oberfläche':'Oberflächen')}{q.trim()?` · “${q.trim()}”`:''}</p><span id={libraryScrollHint}>{t(de,'Scroll to explore','Scrollen zum Entdecken')}<ChevronDown size={13} aria-hidden="true"/></span></div>
        <div className="studio-library-scroll" ref={libraryScroll} role="region" aria-label={t(de,'Scrollable surface library','Scrollbare Oberflächenbibliothek')} aria-describedby={libraryScrollHint} tabIndex={0}>
          <div className="studio-swatches" role="group" aria-label={t(de,'Surface selection','Oberflächenauswahl')}>{list.map(v=><button key={v.id} aria-pressed={selected.id===v.id} onClick={()=>choose(v.id)} className={selected.id===v.id?'selected':''}><img src={v.swatch} alt="" width="110" height="75" loading="lazy"/><span>{getDecor(v).name}<small>{getDecor(v).code} · {getFinish(v).name}</small></span>{selected.id===v.id&&<Check size={14}/>}</button>)}</div>
          {!list.length&&<div className="studio-empty"><p>{t(de,'No matching surfaces.','Keine passenden Oberflächen.')}</p><Button variant="outline" onClick={()=>{setQ('');setFilter('all');search.current?.focus()}}>{t(de,'Reset filters','Filter zurücksetzen')}</Button></div>}
        </div>
        <div className="active-material"><span className="eyebrow">{targetName(target)}</span><h3>{getDecor(selected).name}</h3><p>{getDecor(selected).code} · {getFinish(selected).name}</p><dl><div><dt>{t(de,'Variant','Variante')}</dt><dd>{selected.id}</dd></div><div><dt>{t(de,'Family','Familie')}</dt><dd>{t(de,'Pending owner approval','Eigentümerfreigabe ausstehend')}</dd></div><div><dt>{t(de,'3D asset','3D-Asset')}</dt><dd>{materials.some(m=>m.id===selected.materialId&&m.variantIds.includes(selected.id))?t(de,'Illustrative · uncalibrated','Illustrativ · unkalibriert'):t(de,'2D only','Nur 2D')}</dd></div></dl><Button variant="outline" onClick={()=>lib.toggle(selected.id)} aria-pressed={lib.shortlist.includes(selected.id)}>{lib.shortlist.includes(selected.id)?<Check size={16}/>:<Bookmark size={16}/>} {lib.shortlist.includes(selected.id)?t(de,'In shortlist','Auf der Merkliste'):t(de,'Add to shortlist','Zur Merkliste')}</Button><Link className="text-link" href={`/${locale}/products/${selected.id}`}>{t(de,'Surface details & source','Details & Quelle')}<ArrowUpRight size={16}/></Link></div>
        <p className="micro">{t(de,`${lib.items.length} source-listed demo references. Every source swatch has an illustrative colour and finish preview in 3D. Verify with physical samples.`,`${lib.items.length} Demo-Referenzen aus der Quelle. Jedes Quellmuster hat eine illustrative Farb- und Finish-Vorschau in 3D. Mit physischen Mustern prüfen.`)}</p>
      </aside>
    </div>
    {!embedded&&<section className="study-panel" aria-labelledby="study-heading"><div className="study-header"><div><span className="eyebrow">{shareToken?t(de,'SHARED SURFACE STUDY','GETEILTE OBERFLÄCHENSTUDIE'):t(de,'YOUR PRIVATE STUDY','IHRE PRIVATE STUDIE')}</span><h2 id="study-heading">{t(de,'Keep the idea together.','Die Idee zusammenhalten.')}</h2></div><span className={`study-status ${dirty?'draft':''}`}><span/>{!lib.serverPersistence?t(de,'Private device draft','Privater Geräteentwurf'):shareToken?t(de,'Shared snapshot','Geteilter Stand'):dirty?t(de,'Device draft · unsaved snapshot','Geräteentwurf · Stand ungespeichert'):t(de,'Private snapshot saved','Privater Stand gespeichert')}</span></div>
      <div className="project-bar"><div><label htmlFor="project-name">{t(de,'Project name','Projektname')}</label><Input id="project-name" maxLength={80} required value={nameDraft} onChange={e=>{revision.current++;setNameDraft(e.target.value)}} onBlur={()=>{if(nameDraft.trim()){mutate({...pRef.current,name:nameDraft.trim()});setNameDraft(nameDraft.trim())}}}/><p className="micro">{!lib.serverPersistence?t(de,'Your draft stays private on this device. Sharing and server exports require persistent storage.','Ihr Entwurf bleibt privat auf diesem Gerät. Freigabe und Server-Exporte benötigen dauerhaften Speicher.'):savedId?`${t(de,'Snapshot','Stand')} ${savedId.slice(0,8)}${dirty?` · ${t(de,'newer edits on this device','neuere Änderungen auf diesem Gerät')}`:''}`:t(de,'The draft stays on this device. Save a private snapshot to share or export.','Der Entwurf bleibt auf diesem Gerät. Privat speichern, um ihn zu teilen oder zu exportieren.')}</p></div><div className="project-actions">{!shareToken&&<Button variant="ghost" onClick={newStudy}><Plus size={16}/>{t(de,'New study','Neue Studie')}</Button>}<Button variant="outline" disabled={!lib.serverPersistence||!savedId||dirty||!!shareToken||!!busy} onClick={()=>setShareOpen(true)}><Share2 size={16}/>{t(de,'Share','Teilen')}</Button><Button variant="outline" disabled={!lib.serverPersistence||!savedId||dirty} onClick={exportStudy}><Download size={16}/>{t(de,'Export study','Studie exportieren')}</Button>{lib.serverPersistence&&savedId&&!shareToken&&<Button variant="ghost" disabled={!!busy} onClick={revoke}><Link2 size={16}/>{t(de,'Revoke links','Links widerrufen')}</Button>}</div></div>
      <div className="study-surfaces"><div className="study-surface-heading"><h3>{t(de,'Surfaces in this study','Oberflächen dieser Studie')} <span>{p.variantIds.length}</span></h3>{!shareToken&&<Button variant="ghost" onClick={addShortlist} disabled={!lib.shortlist.some(id=>!p.variantIds.includes(id))}><Plus size={16}/>{t(de,'Add shortlist references','Merkliste als Referenzen ergänzen')}</Button>}</div><div className="study-cards">{p.variantIds.map(id=>{const v=getVariant(id)!;return <article key={id}><img src={v.swatch} width="52" height="52" alt=""/><div><strong>{getDecor(v).name}</strong><small>{getDecor(v).code} · {getFinish(v).name}</small><span>{active.includes(id)?t(de,'Assigned / comparison','Zugewiesen / Vergleich'):t(de,'Retained reference','Zusätzliche Referenz')}</span></div>{!active.includes(id)&&<Button variant="ghost" aria-label={`${t(de,'Remove reference','Referenz entfernen')} ${surfaceName(id)}`} onClick={()=>removeReference(id)}><X size={16}/></Button>}</article>})}</div><p className="micro">{t(de,`Only these ${p.variantIds.length} IDs are saved in the study. ${extra.length} retained references. Study IDs travel into the enquiry; your shortlist stays on this device.`, `Nur diese ${p.variantIds.length} IDs werden in der Studie gespeichert. ${extra.length} zusätzliche Referenzen. Studien-IDs werden in die Anfrage übernommen; Ihre Merkliste bleibt auf diesem Gerät.`)}</p></div>
      {lib.serverPersistence&&!!savedList.length&&!shareToken&&<Choice label={t(de,'Open a saved snapshot','Gespeicherten Stand öffnen')} value={!dirty&&savedId?savedId:'none'} onChange={id=>{const saved=savedList.find(x=>x.id===id);if(!saved)return;const state=projectSchema.safeParse(fields(saved));if(!state.success){setError(t(de,'This snapshot contains unavailable variants.','Dieser Stand enthält nicht verfügbare Varianten.'));return}restore(state.data,id)}} options={[["none",t(de,'Choose a saved study','Gespeicherte Studie wählen')],...savedList.map(x=>[x.id,`${x.name} · ${x.id.slice(0,8)}`] as [string,string])]}/>}
      {lib.storageStatus&&<p role="status" className="micro">{lib.storageStatus}</p>}
    </section>}
    <p className="studio-substrate-note">{t(de,'The material is decorative surface film. Furniture and reference edges are visualization substrates; they establish no application or forming capability.','Das Material ist Dekorfolie. Möbel und Referenzkanten dienen der Visualisierung; sie bestätigen keine Anwendungs- oder Verformungseignung.')}</p>
    <output className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</output>
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}><DialogContent><DialogHeader><DialogTitle>{t(de,'A clearer way to explore','Oberflächen klarer erkunden')}</DialogTitle><DialogDescription>{t(de,'Choose a scene, assign a surface and compare under the same light.','Szene wählen, Oberfläche zuweisen und bei gleichem Licht vergleichen.')}</DialogDescription></DialogHeader><p>{t(de,'Drag to orbit, scroll or pinch to zoom. Select A, Accent or B before choosing a swatch. Accent follows A until you assign it separately.','Ziehen zum Drehen, Scrollen oder Pinchen zum Zoomen. Vor der Musterwahl A, Akzent oder B auswählen. Der Akzent folgt A, bis er separat zugewiesen wird.')}</p><p>{t(de,'Keyboard: focus the preview and use arrow keys to rotate, + / − to zoom and 0 to reset. All commands also have buttons.','Tastatur: Vorschau fokussieren, Pfeiltasten zum Drehen, + / − zum Zoomen und 0 zum Zurücksetzen. Alle Befehle haben auch Schaltflächen.')}</p><div className="orbit-buttons" role="group" aria-label={t(de,'Rotate view','Ansicht drehen')}><Button variant="outline" disabled={mode!=='3d'} onClick={()=>orbit(-Math.PI/12)} aria-label={t(de,'Rotate left','Nach links drehen')}><MoveLeft size={18}/></Button><Button variant="outline" disabled={mode!=='3d'} onClick={()=>orbit(Math.PI/12)} aria-label={t(de,'Rotate right','Nach rechts drehen')}><MoveRight size={18}/></Button><Button variant="outline" disabled={mode!=='3d'} onClick={()=>orbit(0,-Math.PI/18)} aria-label={t(de,'Rotate up','Nach oben drehen')}><MoveUp size={18}/></Button><Button variant="outline" disabled={mode!=='3d'} onClick={()=>orbit(0,Math.PI/18)} aria-label={t(de,'Rotate down','Nach unten drehen')}><MoveDown size={18}/></Button></div><p className="demo-note">{t(de,'Frosted and Gloss use illustrative PBR settings. No measured texture maps, exact colour matching or processing suitability are established. Source swatches are 2D references. Verify with a physical sample.','Frosted und Gloss nutzen illustrative PBR-Einstellungen. Keine gemessenen Textur-Maps, exakte Farbübereinstimmung oder Verarbeitungseignung bestätigt. Quellmuster dienen als 2D-Referenzen. Mit einem physischen Muster prüfen.')}</p></DialogContent></Dialog>
    <Dialog open={!!exportHtml} onOpenChange={open=>{if(!open)setExportHtml('')}}><DialogContent style={{maxWidth:'min(920px, calc(100vw - 32px))'}}><DialogHeader><DialogTitle>{t(de,'Your surface study','Ihre Oberflächenstudie')}</DialogTitle><DialogDescription>{t(de,'A dated, printable record of this saved snapshot and its limitations.','Ein datierter, druckbarer Nachweis dieses gespeicherten Stands und seiner Grenzen.')}</DialogDescription></DialogHeader><iframe title={t(de,'Project summary preview','Vorschau der Projektübersicht')} srcDoc={exportHtml} sandbox="" style={{width:'100%',height:'min(55vh, 600px)',border:'1px solid #d9ddd0',background:'#fff'}}/><DialogFooter><Button className="btn" onClick={downloadStudy}>{t(de,'Download study','Studie herunterladen')}<Download size={16}/></Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={shareOpen} onOpenChange={open=>{if(busy!=='share')setShareOpen(open)}}><DialogContent><DialogHeader><DialogTitle>{t(de,'Share this saved snapshot','Diesen gespeicherten Stand teilen')}</DialogTitle><DialogDescription>{t(de,'Anyone with the link sees the project name, variant IDs, assignments, scene, light and camera. Keep confidential information out of the name. Contact and enquiry data stay private.','Jeder mit dem Link sieht Projektname, Varianten-IDs, Zuordnungen, Szene, Licht und Kamera. Keine vertraulichen Informationen im Namen verwenden. Kontakt- und Anfragedaten bleiben privat.')}</DialogDescription></DialogHeader><p>{t(de,'Local links work while this preview is reachable, expire after 30 days and can be revoked.','Lokale Links funktionieren, solange diese Vorschau erreichbar ist. Sie laufen nach 30 Tagen ab und können widerrufen werden.')}</p><div className="consent-check"><Checkbox id="share-ack" checked={shareAck} onCheckedChange={v=>setShareAck(v===true)}/><label htmlFor="share-ack">{t(de,'I understand what becomes visible.','Ich verstehe, was sichtbar wird.')}</label></div>{shareUrl&&<div className="share-result"><Input readOnly aria-label={t(de,'Share link','Freigabelink')} value={shareUrl}/><Button variant="outline" onClick={()=>navigator.clipboard.writeText(shareUrl).then(()=>lib.message(t(de,'Link copied','Link kopiert'))).catch(()=>lib.message(t(de,'Select and copy the link manually.','Link manuell auswählen und kopieren.')))}><Copy size={15}/>{t(de,'Copy link','Link kopieren')}</Button></div>}<DialogFooter><Button disabled={!shareAck||!!busy||!!shareUrl} onClick={share}>{busy==='share'?t(de,'Creating link…','Link wird erstellt…'):t(de,'Create local link','Lokalen Link erstellen')}<Share2 size={15}/></Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
