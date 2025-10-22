import { NextRequest, NextResponse } from 'next/server';
import knexConfig from '../../../../knexfile';
import knexInitializer from 'knex';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const knex = knexInitializer(knexConfig.development);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Login API received: ', body);

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return NextResponse.json({ message: 'Internal server error: JWT configuration missing' }, { status: 500 });
        }

        const email = body.email;
        const password = body.password;
        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const user = await knex('User').where({ email: email }).first();

        if (!user || !user.hashedPassword) {
            console.log(`Login failed: User not found or password not set for ${email}`);
            return NextResponse.json({ message: 'Invalid Credentials' }, { status: 401 });
        }

        const isValidPassword = await bcrypt.compare(password, user.hashedPassword);

        if (isValidPassword) {
            const payload = {
                userId: user.id,
                role: user.role,
                organizationId: user.organizationId,
            };

            const token = jwt.sign(payload, jwtSecret as string, { expiresIn: '1d' });

            const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'lax',
                maxAge: 60*60*24*1,
                path: '/',
            });

            return response;

        } else {
            return NextResponse.json({ message: 'Invalid Credentials' }, { status: 401 });
        }

    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}