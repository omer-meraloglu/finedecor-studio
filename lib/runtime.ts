// Vercel's stateless review deployment has no durable local SQLite volume.
// Do not pretend temporary storage is a saved project or accepted enquiry.
export const isHostedReview=()=>process.env.VERCEL==='1';
export function publicOrigin(){
  if(process.env.FD_PUBLIC_ORIGIN)return new URL(process.env.FD_PUBLIC_ORIGIN).origin;
  const host=process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL;
  return host?new URL(`https://${host}`).origin:'http://127.0.0.1:4173';
}
