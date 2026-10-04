'use client';
import Link from 'next/link';
import {ArrowUpRight,ArrowRight,Layers,Bookmark,Scan,MessageSquare} from 'lucide-react';
import {news,getVariant} from '@/lib/catalog';

export default function Home({locale}:{locale:'en'|'de'}){
  const de=locale==='de',link=(p:string)=>`/${locale}/${p}`;
  const steps=[
    {number:'01',icon:Scan,title:de?'Eine Oberfläche entdecken':'Find your surface',copy:de?'Dekor und Finish ansehen. Quellen und Freigabestatus prüfen.':'Explore decor and finish. Check the source and approval status.',href:'collections',cta:de?'Bibliothek ansehen':'Browse the library'},
    {number:'02',icon:Bookmark,title:de?'Im Kontext vergleichen':'See it in context',copy:de?'Varianten vergleichen und eine private Projektstudie speichern.':'Compare variants and keep your choices in a private project study.',href:'studio',cta:de?'Studie beginnen':'Start a surface study'},
    {number:'03',icon:MessageSquare,title:de?'Mit einem Muster prüfen':'Make it tangible',copy:de?'Eine Muster- oder technische Anfrage mit den gewählten IDs vorbereiten.':'Prepare a sample or technical enquiry with the IDs you selected.',href:'request',cta:de?'Anfrage vorbereiten':'Prepare an enquiry'}
  ];
  return <>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span/> {de?'DEKORATIVE OBERFLÄCHEN. INDUSTRIELL GEDACHT.':'DECORATIVE SURFACES. INDUSTRIALLY CONSIDERED.'}</div>
        <h1>{de?'Oberflächen für':'Surfaces for'}<br/><em>{de?'neue Perspektiven.':'what comes next.'}</em></h1>
        <p>{de?'PET-Dekorfolien für die Möbelindustrie. Entdecken Sie Farbe, erkunden Sie Oberflächen und bringen Sie Ihr nächstes Projekt in Form.':'PET decorative films for the furniture industry. Discover colour, explore finishes and give your next project a new perspective.'}</p>
        <div className="button-row"><Link className="btn" href={link('collections')}>{de?'Kollektionen entdecken':'Explore collections'}<ArrowUpRight size={19}/></Link><Link className="text-link" href={link('studio')}>{de?'Im Studio visualisieren':'Open Material Studio'}<ArrowRight size={18}/></Link></div>
        <div className="hero-note">{de?'FÜR DESIGNER. FÜR HERSTELLER. SEIT 2004.':'FOR DESIGNERS. FOR MANUFACTURERS. SINCE 2004.'}</div>
      </div>
      <figure className="hero-image"><img src="/media/kitchen.jpg" alt={de?'Küche mit anthrazitfarbenen Möbelfronten, von der öffentlichen Fine Decor Website':'Kitchen with charcoal furniture fronts, from the Fine Decor public website'} width="800" height="551" fetchPriority="high"/><figcaption><span>{de?'FARBE IM KONTEXT':'COLOUR IN CONTEXT'}</span><span>{de?'Quellenbild · Fine Decor':'Source imagery · Fine Decor'}<ArrowUpRight size={14}/></span></figcaption></figure>
    </section>
    <section className="home-intro">
      <div><span className="eyebrow">01 / {de?'DIE MATERIALBIBLIOTHEK':'THE MATERIAL LIBRARY'}</span><h2>{de?'Eine Oberfläche.':'One surface.'}<br/>{de?'Viele Möglichkeiten.':'Many possibilities.'}</h2></div>
      <p>{de?'Von sanften Neutraltönen bis zu ausdrucksstarken Farben. Beginnen Sie mit einem Dekor und prüfen Sie die Details mit unserem Team.':'From quiet neutrals to expressive colour. Start with a decor, explore its character and confirm the details with our team.'}</p>
      <Link className="text-link" href={link('collections')}>{de?'Alle Oberflächen ansehen':'View the surfaces'}<ArrowUpRight size={20}/></Link>
    </section>
    <section className="starter-surfaces" aria-label={de?'Ausgewählte Quellenreferenzen':'Selected source references'}>
      {['373','255','425'].map(code=>{const variant=getVariant(`demo-${code}-frosted`)!;return <Link href={link('products/'+variant.id)} key={code} className="starter-card"><div className="starter-swatch"><img src={variant.swatch} width="200" height="200" alt="" loading="lazy"/><span className="starter-index">{code} / FROSTED</span><span className="starter-explore"><ArrowUpRight size={22}/></span></div><span>{code==='373'?'OliveGreen':code==='255'?'Kaschmir':'SlateGrey'}<small>{de?'Quellenreferenz · Demo':'Source reference · demo'}</small></span></Link>})}
    </section>
    <section className="studio-teaser">
      <div><span className="eyebrow">02 / MATERIAL STUDIO</span><h2>{de?'Sehen. Vergleichen.':'See it. Compare it.'}<br/>{de?'Weiterdenken.':'Make it yours.'}</h2><p>{de?'Betrachten Sie Oberflächen in drei einfachen Referenzszenen. Speichern Sie Ihre Auswahl und fordern Sie ein physisches Muster an.':'Explore surfaces in three simple reference scenes. Keep your choices together, then request a physical sample.'}</p><div className="teaser-features"><span>{de?'3 Referenzszenen':'3 reference scenes'}</span><span>{de?'Gleiche Vergleichsbedingungen':'Consistent comparison'}</span><span>{de?'Privat gespeichert':'Saved privately'}</span></div><Link className="btn" href={link('studio')}>{de?'Studio öffnen':'Enter the studio'}<Layers size={19}/></Link></div>
      <figure className="teaser-detail"><img src="/media/lacquer.jpg" alt={de?'Oberflächendetail aus der Fine Decor Website':'Surface detail from the Fine Decor website'} loading="lazy" width="600" height="480"/><figcaption>{de?'Oberflächendetail · Quellenbild':'Surface detail · source imagery'}<span>{de?'Vorschau mit physischem Muster prüfen':'Verify previews with a physical sample'}</span></figcaption></figure>
    </section>
    <section className="home-process"><div className="section-heading"><div><span className="eyebrow">{de?'VON DER IDEE ZUM GESPRÄCH':'FROM FIRST IDEA TO A CONVERSATION'}</span><h2>{de?'Ein klarer nächster Schritt.':'A clear next step.'}</h2></div><p>{de?'Ihre Auswahl bleibt bei Ihnen.':'Your choices stay with you.'}</p></div><div className="process-grid">{steps.map(step=><article className="process-step" key={step.number}><div className="process-top"><span>{step.number}</span><step.icon size={23} strokeWidth={1.5}/></div><h3>{step.title}</h3><p>{step.copy}</p><Link className="text-link" href={link(step.href)}>{step.cta}<ArrowUpRight size={17}/></Link></article>)}</div></section>
    <section className="home-evidence"><div><span className="eyebrow">03 / {de?'INFORMIERT AUSWÄHLEN':'A CONSIDERED SELECTION'}</span><h2>{de?'Gutes Design beginnt':'Good design begins'}<br/>{de?'mit den richtigen Fragen.':'with the right questions.'}</h2></div><div><p>{de?'Prüfumfang, Pflege und Verarbeitung zählen. Fragen Sie nach aktuellen Nachweisen für die gewählte Variante und prüfen Sie Farbe mit einem physischen Muster.':'Test scope, care and processing matter. Ask for current evidence for the selected variant and verify colour with a physical sample.'}</p><Link className="text-link" href={link('knowledge')}>{de?'Wissen und Dokumente':'Knowledge & documents'}<ArrowUpRight size={18}/></Link></div></section>
    <section className="home-news"><div className="section-heading"><h2>{de?'Aus dem Archiv':'From the archive'}</h2><Link className="text-link" href={link('knowledge')}>{de?'Alle Quellen ansehen':'View the sources'}<ArrowUpRight size={18}/></Link></div>{news.map(n=><a className="news-row" key={n.id} href={n.source} target="_blank" rel="noreferrer"><span>{n.id==='interzum-2023'?'2023':n.date}</span><h3>{n.title[locale]}</h3><small>{de?'Archivquelle':'Archived source'}</small><ArrowUpRight size={20}/></a>)}</section>
    <section className="sample-band"><span className="eyebrow">{de?'VOM KONZEPT ZUM PHYSISCHEN MUSTER':'FROM CONCEPT TO PHYSICAL SAMPLE'}</span><h2>{de?'Die nächste Oberfläche':'Your next surface'}<br/>{de?'beginnt mit einem Gespräch.':'starts with a conversation.'}</h2><Link className="btn" href={link('request')}>{de?'Musteranfrage vorbereiten':'Prepare a sample enquiry'}<ArrowUpRight size={18}/></Link></section>
  </>;
}
