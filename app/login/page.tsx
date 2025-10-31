'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Header } from '@/components/Header';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/2fa');
    }
  }, [user, authLoading, router]);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.length <= 100;
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must be at least 8 characters with letters, numbers, and special characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
      }

      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Redirect to 2FA page
      setTimeout(() => {
        router.push('/2fa');
      }, 1500);
    } catch (error: any) {
      console.error('Auth error:', error);

      const errorCode = error.code;

      if (errorCode === 'auth/email-already-in-use') {
        toast.error('Email already in use. Try logging in instead.');
      } else if (errorCode === 'auth/user-not-found') {
        toast.error('No account found. Create an account first.');
      } else if (errorCode === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (errorCode === 'auth/invalid-email') {
        toast.error('Invalid email format');
      } else if (errorCode === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else if (errorCode === 'auth/too-many-requests') {
        toast.error('Too many attempts. Try again later.');
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f0f0f] dark:via-gray-900 dark:to-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f0f0f] dark:via-gray-900 dark:to-[#0f0f0f] transition-colors">
      <Header />
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="flex items-center justify-center p-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Wallet2FA</CardTitle>
                </div>
                <Sparkles className="h-5 w-5 text-violet-500" />
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {isSignUp ? 'Create your account to get started' : 'Sign in to continue to 2FA verification'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={100}
                    className="bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={loading}
                  />
                  {isSignUp && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Must be 8+ characters with letters, numbers, and special characters
                    </p>
                  )}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isSignUp ? (
                      'Create Account'
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  disabled={loading}
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                </button>
              </div>

              <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
                <p className="text-xs text-indigo-700 dark:text-indigo-400 text-center flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  After login, you'll verify with MetaMask wallet signature
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
