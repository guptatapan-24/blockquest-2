'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getContractReadOnly } from '@/lib/ethers';
import { formatTimestamp, truncateAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogOut, Loader2, ExternalLink, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface LoginProof {
  nonceHash: string;
  user: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [proofs, setProofs] = useState<LoginProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchLoginProofs();
    }
  }, [user, authLoading, router]);

  const fetchLoginProofs = async () => {
    try {
      setLoading(true);
      
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        toast.error('Smart contract not configured. Please deploy and configure the contract.');
        setProofs([]);
        return;
      }

      const contract = getContractReadOnly();
      
      // Get LoginProof events
      const filter = contract.filters.LoginProof();
      const currentBlock = await contract.runner?.provider?.getBlockNumber();
      
      if (!currentBlock) {
        throw new Error('Could not get current block');
      }

      // Query last 10,000 blocks (adjust as needed)
      const fromBlock = Math.max(0, currentBlock - 10000);
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);

      // Parse events
      const parsedProofs: LoginProof[] = events.map((event: any) => ({
        nonceHash: event.args.nonceHash,
        user: event.args.user,
        timestamp: Number(event.args.timestamp),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
      })).reverse(); // Most recent first

      setProofs(parsedProofs.slice(0, 10)); // Show last 10
    } catch (error: any) {
      console.error('Error fetching proofs:', error);
      toast.error(error.message || 'Failed to fetch login proofs');
      setProofs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">Wallet2FA Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:inline">{user?.email}</span>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Login Proof Dashboard</h1>
          <p className="text-gray-400">View your immutable login records on Sepolia blockchain</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Logins</p>
                  <p className="text-3xl font-bold text-white">{proofs.length}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Network</p>
                  <p className="text-xl font-bold text-white">Sepolia Testnet</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Last Login</p>
                  <p className="text-sm font-medium text-white">
                    {proofs.length > 0 ? formatTimestamp(proofs[0].timestamp) : 'No logins yet'}
                  </p>
                </div>
                <Button
                  onClick={fetchLoginProofs}
                  variant="outline"
                  size="icon"
                  className="border-gray-600 text-white hover:bg-gray-700"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Proofs Table */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Recent Login Proofs</CardTitle>
            <CardDescription className="text-gray-400">
              On-chain verification records (last 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            ) : proofs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No login proofs found yet</p>
                <Link href="/2fa">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Complete 2FA Login
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Timestamp</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Nonce Hash</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Wallet Address</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Transaction</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proofs.map((proof, index) => (
                      <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                        <td className="py-3 px-4 text-sm text-white">
                          {formatTimestamp(proof.timestamp)}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-300">
                          <div className="flex items-center gap-2">
                            <span>{truncateAddress(proof.nonceHash)}</span>
                            <button
                              onClick={() => copyToClipboard(proof.nonceHash, 'Nonce hash')}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              {copiedHash === proof.nonceHash ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-300">
                          <div className="flex items-center gap-2">
                            <span>{truncateAddress(proof.user)}</span>
                            <button
                              onClick={() => copyToClipboard(proof.user, 'Wallet address')}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              {copiedHash === proof.user ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${proof.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <span className="font-mono">{truncateAddress(proof.txHash)}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            ✓ Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-400">
            ℹ️ <strong>Note:</strong> All login proofs are permanently stored on the Sepolia blockchain and can be independently verified on Etherscan. This provides an immutable audit trail of authentication events.
          </p>
        </div>
      </div>
    </div>
  );
}
