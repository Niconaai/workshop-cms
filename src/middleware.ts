import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken'; 

const secret = process.env.JWT_SECRET;

export async function middleware(req: NextRequest) {
    console.log('Middleware running for: ', req.nextUrl.pathname);

    if (!secret) {
        console.error("Authentication Error: JWT_SECRET environment variable is not defined.");
        return NextResponse.redirect(new URL('/login?error=config_missing', req.url));
    }

    const tokenCookie = req.cookies.get('auth_token');
    let decodedPayload: JwtPayload | null = null;

    if (tokenCookie) {
        const tokenValue = tokenCookie.value;
        try {
            decodedPayload = jwt.verify(tokenValue, secret) as JwtPayload;
            console.log('Token verified:', decodedPayload);
        } catch (error) {
            console.error('JWT Verification Error', (error as Error).message); 
            const response = NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
            response.cookies.delete('auth_token');
            return response;
        }
    } else {
        console.log('No auth_token cookie found.'); // Debug log
    }

    const { pathname } = req.nextUrl;

    if (decodedPayload) {
        if (pathname === '/login') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    if (!decodedPayload) {
        if (pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|auth-error|.*\\.).*)', // Added auth-error exclusion
    ],
};