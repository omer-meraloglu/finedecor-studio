'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,ArrowRight,Layers,ChevronLeft,ChevronRight} from 'lucide-react';
import {getVariant,getDecor} from '@/lib/catalog';
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
  return <div className="fine-home">
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <div className="eyebrow"><span/> {de?'PET-DEKORFOLIEN FÜR MÖBEL':'PET DECORATIVE FILMS FOR FURNITURE'}</div>
        <h1 id="home-title">{de?'Oberflächen für':'Surfaces for'}<br/><em>{de?'neue Perspektiven.':'what comes next.'}</em></h1>
        <p>{de?'Farbe und Oberfläche. Von der ersten Idee zum physischen Muster.':'Colour and finish. From your first idea to a physical sample.'}</p>
        <div className="button-row"><Link className="btn" href={link('collections')}>{de?'Oberflächen entdecken':'Explore surfaces'}<ArrowUpRight size={19}/></Link><Link className="text-link" href={link('studio')}>{de?'Material Studio':'Material Studio'}<ArrowRight size={18}/></Link></div>
        <div className="hero-note">{de?'FINE DECOR · SEIT 2004':'FINE DECOR · SINCE 2004'}</div>
      </div>
      <div className="hero-gallery">
        <figure className="hero-image" id="home-hero-photograph"><img key={photo.src} className="home-photo-change" src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} fetchPriority={photoIndex===0?'high':'auto'}/><figcaption aria-live="polite" aria-atomic="true"><span>{photo.caption}</span><span>{de?'Fine Decor Quellenbild · Dekor nicht zugeordnet':'Fine Decor source imagery · decor unassigned'}</span></figcaption></figure>
        <div className="hero-gallery-controls" role="group" aria-label={de?'Fine Decor Bilder auswählen':'Choose Fine Decor imagery'}>
          <div className="hero-image-choices">{photographs.map((item,index)=><button key={item.src} type="button" aria-pressed={photoIndex===index} aria-controls="home-hero-photograph" onClick={()=>setPhotoIndex(index)}><span aria-hidden="true">0{index+1}</span>{item.label}</button>)}</div>
          <div className="hero-gallery-arrows"><button type="button" aria-label={de?'Vorheriges Bild':'Previous image'} aria-controls="home-hero-photograph" onClick={()=>setPhotoIndex(index=>(index+photographs.length-1)%photographs.length)}><ChevronLeft size={18}/></button><button type="button" aria-label={de?'Nächstes Bild':'Next image'} aria-controls="home-hero-photograph" onClick={()=>setPhotoIndex(index=>(index+1)%photographs.length)}><ChevronRight size={18}/></button></div>
        </div>
      </div>
    </section>
    <section className="home-collection" aria-labelledby="home-surfaces-title">
      <div className="home-intro"><div><span className="eyebrow">{de?'DIE OBERFLÄCHEN':'THE SURFACES'}</span><h2 id="home-surfaces-title">{de?'Farbe entdecken.':'Find your colour.'}</h2></div><p>Fineflex · {de?'Lacklaminat':'Lacquered laminate'}</p><Link className="text-link" href={link('collections')}>{de?'Alle Oberflächen':'All surfaces'}<ArrowUpRight size={20}/></Link></div>
      <div className="starter-surfaces">{['373','255','425'].map(code=>{const variant=getVariant(`demo-${code}-frosted`)!;return <Link href={link('products/'+variant.id)} key={code} className="starter-card"><div className="starter-swatch"><img src={variant.swatch} width="200" height="200" alt="" loading="lazy"/><span className="starter-index">{code}</span><span className="starter-explore"><ArrowUpRight size={22}/></span></div><span>{getDecor(variant).name}<small>Frosted</small></span></Link>})}</div>
      <p className="home-reference-note">{de?'Quellenreferenzen · Demo. Farben mit einem physischen Muster prüfen.':'Source references · demo. Verify colour with a physical sample.'}</p>
    </section>
    <section className="studio-teaser" aria-labelledby="home-studio-title">
      <div><span className="eyebrow">MATERIAL STUDIO</span><h2 id="home-studio-title">{de?'Ihre Oberfläche.':'Your surface.'}<br/>{de?'Im Kontext.':'In context.'}</h2><p>{de?'Vier Szenen. Oberflächen vergleichen. Auswahl speichern.':'Four scenes. Compare surfaces. Save your choices.'}</p><Link className="btn" href={link('studio')}>{de?'Studio öffnen':'Open the studio'}<Layers size={19}/></Link></div>
      <figure className="teaser-detail"><img src="/media/film.jpg" alt={de?'Gestapelte Materialtafeln in warmen Natur-, Weiß- und Dunkeltönen von Fine Decor':'Layered material panels in warm neutral, white and dark tones from Fine Decor'} loading="lazy" width="750" height="647"/><figcaption>{de?'Fine Decor Quellenbild':'Fine Decor source imagery'}<span>{de?'Illustrative Vorschau · mit physischem Muster prüfen':'Illustrative preview · verify with a physical sample'}</span></figcaption></figure>
    </section>
    <section className="home-evidence home-production" aria-labelledby="home-company-title">
      <figure className="production-main-image home-company-photo"><img src="/media/interior.jpg" alt={de?'Weiße Gebäudefassade mit olivgrünem Fine Decor Schriftzug unter blauem Himmel':'White building facade with olive Fine Decor signage beneath a blue sky'} width="1920" height="800" loading="lazy"/><figcaption>{de?'Fine Decor · Quellenfoto':'Fine Decor · source photography'}</figcaption></figure>
      <div className="production-story"><span className="eyebrow">FINE DECOR</span><h2 id="home-company-title">{de?'Ideen werden':'Ideas become'}<br/><em>{de?'Oberflächen.':'surfaces.'}</em></h2><p>{de?'Entwicklung und Produktion von PET-Dekorfolien. Im Dialog mit der Möbelindustrie, seit 2004.':'Developing and producing PET decorative films. In dialogue with the furniture industry, since 2004.'}</p><Link className="text-link" href={link('company')}>{de?'Über Fine Decor':'About Fine Decor'}<ArrowUpRight size={19}/></Link></div>
    </section>
    <section className="sample-band" aria-labelledby="home-sample-title"><div><span className="eyebrow">{de?'DER NÄCHSTE SCHRITT':'THE NEXT STEP'}</span><h2 id="home-sample-title">{de?'Material erleben.':'Make it tangible.'}</h2><p>{de?'Physische Muster. Persönliche Beratung.':'Physical samples. Personal advice.'}</p></div><Link className="btn" href={link('request')}>{de?'Muster anfragen':'Request samples'}<ArrowUpRight size={18}/></Link></section>
  </div>;
}
