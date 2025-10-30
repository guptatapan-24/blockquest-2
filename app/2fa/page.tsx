'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { getContract } from '@/lib/ethers';
import { hexToBytes32 } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Loader2, Copy, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TwoFactorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { account, loading: walletLoading, connectWallet, signMessage } = useWallet();
  const [nonce, setNonce] = useState<string>('');
  const [nonceHash, setNonceHash] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Fetch nonce from API when user is authenticated
    if (user && !nonce) {
      fetchNonce();
    }
  }, [user, authLoading, router]);

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

    try {
      // Step 1: Sign the nonce
      toast.loading('Sign the message in MetaMask...');
      const signature = await signMessage(nonce);
      
      if (!signature) {
        throw new Error('Signature failed');
      }

      toast.dismiss();
      toast.loading('Verifying signature...');

      // Step 2: Send to backend for verification
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
      toast.loading('Logging proof on-chain...');

      // Step 3: Log proof on-chain
      const contract = await getContract();
      const tx = await contract.logProof(hexToBytes32(nonceHash));
      
      toast.dismiss();
      toast.loading('Waiting for blockchain confirmation...');
      
      await tx.wait();

      toast.dismiss();
      toast.success('Login successful! Proof logged on-chain.');

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('2FA verification error:', error);
      toast.dismiss();
      
      if (error.message.includes('rejected') || error.message.includes('denied')) {
        toast.error('Signature rejected by user');
      } else if (error.message.includes('already exists')) {
        toast.error('This nonce has already been used');
      } else {
        toast.error(error.message || 'Verification failed');
      }
    } finally {
      setVerifying(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <CardTitle className="text-2xl font-bold text-white">2FA Wallet Verification</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Sign the nonce with your MetaMask wallet to complete authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-400 mb-1">Logged in as:</p>
            <p className="text-white font-medium">{user?.email}</p>
          </div>

          {/* Nonce Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Your Challenge Nonce:</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-gray-700/50 rounded-lg border border-gray-600 font-mono text-sm text-white break-all">
                {nonce || 'Loading...'}
              </div>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="border-gray-600 text-white hover:bg-gray-700"
                disabled={!nonce}
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              This unique nonce will be signed by your wallet to prove ownership
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="space-y-3">
            {!account ? (
              <Button
                onClick={connectWallet}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={walletLoading || !nonce}
              >
                {walletLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect MetaMask Wallet
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 mb-1">✅ Wallet Connected</p>
                  <p className="text-white font-mono text-sm">{account}</p>
                </div>

                <Button
                  onClick={handleSignAndVerify}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={verifying || !nonce}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Sign & Verify'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">
              ℹ️ <strong>How it works:</strong> Your wallet will sign the nonce message. The signature proves you control the wallet without revealing your private key. The proof is then logged on Sepolia blockchain for immutable audit.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-300">Verification Steps:</p>
            <ol className="space-y-1 text-sm text-gray-400 list-decimal list-inside">
              <li className={nonce ? 'text-green-400' : ''}>Generate unique nonce challenge ✓</li>
              <li className={account ? 'text-green-400' : ''}>Connect MetaMask wallet {account && '✓'}</li>
              <li>Sign nonce message in MetaMask</li>
              <li>Verify signature on server</li>
              <li>Log proof on Sepolia smart contract</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
