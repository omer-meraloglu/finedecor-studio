import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
export function proxy(req:NextRequest){const h=new Headers(req.headers);h.set('x-fd-locale',req.nextUrl.pathname.startsWith('/de')?'de':'en');return NextResponse.next({request:{headers:h}})}
export const config={matcher:['/((?!api|_next|media|favicon).*)']};
