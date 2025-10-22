'use client';

import { useState, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
//import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
        setError(null);
        e.preventDefault();
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            router.push('/');
        } else {
            setError('Invalid email or password. Please try again.');
            console.error("Sign-in error");
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center">
                    <img
                        src="/SarelsLogo.png" // Still points to the file in /public
                        alt="Sarel's Motors Logo"
                        width="350" 
                        className="mx-auto mb-4"
                    />
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>Enter your email and password</CardDescription>
                </CardHeader>
                <form onSubmit={handleLoginSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="emailInput">Email</Label>
                            <Input
                                id="emailInput"
                                name="email"
                                type="email"
                                placeholder="user@garage.co.za"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2" >
                            <Label htmlFor="passwordInput">Password</Label>
                            <Input
                                id="passwordInput"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {/* Display error message inside the card content */}
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}