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
import { Shield, LogOut, Loader2, ExternalLink, Copy, CheckCircle, RefreshCw, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { SkeletonTable } from '@/components/SkeletonLoader';

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

      const filter = contract.filters.LoginProof();
      const currentBlock = await contract.runner?.provider?.getBlockNumber();

      if (!currentBlock) {
        throw new Error('Could not get current block');
      }

      const fromBlock = Math.max(0, currentBlock - 10000);
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);

      const parsedProofs: LoginProof[] = events
        .map((event: any) => ({
          nonceHash: event.args.nonceHash,
          user: event.args.user,
          timestamp: Number(event.args.timestamp),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
        }))
        .reverse();

      setProofs(parsedProofs.slice(0, 10));
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f0f0f] dark:via-gray-900 dark:to-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f0f0f] dark:via-gray-900 dark:to-[#0f0f0f] transition-colors">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Login Proof Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              View your immutable login records on Sepolia blockchain
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }}>
              <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur shadow-lg hover:shadow-xl transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Logins</p>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">{proofs.length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }}>
              <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur shadow-lg hover:shadow-xl transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Network</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">Sepolia Testnet</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }}>
              <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur shadow-lg hover:shadow-xl transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Login</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {proofs.length > 0 ? formatTimestamp(proofs[0].timestamp) : 'No logins yet'}
                      </p>
                    </div>
                    <Button
                      onClick={fetchLoginProofs}
                      variant="outline"
                      size="icon"
                      className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      disabled={loading}
                    >
                      <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Login Proofs Table */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Recent Login Proofs</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  On-chain verification records (last 10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <SkeletonTable rows={3} />
                ) : proofs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <Shield className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">No login proofs found yet</p>
                    <Link href="/2fa">
                      <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg">
                        Complete 2FA Login
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" role="table">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Timestamp
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Nonce Hash
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Wallet Address
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Transaction
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {proofs.map((proof, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                          >
                            <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                              {formatTimestamp(proof.timestamp)}
                            </td>
                            <td className="py-4 px-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                <span>{truncateAddress(proof.nonceHash)}</span>
                                <button
                                  onClick={() => copyToClipboard(proof.nonceHash, 'Nonce hash')}
                                  className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                  aria-label="Copy nonce hash"
                                >
                                  {copiedHash === proof.nonceHash ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                <span>{truncateAddress(proof.user)}</span>
                                <button
                                  onClick={() => copyToClipboard(proof.user, 'Wallet address')}
                                  className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                  aria-label="Copy wallet address"
                                >
                                  {copiedHash === proof.user ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm">
                              <a
                                href={`https://sepolia.etherscan.io/tx/${proof.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                              >
                                <span className="font-mono">{truncateAddress(proof.txHash)}</span>
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Box */}
          <motion.div variants={itemVariants} className="mt-6 p-5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
            <p className="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed">
              <Shield className="inline h-4 w-4 mr-1" />
              <strong>Note:</strong> All login proofs are permanently stored on the Sepolia blockchain and can be
              independently verified on Etherscan. This provides an immutable audit trail of authentication events.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
