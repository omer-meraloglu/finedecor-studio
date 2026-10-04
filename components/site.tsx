'use client';
import {useEffect,useRef,useState} from 'react';
import Link,{useLinkStatus} from 'next/link';
import {ArrowUpRight,Bookmark,Menu,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLibrary} from './library';
import {useSectionMotion} from './motion';
import Home from './home';
import {Catalog,Product,ApplicationsPage,Shortlist,RequestForm,Knowledge,Company,Contact,Legal,Missing,StudioPage} from './pages';
import Studio from './studio';
import Admin from './admin';
import LabMetrics from './metrics';

function PendingHint(){const {pending}=useLinkStatus();return <span aria-hidden="true" className={`nav-pending ${pending?'pending':''}`}/>}
export default function Site({locale,path}:{locale:'en'|'de';path:string[]}){
  const de=locale==='de',page=path[0]||'',route=`/${locale}/${path.join('/')}`;
  const [menu,setMenu]=useState(false),[scrolled,setScrolled]=useState(false);
  const {shortlist,storageStatus,serverPersistence}=useLibrary();
  const header=useRef<HTMLElement>(null),menuButton=useRef<HTMLButtonElement>(null),progress=useRef<HTMLSpanElement>(null),previousRoute=useRef(route);
  const link=(p:string)=>`/${locale}/${p}`;
  useSectionMotion(route);
  useEffect(()=>{
    document.documentElement.lang=locale;
    setMenu(false);
    if(previousRoute.current!==route){document.getElementById('main')?.focus({preventScroll:true});previousRoute.current=route}
  },[locale,route,page]);
  useEffect(()=>{
    let frame=0;
    const update=()=>{frame=0;setScrolled(window.scrollY>24);if(header.current)header.current.style.setProperty('--menu-height',`${Math.max(100,window.innerHeight-header.current.getBoundingClientRect().bottom)}px`);const range=document.documentElement.scrollHeight-window.innerHeight;if(progress.current)progress.current.style.transform=`scaleX(${range>0?Math.min(1,window.scrollY/range):0})`};
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
    update();window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll)};
  },[route]);
  useEffect(()=>{
    if(!menu)return;
    const focusFrame=requestAnimationFrame(()=>{if(document.activeElement===menuButton.current)header.current?.querySelector<HTMLAnchorElement>('nav a')?.focus({preventScroll:true})});
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setMenu(false);menuButton.current?.focus()}};
    const outside=(event:Event)=>{if(!header.current?.contains(event.target as Node))setMenu(false)};
    const media=window.matchMedia('(min-width:1201px)');
    const resize=()=>{if(media.matches)setMenu(false)};
    document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);media.addEventListener('change',resize);
    return ()=>{cancelAnimationFrame(focusFrame);document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);media.removeEventListener('change',resize)};
  },[menu]);
  useEffect(()=>{
    const ctx=(document as any).modelContext;if(!ctx?.registerTool)return;
    const life=new AbortController();
    Promise.resolve(ctx.registerTool({name:'search_surface_catalog',description:'Read the verified demo catalog by decor name or code; returns source-referenced variants with approval state.',inputSchema:{type:'object',properties:{query:{type:'string',maxLength:80}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:true},async execute(input:any){if(!input||typeof input.query!=='string'||input.query.length>80||Object.keys(input).length!==1)throw Error('A query up to 80 characters is required');const response=await fetch('/api/catalog?q='+encodeURIComponent(input.query));if(!response.ok)throw Error('Catalog unavailable');const data=await response.json();return {variants:data.variants,mode:data.mode}}},{signal:life.signal})).catch(()=>{});
    return ()=>life.abort();
  },[]);
  const props={locale,path};
  const content=page==='collections'?<Catalog {...props}/>:page==='products'?<Product {...props}/>:page==='applications'?<ApplicationsPage {...props}/>:page==='studio'?<StudioPage {...props}/>:page==='shortlist'?<Shortlist {...props}/>:page==='request'?<RequestForm {...props}/>:page==='knowledge'?<Knowledge {...props}/>:page==='company'?<Company {...props}/>:page==='contact'?<Contact {...props}/>:page==='legal'?<Legal {...props}/>:page==='accessibility'?<Legal {...props} accessibility/>:page==='admin'?(serverPersistence?<Admin locale={locale}/>:<div className="page-wrap"><h1>{de?'Redaktion in der lokalen Vorschau':'Content review in the local preview'}</h1><p>{de?'Die gehostete Vorschau enthält keinen schreibbaren Redaktionsspeicher.':'This hosted review has no writable content store.'}</p></div>):page==='shared'?<Studio locale={locale} shareToken={path[1]}/>:page===''?<Home locale={locale}/>:<Missing {...props}/>;
  const navigation=[['collections',de?'Kollektionen':'Collections'],['applications',de?'Anwendungen':'Applications'],['studio','Material Studio'],['knowledge',de?'Wissen':'Knowledge'],['company',de?'Unternehmen':'Company'],['contact',de?'Kontakt':'Contact']];
  return <>
    <a className="skip" href="#main">{de?'Zum Inhalt':'Skip to content'}</a>
    <div className="notice">{serverPersistence?(de?'Lokale Vorschau · Materialien und Anfragen zur Prüfung':'Local preview · materials and enquiries for review'):(de?'Gehostete Vorschau · Quellenmaterialien · private Geräteentwürfe':'Hosted review · source materials · private device drafts')}</div>
    <header ref={header} className={`site-header ${scrolled?'is-scrolled':''}`}>
      <Link href={link('')} className="brand" aria-label={de?'Fine Decor Startseite':'Fine Decor home'}><img src="/media/logo.png" alt="Fine Decor" width="171" height="66"/></Link>
      <nav id="primary-navigation" aria-label={de?'Hauptnavigation':'Main navigation'} className={menu?'open':''}>
        {navigation.map(([p,n])=><Link key={p} href={link(p)} prefetch aria-current={page===p?'page':undefined} onNavigate={()=>setMenu(false)}>{n}<PendingHint/></Link>)}
        <div className="mobile-nav-extra"><Link href={link('shortlist')} onNavigate={()=>setMenu(false)}><Bookmark size={17}/>{de?'Merkliste':'Shortlist'}<span>{shortlist.length}</span></Link></div>
      </nav>
      <div className="header-actions">
        <Link href={`/${de?'en':'de'}/${path.join('/')}`} className="locale" hrefLang={de?'en':'de'} aria-label={de?'Switch to English':'Auf Deutsch wechseln'}>{de?'EN':'DE'}</Link>
        <Link href={link('shortlist')} className="icon" aria-label={`${de?'Merkliste':'Shortlist'} (${shortlist.length})`}><Bookmark size={20}/>{shortlist.length>0&&<span className="count">{shortlist.length}</span>}</Link>
        <Link className="btn small" href={link('request')}>{de?'Muster anfragen':'Request samples'}<ArrowUpRight size={17}/></Link>
        <Button ref={menuButton} className="menu" variant="ghost" aria-controls="primary-navigation" aria-label={menu?(de?'Menü schließen':'Close menu'):(de?'Menü öffnen':'Open menu')} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</Button>
      </div>
      <span className="reading-progress" ref={progress} aria-hidden="true"/>
    </header>
    <LabMetrics/>
    <main id="main" tabIndex={-1}>{storageStatus&&<p className="connection-notice" role="status">{storageStatus}</p>}<div className="route-content" key={route}>{content}</div></main>
    <footer>
      <div><img src="/media/logo.png" alt="Fine Decor" width="140"/><p>{de?'PET-Dekoroberflächen.':'PET decorative surfaces.'}<br/>{de?'Eine Grundlage für Ihr nächstes Projekt.':'A considered foundation for your next project.'}</p></div>
      <div><Link href={link('contact')}>{de?'Kontakt':'Contact'}</Link><Link href={link('company')}>{de?'Unternehmen und Karriere':'Company & careers'}</Link><Link href={link('legal')}>{de?'Rechtliches und Datenschutz':'Legal & privacy'}</Link><Link href={link('accessibility')}>{de?'Barrierefreiheit':'Accessibility'}</Link><Link href={link('admin')} prefetch={false}>{de?'Redaktionsbereich':'Content review'}</Link></div>
      <div><p>Aurea 21 · 59302 Oelde · Germany</p><a href="mailto:info@finedecor.de">info@finedecor.de</a><a href="tel:+492522937970">+49 2522 937 97 0</a><p>© Fine Decor · {serverPersistence?(de?'Lokale Entwicklungsvorschau':'Local development preview'):(de?'Gehostete Entwicklungsvorschau':'Hosted development preview')}</p></div>
    </footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'Fine Decor',url:'https://www.finedecor.de/'})}}/>
  </>;
}
