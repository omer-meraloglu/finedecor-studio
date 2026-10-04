// Core browsing, studio and enquiries never depend on optional AI/AR.
export const featureFlags={specificationAssistant:false,naturalLanguageSearch:false,moodboard:false,ar:false,analytics:false,thirdPartyEmbeds:false} as const;
export interface AnalyticsAdapter {track(event:{name:'surface-view'|'studio-open'|'enquiry-saved';variantIds?:string[]}):Promise<void>}
export const disabledAnalytics:AnalyticsAdapter={async track(){/* No collection or network calls. */}};
