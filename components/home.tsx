'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,ArrowRight,Layers,Bookmark,Scan,MessageSquare,ChevronLeft,ChevronRight} from 'lucide-react';
import {news,getVariant} from '@/lib/catalog';
import {FamilyOverview,CustomConsultation} from './production-content';
import './home.css';

export default function Home({locale}:{locale:'en'|'de'}){
  const de=locale==='de',link=(p:string)=>`/${locale}/${p}`;
  const [photoIndex,setPhotoIndex]=useState(0);
  const photographs=[
    {src:'/media/kitchen.jpg',width:800,height:551,label:de?'Im Raum':'In context',caption:de?'FARBE IM KONTEXT':'COLOUR IN CONTEXT',alt:de?'Küche mit anthrazitfarbenen Möbelfronten, von der öffentlichen Fine Decor Website':'Kitchen with charcoal furniture fronts, from the Fine Decor public website'},
    {src:'/media/film.jpg',width:750,height:647,label:de?'Material':'Material',caption:de?'MATERIAL AUS DER NÄHE':'MATERIAL, UP CLOSE',alt:de?'Gestapelte Materialtafeln in warmen Natur-, Weiß- und Dunkeltönen aus einem Fine Decor Quellenbild':'Layered material panels in warm neutral, white and dark tones from a Fine Decor source photograph'},
    {src:'/media/production-rolls.jpg',width:800,height:551,label:de?'Produktion':'Production',caption:de?'EIN BLICK IN DIE PRODUKTION':'A PRODUCTION PERSPECTIVE',alt:de?'Folienrolle auf einer Maschine aus einem Quellenbild der öffentlichen Fine Decor Website':'Roll of film on machinery in a source photograph from the Fine Decor public website'}
  ];
  const photo=photographs[photoIndex];
  const steps=[
    {number:'01',icon:Scan,title:de?'Eine Oberfläche entdecken':'Find your surface',copy:de?'Dekor und Finish ansehen. Quellen und Freigabestatus prüfen.':'Explore decor and finish. Check the source and approval status.',href:'collections',cta:de?'Bibliothek ansehen':'Browse the library'},
    {number:'02',icon:Bookmark,title:de?'Im Kontext vergleichen':'See it in context',copy:de?'Varianten vergleichen und eine private Projektstudie speichern.':'Compare variants and keep your choices in a private project study.',href:'studio',cta:de?'Studie beginnen':'Start a surface study'},
    {number:'03',icon:MessageSquare,title:de?'Mit einem Muster prüfen':'Make it tangible',copy:de?'Eine Muster- oder technische Anfrage mit den gewählten IDs vorbereiten.':'Prepare a sample or technical enquiry with the IDs you selected.',href:'request',cta:de?'Anfrage vorbereiten':'Prepare an enquiry'}
  ];
  return <div className="fine-home">
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span/> {de?'DEKORATIVE OBERFLÄCHEN. INDUSTRIELL GEDACHT.':'DECORATIVE SURFACES. INDUSTRIALLY CONSIDERED.'}</div>
        <h1>{de?'Oberflächen für':'Surfaces for'}<br/><em>{de?'neue Perspektiven.':'what comes next.'}</em></h1>
        <p>{de?'PET-Dekorfolien für die Möbelindustrie. Entdecken Sie Farbe, erkunden Sie Oberflächen und bringen Sie Ihr nächstes Projekt in Form.':'PET decorative films for the furniture industry. Discover colour, explore finishes and give your next project a new perspective.'}</p>
        <div className="button-row"><Link className="btn" href={link('collections')}>{de?'Kollektionen entdecken':'Explore collections'}<ArrowUpRight size={19}/></Link><Link className="text-link" href={link('studio')}>{de?'Im Studio visualisieren':'Open Material Studio'}<ArrowRight size={18}/></Link></div>
        <div className="hero-note">{de?'FÜR DESIGNER. FÜR HERSTELLER. SEIT 2004.':'FOR DESIGNERS. FOR MANUFACTURERS. SINCE 2004.'}</div>
      </div>
      <div className="hero-gallery">
        <figure className="hero-image" id="home-hero-photograph"><img key={photo.src} className="home-photo-change" src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} fetchPriority={photoIndex===0?'high':'auto'}/><figcaption aria-live="polite" aria-atomic="true"><span>{photo.caption}</span><span>{de?'Fine Decor Quellenbild · Dekor nicht zugeordnet':'Fine Decor source imagery · decor unassigned'}</span></figcaption></figure>
        <div className="hero-gallery-controls" role="group" aria-label={de?'Fine Decor Bilder auswählen':'Choose Fine Decor imagery'}>
          <div className="hero-image-choices">{photographs.map((item,index)=><button key={item.src} type="button" aria-pressed={photoIndex===index} aria-controls="home-hero-photograph" onClick={()=>setPhotoIndex(index)}><span aria-hidden="true">0{index+1}</span>{item.label}</button>)}</div>
          <div className="hero-gallery-arrows"><button type="button" aria-label={de?'Vorheriges Bild':'Previous image'} aria-controls="home-hero-photograph" onClick={()=>setPhotoIndex(index=>(index+photographs.length-1)%photographs.length)}><ChevronLeft size={18}/></button><button type="button" aria-label={de?'Nächstes Bild':'Next image'} aria-controls="home-hero-photograph" onClick={()=>setPhotoIndex(index=>(index+1)%photographs.length)}><ChevronRight size={18}/></button></div>
        </div>
      </div>
    </section>
    <section className="home-intro">
      <div><span className="eyebrow">01 / {de?'DIE MATERIALBIBLIOTHEK':'THE MATERIAL LIBRARY'}</span><h2>{de?'Eine Oberfläche.':'One surface.'}<br/>{de?'Viele Möglichkeiten.':'Many possibilities.'}</h2></div>
      <p>{de?'Eine Oberfläche spricht Auge und Tastsinn an. Fine Decor entwickelt Farben und Dekore mit Impulsen aus den Sinnen und den Ideen seiner Kunden.':'A surface speaks to sight and touch. Fine Decor develops colours and decors with inspiration from the senses and its customers’ ideas.'}</p>
      <Link className="text-link" href={link('collections')}>{de?'Alle Oberflächen ansehen':'View the surfaces'}<ArrowUpRight size={20}/></Link>
    </section>
    <section className="starter-surfaces" aria-label={de?'Ausgewählte Quellenreferenzen':'Selected source references'}>
      {['373','255','425'].map(code=>{const variant=getVariant(`demo-${code}-frosted`)!;return <Link href={link('products/'+variant.id)} key={code} className="starter-card"><div className="starter-swatch"><img src={variant.swatch} width="200" height="200" alt="" loading="lazy"/><span className="starter-index">{code} / FROSTED</span><span className="starter-explore"><ArrowUpRight size={22}/></span></div><span>{code==='373'?'OliveGreen':code==='255'?'Kaschmir':'SlateGrey'}<small>{de?'Quellenreferenz · Demo':'Source reference · demo'}</small></span></Link>})}
    </section>
    <FamilyOverview locale={locale}/>
    <section className="studio-teaser">
      <div><span className="eyebrow">02 / MATERIAL STUDIO</span><h2>{de?'Sehen. Vergleichen.':'See it. Compare it.'}<br/>{de?'Weiterdenken.':'Make it yours.'}</h2><p>{de?'Betrachten Sie Oberflächen in vier einfachen Referenzszenen. Speichern Sie Ihre Auswahl und fordern Sie ein physisches Muster an.':'Explore surfaces in four simple reference scenes. Keep your choices together, then request a physical sample.'}</p><div className="teaser-features"><span>{de?'4 Referenzszenen':'4 reference scenes'}</span><span>{de?'Gleiche Vergleichsbedingungen':'Consistent comparison'}</span><span>{de?'Privat gespeichert':'Saved privately'}</span></div><Link className="btn" href={link('studio')}>{de?'Studio öffnen':'Enter the studio'}<Layers size={19}/></Link></div>
      <figure className="teaser-detail"><img src="/media/film.jpg" alt={de?'Gestapelte Materialtafeln in warmen Natur-, Weiß- und Dunkeltönen von Fine Decor':'Layered material panels in warm neutral, white and dark tones from Fine Decor'} loading="lazy" width="750" height="647"/><figcaption>{de?'Materialkontraste · Fine Decor Quellenbild':'Material contrasts · Fine Decor source imagery'}<span>{de?'Vorschau mit physischem Muster prüfen':'Verify previews with a physical sample'}</span></figcaption></figure>
    </section>
    <section className="home-evidence home-production" aria-labelledby="home-production-title">
      <div className="production-story"><span className="eyebrow">03 / {de?'MATERIAL & PRODUKTION':'MATERIALS & PRODUCTION'}</span><h2 id="home-production-title">{de?'Material als':'From material'}<br/><em>{de?'Ausgangspunkt.':'to possibility.'}</em></h2><p>{de?'Fine Decor entwickelt und produziert PET-Dekorfolien für die Möbelindustrie. Sprechen Sie mit unserem Team über Dekor, Finish und die Anforderungen Ihres Projekts.':'Fine Decor develops and produces PET decorative films for the furniture industry. Talk to our team about decor, finish and the needs of your project.'}</p><Link className="text-link" href={link('company')}>{de?'Fine Decor kennenlernen':'Meet Fine Decor'}<ArrowUpRight size={19}/></Link><figure className="production-roll-detail"><img src="/media/production-rolls.jpg" alt={de?'Detail einer Folienrolle auf Produktionsausrüstung aus einem Fine Decor Quellenbild':'Detail of a film roll on production equipment from a Fine Decor source photograph'} width="800" height="551" loading="lazy"/><figcaption>{de?'Materialrollen · Fine Decor Quellenbild':'Material rolls · Fine Decor source imagery'}</figcaption></figure></div>
      <figure className="production-main-image"><img src="/media/production.jpg" alt={de?'Zwei Personen neben Produktionsausrüstung in einem Fine Decor Quellenbild':'Two people beside production equipment in a Fine Decor source photograph'} width="850" height="567" loading="lazy"/><figcaption><span>{de?'Ein Blick hinter die Oberfläche.':'A closer look behind the surface.'}</span><small>{de?'Produktion · Fine Decor Quellenbild':'Production · Fine Decor source imagery'}</small></figcaption></figure>
    </section>
    <section className="home-process"><div className="section-heading"><div><span className="eyebrow">{de?'VON DER IDEE ZUM GESPRÄCH':'FROM FIRST IDEA TO A CONVERSATION'}</span><h2>{de?'Ein klarer nächster Schritt.':'A clear next step.'}</h2></div><p>{de?'Ihre Auswahl bleibt bei Ihnen.':'Your choices stay with you.'}</p></div><div className="process-grid">{steps.map(step=><article className="process-step" key={step.number}><div className="process-top"><span>{step.number}</span><step.icon size={23} strokeWidth={1.5}/></div><h3>{step.title}</h3><p>{step.copy}</p><Link className="text-link" href={link(step.href)}>{step.cta}<ArrowUpRight size={17}/></Link></article>)}</div></section>
    <CustomConsultation locale={locale}/>
    <section className="home-news"><div className="section-heading"><h2>{de?'Aus dem Archiv':'From the archive'}</h2><Link className="text-link" href={link('knowledge')}>{de?'Alle Quellen ansehen':'View the sources'}<ArrowUpRight size={18}/></Link></div>{news.map(n=><a className="news-row" key={n.id} href={n.source} target="_blank" rel="noreferrer"><span>{n.id==='interzum-2023'?'2023':n.date}</span><h3>{n.title[locale]}</h3><small>{de?'Archivquelle':'Archived source'}</small><ArrowUpRight size={20}/></a>)}</section>
    <section className="sample-band"><span className="eyebrow">{de?'VOM KONZEPT ZUM PHYSISCHEN MUSTER':'FROM CONCEPT TO PHYSICAL SAMPLE'}</span><h2>{de?'Die nächste Oberfläche':'Your next surface'}<br/>{de?'beginnt mit einem Gespräch.':'starts with a conversation.'}</h2><Link className="btn" href={link('request')}>{de?'Musteranfrage vorbereiten':'Prepare a sample enquiry'}<ArrowUpRight size={18}/></Link></section>
  </div>;
}
