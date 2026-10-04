import {getDecor, getFinish, getVariant, PRODUCT_SOURCE} from './catalog';
import type {Project} from './model';
import {cameraPreset} from './studio-state';

export interface StudyExportOptions {
  project: Project;
  projectId: string;
  locale: 'en' | 'de';
  previewDataUrl: string | null;
  enquiryId?: string | null;
  date?: Date;
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]!));

// Captures are embedded into a standalone document. Accept only an encoded PNG,
// never an arbitrary URL or an image type that can contain executable markup.
function safePng(value: string | null): string | null {
  if (!value || value.length > 12_000_000 || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) return null;
  const encoded = value.slice('data:image/png;base64,'.length);
  if (encoded.length % 4) return null;
  try {
    const signature = atob(encoded.slice(0, 12));
    return signature.slice(0, 8) === '\u0089PNG\r\n\u001a\n' ? value : null;
  } catch {
    return null;
  }
}

export function buildStudyExport({project, projectId, locale, previewDataUrl, enquiryId, date = new Date()}: StudyExportOptions): string {
  const de = locale === 'de';
  const safeLocale = de ? 'de' : 'en';
  const text = (en: string, german: string) => de ? german : en;
  const escape = escapeHtml;
  const exportDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const isoDate = exportDate.toISOString().slice(0, 10);
  const displayDate = new Intl.DateTimeFormat(safeLocale, {dateStyle: 'long', timeZone: 'UTC'}).format(exportDate);
  const sceneNames = {panel: text('Front panel', 'Frontplatte'), kitchen: text('Kitchen vignette', 'Küchenvignette'), unit: text('Furniture unit', 'Möbeleinheit')};
  const lightNames = {neutral: text('Neutral studio', 'Neutrales Studio'), daylight: text('Illustrative daylight', 'Illustratives Tageslicht'), warm: text('Illustrative warm light', 'Illustratives warmes Licht')};
  const cameraNames = {perspective: text('Perspective', 'Perspektive'), front: text('Front', 'Front'), detail: text('Detail', 'Detail')};
  const matchingPreset = (['perspective', 'front', 'detail'] as const).find(preset => {
    const camera = cameraPreset(project.scene, preset);
    return camera.position.every((value, index) => Math.abs(value - project.camera.position[index]) < .0001)
      && camera.target.every((value, index) => Math.abs(value - project.camera.target[index]) < .0001);
  });
  const cameraLabel = matchingPreset ? cameraNames[matchingPreset] : text('Custom view', 'Eigene Ansicht');
  const pendingFamily = text('Pending owner approval', 'Eigentümerfreigabe ausstehend');
  const unavailable = text('Material unavailable', 'Material nicht verfügbar');
  const roles: {label: string; id: string}[] = [
    {label: text('A · Main fronts', 'A · Hauptfronten'), id: project.assignments.fronts},
    ...(project.assignments.accent ? [{label: text('Accent front · fixed in A and B', 'Akzentfront · in A und B identisch'), id: project.assignments.accent}] : []),
    ...(project.compareId ? [{label: text('B · Comparison fronts', 'B · Vergleichsfronten'), id: project.compareId}] : []),
  ];
  const variantLabel = (id: string) => {
    const variant = getVariant(id);
    return variant ? `${getDecor(variant).name} · ${getDecor(variant).code} · ${getFinish(variant).name}` : unavailable;
  };
  const roleMarkup = roles.map(({label, id}) => `<article class="assignment"><h3>${escape(label)}</h3><p>${escape(variantLabel(id))}</p><code>${escape(id)}</code></article>`).join('');
  const png = safePng(previewDataUrl);
  const preview = png
    ? `<img class="render" src="${png}" alt="${escape(text('Illustrative surface study preview', 'Illustrative Vorschau der Oberflächenstudie'))}">`
    : `<div class="fallback">${roles.map(({label, id}) => {
      const hex = getVariant(id)?.hex;
      const safeHex = hex && /^#[\da-f]{6}$/i.test(hex) ? hex : '#e3e5db';
      return `<figure><div class="colour" style="background:${safeHex}" role="img" aria-label="${escape(`${label}: ${variantLabel(id)}`)}"></div><figcaption><strong>${escape(label)}</strong><span>${escape(variantLabel(id))}</span></figcaption></figure>`;
    }).join('')}</div><p class="preview-status">${escape(text('Illustrative colour references · no 3D image captured. These are display colours, not source photography or measured colour values.', 'Illustrative Farbreferenzen · kein 3D-Bild erfasst. Dies sind Bildschirmfarben, keine Quellfotografie oder gemessenen Farbwerte.'))}</p>`;
  const rows = project.variantIds.map(id => {
    const variant = getVariant(id);
    const decor = variant ? getDecor(variant) : null;
    const finish = variant ? getFinish(variant) : null;
    return `<tr><td><code>${escape(id)}</code></td><td>${escape(decor ? `${decor.name} · ${decor.code}` : unavailable)}</td><td>${escape(finish?.name ?? '—')}</td><td>${escape(pendingFamily)}</td></tr>`;
  }).join('');
  const number = new Intl.NumberFormat(safeLocale, {maximumFractionDigits: 3});
  const coordinates = (values: number[]) => values.map(value => number.format(value)).join(' / ');
  return `<!doctype html>
<html lang="${safeLocale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${escape(text('Fine Decor · Surface study', 'Fine Decor · Oberflächenstudie'))} — ${escape(project.name)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f0f1e9;color:#263021;font:14px/1.65 Arial,Helvetica,sans-serif}.sheet{max-width:1000px;margin:32px auto;padding:44px;background:#fdfdf8}header{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #c9cebb;padding-bottom:20px;color:#566442}.brand{font-size:20px;letter-spacing:.02em}.kicker{font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin:30px 0 10px;color:#5c6b47}h1{font-size:36px;line-height:1.18;font-weight:400;letter-spacing:-.03em;margin:0 0 20px;overflow-wrap:anywhere}h2{font-size:21px;font-weight:400;margin:0 0 14px}h3{font-size:12px;margin:0 0 7px;color:#50613c}p{margin:0}code{font:11px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 24px;margin:0 0 24px}dt{font-size:11px;color:#657159}dd{margin:3px 0 0;overflow-wrap:anywhere}.project-id{grid-column:1/-1}figure{margin:0}.render{display:block;width:100%;height:auto;border:1px solid #dce0d1}.fallback{display:grid;grid-template-columns:repeat(${roles.length},minmax(0,1fr));gap:14px}.colour{height:190px;border:1px solid #cbd0be}figcaption{font-size:11px;margin-top:8px}figcaption strong,figcaption span{display:block}.preview-status{font-size:11px;color:#69735e;margin-top:12px}.limitation{border-left:3px solid #8b9868;padding:13px 16px;background:#eef1e3;margin-top:18px}.limitation strong{display:block;color:#465631;margin-bottom:5px}.limitation p{font-size:12px}.assignments{display:grid;grid-template-columns:repeat(${roles.length},minmax(0,1fr));gap:14px;margin:22px 0 30px}.assignment{padding:14px;background:#f1f3e9;break-inside:avoid}.assignment p{font-size:12px;margin-bottom:5px}.section{border-top:1px solid #dce0d1;padding-top:24px;margin-top:24px}table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}th,td{padding:12px 10px;border-bottom:1px solid #dce0d1;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{font-size:11px;color:#53633f;background:#eff2e5;font-weight:600}th:first-child{width:29%}tbody tr{break-inside:avoid}.settings{display:grid;grid-template-columns:1fr 1fr;gap:18px}.settings dl{grid-template-columns:1fr;margin:0;gap:10px}.note{font-size:12px;color:#59664d}.reference{font-size:11px;overflow-wrap:anywhere;color:#647057}.enquiry{margin-top:18px;padding:14px;border:1px solid #cbd3b8}footer{border-top:1px solid #c9cebb;margin-top:30px;padding-top:15px;font-size:11px;color:#667159;display:flex;justify-content:space-between;gap:20px}@media(max-width:650px){.sheet{margin:0;padding:24px 18px}header,footer{display:block}h1{font-size:29px}dl{grid-template-columns:1fr 1fr}.fallback,.assignments,.settings{grid-template-columns:1fr}.colour{height:160px}table{font-size:11px}th,td{padding:9px 5px}code{font-size:10px}.brand{margin-bottom:8px}}@page{size:A4;margin:14mm}@media print{body{background:white;font-size:11px}.sheet{margin:0;padding:0;max-width:none}h1{font-size:28px}.render{max-height:88mm;width:100%;object-fit:contain;background:#eff0e9}.colour{height:42mm}header,.limitation,.assignments,.settings,footer{break-inside:avoid}.section{padding-top:16px;margin-top:20px}thead{display:table-header-group}th,td{padding:9px 7px}.sheet{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body><main class="sheet">
<header><div class="brand">Fine Decor</div><div>${escape(text('Material Studio · saved study', 'Material Studio · gespeicherte Studie'))}<br><time datetime="${isoDate}">${escape(displayDate)}</time></div></header>
<p class="kicker">${escape(text('Illustrative surface study', 'Illustrative Oberflächenstudie'))}</p>
<h1>${escape(project.name)}</h1>
<dl><div class="project-id"><dt>${escape(text('Project ID', 'Projekt-ID'))}</dt><dd><code>${escape(projectId)}</code></dd></div><div><dt>${escape(text('Reference scene', 'Referenzszene'))}</dt><dd>${escape(sceneNames[project.scene])}</dd></div><div><dt>${escape(text('Lighting', 'Beleuchtung'))}</dt><dd>${escape(lightNames[project.light])}</dd></div><div><dt>${escape(text('Saved camera', 'Gespeicherte Kamera'))}</dt><dd>${escape(cameraLabel)}</dd></div></dl>
<section aria-label="${escape(text('Study preview', 'Studienvorschau'))}">${preview}<div class="limitation"><strong>${escape(text('Illustrative preview — verify with a physical sample.', 'Illustrative Vorschau — mit physischem Muster prüfen.'))}</strong><p>${escape(text('This is a design study, not a technical specification. Colour, surface response and furniture geometry are illustrative. The preview establishes neither calibrated colour nor forming or processing suitability. Demo variants are excluded from fulfilment.', 'Dies ist eine Designstudie, keine technische Spezifikation. Farbe, Oberflächenwirkung und Möbelgeometrie sind illustrativ. Die Vorschau bestätigt weder kalibrierte Farbe noch Eignung zur Verformung oder Verarbeitung. Demo-Varianten sind von der Auslieferung ausgeschlossen.'))}</p></div></section>
<div class="assignments">${roleMarkup}</div>
<section class="section"><h2>${escape(text('Chosen material references', 'Gewählte Materialreferenzen'))}</h2><table><thead><tr><th>${escape(text('Variant ID', 'Varianten-ID'))}</th><th>${escape(text('Decor / code', 'Dekor / Code'))}</th><th>${escape(text('Finish', 'Oberfläche'))}</th><th>${escape(text('Product family', 'Produktfamilie'))}</th></tr></thead><tbody>${rows}</tbody></table></section>
<section class="section settings"><div><h2>${escape(text('View settings', 'Ansichtseinstellungen'))}</h2><dl><div><dt>${escape(text('Camera position · scene coordinates', 'Kameraposition · Szenenkoordinaten'))}</dt><dd>${escape(coordinates(project.camera.position))}</dd></div><div><dt>${escape(text('Camera target · scene coordinates', 'Kameraziel · Szenenkoordinaten'))}</dt><dd>${escape(coordinates(project.camera.target))}</dd></div><div><dt>${escape(text('Comparison', 'Vergleich'))}</dt><dd>${escape(project.compareId ? text('Same geometry, camera, exposure and lighting for A and B.', 'Gleiche Geometrie, Kamera, Belichtung und Beleuchtung für A und B.') : text('Single material view', 'Ansicht eines Materials'))}</dd></div></dl></div><div><h2>${escape(text('Provenance and review status', 'Herkunft und Prüfstatus'))}</h2><p class="note">${escape(text('Identifiers and finish relationships come from the source-referenced demo catalog. Source swatches remain separate 2D references. Preview colours and material response use illustrative parameters; no calibrated texture maps or measurements are supplied. Family compatibility and technical suitability await owner approval.', 'Identifikatoren und Oberflächenbeziehungen stammen aus dem quellenbasierten Demo-Katalog. Quellmuster bleiben separate 2D-Referenzen. Vorschaufarben und Materialwirkung verwenden illustrative Parameter; kalibrierte Texturkarten oder Messwerte liegen nicht vor. Familienkompatibilität und technische Eignung warten auf Eigentümerfreigabe.'))}</p><p class="reference">${escape(text('Catalog source', 'Katalogquelle'))}: ${escape(PRODUCT_SOURCE)}</p></div></section>
${enquiryId ? `<aside class="enquiry"><h3>${escape(text('Saved local enquiry reference', 'Referenz der lokal gespeicherten Anfrage'))}</h3><code>${escape(enquiryId)}</code><p class="note">${escape(text('Reference only. Contact details are not included in this study.', 'Nur die Referenz. Kontaktdaten sind in dieser Studie nicht enthalten.'))}</p></aside>` : ''}
<footer><span>${escape(text('Fine Decor · Material Studio · local demonstration', 'Fine Decor · Material Studio · lokale Demonstration'))}</span><span>${escape(text('Exported', 'Exportiert'))}: ${isoDate}</span></footer>
</main></body></html>`;
}
