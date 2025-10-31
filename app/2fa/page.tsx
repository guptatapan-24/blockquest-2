'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { getContract } from '@/lib/ethers';
import { hexToBytes32 } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Loader2, Copy, CheckCircle, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default function TwoFactorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { account, loading: walletLoading, connectWallet, signMessage } = useWallet();
  const [nonce, setNonce] = useState<string>('');
  const [nonceHash, setNonceHash] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && !nonce) {
      fetchNonce();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (nonce) setCurrentStep(2);
    if (account) setCurrentStep(3);
  }, [nonce, account]);

  const fetchNonce = async () => {
    try {
      const response = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, email: user?.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate nonce');
      }

      setNonce(data.nonce);
      setNonceHash(data.nonceHash);
    } catch (error: any) {
      console.error('Nonce fetch error:', error);
      toast.error(error.message || 'Failed to generate challenge');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(nonce);
    setCopied(true);
    toast.success('Nonce copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignAndVerify = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!nonce) {
      toast.error('Nonce not available');
      return;
    }

    setVerifying(true);
    NProgress.start();

    try {
      setCurrentStep(4);
      toast.loading('Sign the message in MetaMask...');
      const signature = await signMessage(nonce);

      if (!signature) {
        throw new Error('Signature failed');
      }

      toast.dismiss();
      setCurrentStep(5);
      toast.loading('Verifying signature...');

      const verifyResponse = await fetch('/api/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature,
          nonce,
          nonceHash,
          walletAddress: account,
          userId: user?.uid,
          email: user?.email,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Verification failed');
      }

      toast.dismiss();
      setCurrentStep(6);
      toast.loading('Logging proof on-chain...');

      const contract = await getContract();
      const tx = await contract.logProof(hexToBytes32(nonceHash));

      toast.dismiss();
      toast.loading('Waiting for blockchain confirmation...');

      await tx.wait();

      toast.dismiss();
      toast.success('Login successful! Proof logged on-chain.');
      NProgress.done();

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('2FA verification error:', error);
      toast.dismiss();
      NProgress.done();

      if (error.message.includes('rejected') || error.message.includes('denied')) {
        toast.error('Signature rejected by user');
      } else if (error.message.includes('already exists')) {
        toast.error('This nonce has already been used');
      } else {
        toast.error(error.message || 'Verification failed');
      }
      setCurrentStep(3);
    } finally {
      setVerifying(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f0f0f] dark:via-gray-900 dark:to-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Nonce Generated', completed: currentStep > 1 },
    { num: 2, label: 'Connect Wallet', completed: currentStep > 2 },
    { num: 3, label: 'Sign Message', completed: currentStep > 3 },
    { num: 4, label: 'Verify Signature', completed: currentStep > 4 },
    { num: 5, label: 'On-Chain Log', completed: currentStep > 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f0f0f] dark:via-gray-900 dark:to-[#0f0f0f] transition-colors">
      <Header />

      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {steps.map((step, index) => (
                <div key={step.num} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        step.completed
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                          : currentStep === step.num
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-5 w-5" /> : step.num}
                    </motion.div>
                    <span className="text-xs mt-2 text-center text-gray-600 dark:text-gray-400 hidden md:block">
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur shadow-2xl">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  2FA Wallet Verification
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Sign the nonce with your MetaMask wallet to complete authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Logged in as:</p>
                <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
              </motion.div>

              {/* Nonce Display */}
              <AnimatePresence>
                {nonce && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Challenge Nonce:
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 font-mono text-sm text-gray-900 dark:text-white break-all">
                        {nonce}
                      </div>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="icon"
                        className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={!nonce}
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This unique nonce will be signed by your wallet to prove ownership
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wallet Connection */}
              <div className="space-y-3">
                {!account ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={connectWallet}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg shadow-orange-500/30"
                      disabled={walletLoading || !nonce}
                    >
                      {walletLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-5 w-5" />
                          Connect MetaMask Wallet
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg"
                    >
                      <p className="text-sm text-green-700 dark:text-green-400 mb-1 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Wallet Connected
                      </p>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">{account}</p>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleSignAndVerify}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30"
                        disabled={verifying || !nonce}
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-5 w-5" />
                            Sign & Verify
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                  <Shield className="inline h-4 w-4 mr-1" />
                  <strong>How it works:</strong> Your wallet will sign the nonce message. The signature proves you control
                  the wallet without revealing your private key. The proof is then logged on Sepolia blockchain for
                  immutable audit.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
