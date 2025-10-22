'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
        setError(null);

        e.preventDefault();

        const result = await signIn('credentials', {
            email: email,
            password: password,
            redirect: false,
        });

        if (result.ok) {
            router.push('/');
        }else {
            setError('Invalid email or password. Please try again.');
            console.error("Sign-in error:", result?.error);
        }
    }

    return (
        <form onSubmit={handleLoginSubmit}>
            <label htmlFor="emailInput">Email</label>
            <input 
                type="email" 
                id="emailInput" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="passwordInput">Password</label>
            <input 
                type="password" 
                id="passwordInput" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    )
}