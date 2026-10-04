import Link from 'next/link';
import {ArrowUpRight,Palette,Ruler,MessageSquare} from 'lucide-react';
import './home.css';

type LocaleProps={locale:'en'|'de'};

/** Public-range editorial content. This does not assign variants to families. */
export function FamilyOverview({locale}:LocaleProps){
  const de=locale==='de';
  const cards=[
    {id:'fineflex',name:'Fineflex',image:'/media/film.jpg',width:750,height:647,alt:de?'Materialtafeln aus der öffentlichen Fine Decor Produktgalerie':'Material panels from Fine Decor’s public product gallery',caption:de?'Materialreferenz · Fine Decor':'Material reference · Fine Decor',copy:de?'Eine Fine Decor Oberflächenfamilie für farborientiertes Möbeldesign. Entdecken Sie Ihre Dekorrichtung und besprechen Sie die passende Ausführung.':'A Fine Decor surface family for colour-led furniture design. Explore your decor direction and discuss the right configuration.'},
    {id:'lacquered-laminate',name:de?'Lacklaminat':'Lacquered laminate',image:'/media/lacquer.jpg',width:526,height:438,alt:de?'Detail einer weißen glänzenden Möbelfront aus der Fine Decor Produktgalerie':'Detail of a white glossy furniture front from the Fine Decor product gallery',caption:de?'Oberflächendetail · Fine Decor':'Surface detail · Fine Decor',copy:de?'Eine lackierte Oberflächenfamilie für Möbelfronten. Vergleichen Sie das Erscheinungsbild und besprechen Sie Finish, Ausführung und Verarbeitung mit Fine Decor.':'A lacquered surface range for furniture fronts. Compare appearance and discuss finish, configuration and processing with Fine Decor.'}
  ];
  return <section className="fd-family-overview" aria-labelledby="fd-family-title">
    <div className="fd-source-heading"><div><span className="eyebrow">{de?'DAS SORTIMENT':'THE RANGE'}</span><h2 id="fd-family-title">{de?'Zwei Familien.':'Two families.'}<br/>{de?'Ein Gespür für Oberflächen.':'A feeling for surfaces.'}</h2></div><p>{de?'Fineflex und Lacklaminat gehören zum öffentlichen Fine Decor Sortiment. Beginnen Sie mit der Designidee und stimmen Sie die Materialwahl mit unserem Team ab.':'Fineflex and lacquered laminate belong to Fine Decor’s public range. Start with the design idea and discuss material selection with our team.'}</p></div>
    <div className="fd-family-grid">{cards.map(card=><article className="fd-family-card" key={card.id}>
      <figure><img src={card.image} alt={card.alt} width={card.width} height={card.height} loading="lazy"/><figcaption>{card.caption}</figcaption></figure>
      <div className="fd-family-copy"><h3>{card.name}</h3><p>{card.copy}</p><Link className="text-link" href={`/${locale}/request?kind=technical`}>{de?'Familie besprechen':'Discuss this family'}<ArrowUpRight size={18}/></Link></div>
    </article>)}</div>
    <div className="fd-source-footer"><Link className="text-link" href={`/${locale}/collections`}>{de?'Farben und Oberflächen entdecken':'Explore colours & finishes'}<ArrowUpRight size={17}/></Link><a href={de?'https://www.finedecor.de/unsere-produkte/':'https://www.finedecor.de/en/our-products/'} target="_blank" rel="noreferrer">{de?'Öffentliche Produktquelle':'Public product source'} ↗</a></div>
  </section>;
}

export function CustomConsultation({locale}:LocaleProps){
  const de=locale==='de';
  const questions=[
    {icon:Palette,title:de?'Ihre Farbreferenz':'Your colour reference',copy:de?'RAL, NCS, Pantone oder eine eigene Designidee.':'RAL, NCS, Pantone or your own design direction.'},
    {icon:Ruler,title:de?'Ihre gewünschte Breite':'Your required width',copy:de?'Bedarf und Projektmaße für das Gespräch vorbereiten.':'Bring the required width and project dimensions.'},
    {icon:MessageSquare,title:de?'Ihre Anwendung':'Your application',copy:de?'Substrat, Verarbeitung und offene technische Fragen.':'Substrate, processing and the questions to resolve.'}
  ];
  return <section className="fd-custom-consultation" aria-labelledby="fd-custom-title">
    <div className="fd-custom-intro"><span className="eyebrow">{de?'INDIVIDUELLE ANFRAGEN':'INDIVIDUAL REQUIREMENTS'}</span><h2 id="fd-custom-title">{de?'Ihr Projekt.':'Your project.'}<br/>{de?'Ihre Richtung.':'Your direction.'}</h2><p>{de?'Fine Decor bietet Beratung zu individuellen Farben, Sonderbreiten und anwendungstechnischen Fragen. Ein guter Austausch beginnt mit Ihrem konkreten Briefing.':'Fine Decor offers consultation on custom colours, special widths and application questions. A useful conversation starts with your project brief.'}</p><div className="button-row"><Link className="btn" href={`/${locale}/request?kind=technical`}>{de?'Projekt besprechen':'Discuss your project'}<ArrowUpRight size={18}/></Link><Link className="text-link" href={`/${locale}/knowledge`}>{de?'Technische Informationen':'Technical information'}<ArrowUpRight size={17}/></Link></div></div>
    <div className="fd-custom-questions">{questions.map(question=><article key={question.title}><question.icon size={22} strokeWidth={1.5}/><div><h3>{question.title}</h3><p>{question.copy}</p></div></article>)}</div>
  </section>;
}

/** Owner-authorized source context for the company page; no live site claims. */
export function CompanySourceStory({locale}:LocaleProps){
  const de=locale==='de';
  return <section className="fd-company-story" aria-labelledby="fd-company-story-title">
    <div className="fd-source-heading"><div><span className="eyebrow">{de?'ERFAHRUNG & ZUSAMMENARBEIT':'EXPERIENCE & COLLABORATION'}</span><h2 id="fd-company-story-title">{de?'Aus Ideen werden':'Ideas become'}<br/>{de?'Oberflächen.':'surfaces.'}</h2></div><p>{de?'Fine Decor wurde 2004 gegründet und arbeitet mit der deutschen und internationalen Küchen- und Möbelindustrie. Die Ideen der Kunden prägen Farbe und Oberflächendesign.':'Founded in 2004, Fine Decor works with the German and international kitchen and furniture industry. Customers’ ideas inform colour and surface design.'}</p></div>
    <div className="fd-company-principles"><article><span>01</span><h3>{de?'Design im Dialog':'Design in dialogue'}</h3><p>{de?'Sinne, Natur und Kundenideen geben Impulse für Farben und Dekore.':'Senses, nature and customer ideas inspire colours and decors.'}</p></article><article><span>02</span><h3>{de?'Individuelle Anforderungen':'Individual requirements'}</h3><p>{de?'Besprechen Sie Farben, Breiten und anwendungstechnische Fragen mit dem Team.':'Discuss colours, widths and application questions with the team.'}</p></article><article><span>03</span><h3>{de?'Materialentwicklung':'Material development'}</h3><p>{de?'Die Unternehmensgeschichte nennt PET-Entwicklung ab 2005 und den Grundstein für den Produktionsstandort der Schwesterfirma FineLine Innovation im Jahr 2019.':'The company history records PET development from 2005 and a 2019 production-site milestone for sister company FineLine Innovation.'}</p></article></div>
    <div className="fd-company-images"><figure><img src="/media/source-production-hall.jpg" width="600" height="300" loading="lazy" alt={de?'Luftaufnahme eines Industriegebäudes aus der FineLine Galerie auf der Fine Decor Unternehmensseite':'Aerial photograph of an industrial building from the FineLine gallery on Fine Decor’s company page'}/><figcaption>{de?'FineLine · Fine Decor Unternehmensgalerie':'FineLine · Fine Decor company gallery'}</figcaption></figure><figure><img src="/media/source-production-exterior.jpg" width="600" height="300" loading="lazy" alt={de?'Gebäudefassade mit FineLine Beschriftung aus der Fine Decor Unternehmensgalerie':'Building facade with FineLine signage from the Fine Decor company gallery'}/><figcaption>{de?'Architektur · Fine Decor Unternehmensgalerie':'Architecture · Fine Decor company gallery'}</figcaption></figure></div>
    <div className="fd-source-footer"><Link className="text-link" href={`/${locale}/request?kind=technical`}>{de?'Mit dem Team sprechen':'Talk to the team'}<ArrowUpRight size={18}/></Link><div><a href={de?'https://www.finedecor.de/ueber-fine-decor/':'https://www.finedecor.de/en/about-fine-decor/'} target="_blank" rel="noreferrer">{de?'Unternehmensquelle & Geschichte':'Company source & history'} ↗</a><a href={de?'https://www.finedecor.de/unsere-produkte/':'https://www.finedecor.de/en/our-products/'} target="_blank" rel="noreferrer">{de?'Produkt- und Beratungsquelle':'Product & consultation source'} ↗</a></div></div>
  </section>;
}
