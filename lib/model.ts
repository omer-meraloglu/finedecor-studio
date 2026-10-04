export type Locale = 'en'|'de'|'tr';
export type Approval = 'draft'|'in-review'|'approved'|'archived';
export interface ProductFamily {id:string;name:string;description:string;approval:Approval}
export interface Decor {id:string;code:string;name:string;colourFamily:'green'|'grey'|'neutral'|'white'|'black'|'brown'|'blue'|'red'|'orange'|'yellow'|'purple';source:string}
export interface Finish {id:string;name:string;description:string}
export interface ProductVariant {editorialNote?:string;id:string;decorId:string;finishId:string;familyId:string|null;sku:string|null;approval:Approval;demo:boolean;compatibleApplications:string[];dimensions:null|{widthMm:number;thicknessMm:number};documentIds:string[];materialId:string|null;swatch:string;hex:string}
export interface Application {id:string;name:{en:string;de:string};source:string;variantIds:string[]}
export interface MediaAsset {id:string;url:string;source:string;rights:string;type:'photograph'|'swatch'|'concept';approved:boolean}
export interface MaterialAsset {id:string;variantIds:string[];baseColourUrl:string|null;normalUrl:string|null;roughnessUrl:string|null;clearcoatUrl:string|null;provenance:string;scaleMetres:number|null;colourSpace:'sRGB'|'linear';uvOrientation:string|null;calibrationStatus:'illustrative'|'calibrated';visualParameters:{roughness:number;clearcoat:number;metalness:number}}
export interface TechnicalDocument {id:string;title:string;version:string|null;locale:Locale;applicableVariants:string[];issueDate:string|null;reviewDate:string|null;approval:Approval;url:string;public:boolean}
export interface ClaimEvidence {id:string;approvedWording:string|null;source:string;scope:string[];approval:Approval;reviewDate:string|null}
export interface Project {id?:string;name:string;variantIds:string[];assignments:Record<string,string>;scene:'panel'|'kitchen'|'unit'|'table';light:'neutral'|'daylight'|'warm';camera:{preset:'perspective'|'front'|'detail';position:[number,number,number];target:[number,number,number]};compareId:string|null;createdAt?:string}
export interface SampleRequest {id:string;variantIds:string[];company:string;country:string;email:string;name:string;application:string;details:string;kind:'samples'|'technical';projectId:string|null;createdAt:string;demo:true}
export interface Office {id:string;name:string;address:string;phone:string|null;email:string|null;responsibilities:string|null;approval:Approval;source:string}
export interface NewsArticle {id:string;title:{en:string;de:string};date:string;source:string;archived:boolean}
export type UserRole = 'editor'|'technical'|'administrator';
