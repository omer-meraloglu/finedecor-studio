import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {LibraryProvider} from '@/components/library';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(process.env.FD_PUBLIC_ORIGIN||'http://127.0.0.1:4173'),title:'Fine Decor — Surfaces for what comes next',description:'PET decorative surfaces for furniture. Explore colour, compare finishes and prepare a considered sample enquiry.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default async function RootLayout({children}:{children:React.ReactNode}){const lang=(await headers()).get('x-fd-locale')==='de'?'de':'en';return <html lang={lang}><body><LibraryProvider>{children}</LibraryProvider></body></html>}
