import {publicOrigin} from '@/lib/runtime';
export default function sitemap(){const origin=publicOrigin();return ['en','de'].flatMap(locale=>['','collections','applications','knowledge','company','contact'].map(path=>({url:`${origin}/${locale}/${path}`,alternates:{languages:{en:`${origin}/en/${path}`,de:`${origin}/de/${path}`}}}))) }
