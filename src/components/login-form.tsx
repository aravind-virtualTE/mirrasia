import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onLogin: (formData: { email: string; password: string }) => void;
  onGoogleLogin: () => void;
  reset: boolean;
}
export function LoginForm({ onLogin, onGoogleLogin, reset }: LoginFormProps) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (reset) {
      console.log("triggered")
      setEmail(''); // Clear email
      setPassword(''); // Clear password
    }
  }, [reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call the onLogin function passed down from the parent
    if (onLogin) onLogin({ email, password });
  };

  const onSignUp = () => {
    navigate('/signup');
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button variant="outline" className="w-full" onClick={onGoogleLogin}>
              <img
                src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                alt="Google"
                className="mr-2 h-4 w-4"
              />
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Button className="underline" onClick={onSignUp}>
              Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
