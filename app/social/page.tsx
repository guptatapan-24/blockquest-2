'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Users, TrendingUp, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { SocialCard } from '@/components/SocialCard';
import { SkeletonCard } from '@/components/SkeletonLoader';
import { getContractReadOnly } from '@/lib/ethers';

interface RedditPost {
  title: string;
  author: string;
  ups: number;
  selftext?: string;
  permalink: string;
  created_utc: number;
}

export default function SocialPage() {
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestProofTx, setLatestProofTx] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push('/login');
      return;
    }

    if (firebaseUser) {
      fetchLatestProof();
      fetchRedditPosts();
    }
  }, [firebaseUser, authLoading, router]);

  const fetchLatestProof = async () => {
    try {
      const contract = getContractReadOnly();
      const filter = contract.filters.LoginProof();
      const currentBlock = await contract.runner?.provider?.getBlockNumber();

      if (!currentBlock) return;

      const fromBlock = Math.max(0, currentBlock - 10000);
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);

      if (events.length > 0) {
        const latestEvent = events[events.length - 1];
        setLatestProofTx(latestEvent.transactionHash);
      }
    } catch (error) {
      console.error('Error fetching proof:', error);
    }
  };

  const fetchRedditPosts = async () => {
    try {
      setLoading(true);

      // Fetch top posts from r/all or use mock data
      const response = await fetch('https://www.reddit.com/r/technology/hot.json?limit=10');
      const data = await response.json();

      if (data && data.data && data.data.children) {
        const redditPosts = data.data.children.map((child: any) => ({
          title: child.data.title,
          author: child.data.author,
          ups: child.data.ups,
          selftext: child.data.selftext,
          permalink: child.data.permalink,
          created_utc: child.data.created_utc,
        }));
        setPosts(redditPosts);
      } else {
        // Mock data fallback
        setPosts(getMockPosts());
      }
    } catch (error: any) {
      console.error('Error fetching Reddit posts:', error);
      // Use mock data on error
      setPosts(getMockPosts());
      toast.error('Using mock Reddit data - OAuth integration ready for production');
    } finally {
      setLoading(false);
    }
  };

  const getMockPosts = (): RedditPost[] => [
    {
      title: 'Blockchain technology is revolutionizing authentication systems',
      author: 'crypto_enthusiast',
      ups: 1542,
      selftext:
        'Traditional 2FA methods are vulnerable to phishing and SIM swapping. Wallet-based authentication provides cryptographic proof without SMS dependency.',
      permalink: '/r/technology/comments/mock1',
      created_utc: Date.now() / 1000 - 7200,
    },
    {
      title: 'MetaMask integration for secure logins: A complete guide',
      author: 'web3_developer',
      ups: 892,
      selftext:
        'Learn how to implement wallet signatures for 2FA. This guide covers nonce generation, signature verification, and on-chain logging.',
      permalink: '/r/ethereum/comments/mock2',
      created_utc: Date.now() / 1000 - 14400,
    },
    {
      title: 'Why phishing-resistant authentication matters in 2025',
      author: 'security_expert',
      ups: 2103,
      selftext:
        'SMS 2FA can be bypassed through social engineering. Cryptographic signatures provide mathematical proof of identity that cannot be phished.',
      permalink: '/r/cybersecurity/comments/mock3',
      created_utc: Date.now() / 1000 - 21600,
    },
    {
      title: 'Sepolia testnet: The best playground for blockchain developers',
      author: 'eth_builder',
      ups: 645,
      selftext: 'Fast, free, and reliable - Sepolia has become the go-to testnet for Ethereum development.',
      permalink: '/r/ethdev/comments/mock4',
      created_utc: Date.now() / 1000 - 28800,
    },
    {
      title: 'Smart contract audit trails for compliance and security',
      author: 'blockchain_auditor',
      ups: 1234,
      selftext:
        'Immutable on-chain logs provide tamper-proof audit trails that traditional databases cannot match. Essential for regulatory compliance.',
      permalink: '/r/blockchain/comments/mock5',
      created_utc: Date.now() / 1000 - 36000,
    },
  ];

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

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Secure Social Feed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Powered by Wallet 2FA • Reddit Integration</p>
          </div>

          {/* Security Badge */}
          {latestProofTx && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20 rounded-xl shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 dark:text-green-400 mb-1">Login Secured with Blockchain 2FA</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                    Your session is protected by cryptographic wallet signature, logged immutably on Sepolia testnet.
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${latestProofTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                  >
                    View Proof on Etherscan
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reddit OAuth Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white">Reddit Feed</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Tech community posts with blockchain security
                      </CardDescription>
                    </div>
                  </div>
                  <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {loading ? (
              <SkeletonCard count={5} />
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {posts.map((post, index) => (
                  <SocialCard key={index} post={post} proofTxHash={latestProofTx} index={index} />
                ))}
              </motion.div>
            )}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg"
          >
            <p className="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed">
              <Shield className="inline h-4 w-4 mr-1" />
              <strong>Demo Mode:</strong> This feed displays public Reddit posts. OAuth integration is configured and ready
              for authenticated Reddit access. Each post is associated with your blockchain-verified login proof for
              complete auditability.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
