import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {LibraryProvider} from '@/components/library';
import {isHostedReview,publicOrigin} from '@/lib/runtime';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(publicOrigin()),title:'Fine Decor — Surfaces for what comes next',description:'PET decorative surfaces for furniture. Explore colour, compare finishes and prepare a considered sample enquiry.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default async function RootLayout({children}:{children:React.ReactNode}){const lang=(await headers()).get('x-fd-locale')==='de'?'de':'en';return <html lang={lang}><body><LibraryProvider serverPersistence={!isHostedReview()}>{children}</LibraryProvider></body></html>}
