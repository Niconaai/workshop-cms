import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
    console.log('Middleware running for: ', req.nextUrl.pathname);

    if(!secret){
        console.error("Authentication Error: NEXTAUTH_SECRET environment variable is not defined.");
        return NextResponse.redirect(new URL('/auth-error', req.url));
        //return new NextResponse('Authentication configuration error', { status: 500 });
    }

    const token = await getToken({
        req: req,
        secret: secret
    });

    console.log('Token: ', token);//remove later

    const { pathname } = req.nextUrl;

    if(token && pathname === '/login'){
        return NextResponse.redirect(new URL('/', req.url));
    }else if(!token && pathname !== '/login'){
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}