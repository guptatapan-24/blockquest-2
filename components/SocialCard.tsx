'use client';

import { ArrowUp, ExternalLink, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SocialCardProps {
  post: {
    title: string;
    author: string;
    ups: number;
    selftext?: string;
    permalink: string;
    created_utc: number;
  };
  proofTxHash?: string;
  index: number;
}

export function SocialCard({ post, proofTxHash, index }: SocialCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-white hover:text-indigo-400 transition-colors">
              {post.title}
            </h3>
            {proofTxHash && (
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                  <Shield className="h-3 w-3 text-indigo-400" />
                  <span className="text-xs text-indigo-400 font-medium">Secured</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400 mt-2">
            <span>u/{post.author}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4" />
              <span>{post.ups.toLocaleString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {post.selftext && (
            <p className="text-gray-300 text-sm">{truncateText(post.selftext, 200)}</p>
          )}
          <div className="flex items-center gap-3">
            <a
              href={`https://reddit.com${post.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-blue-400 hover:text-blue-300 hover:bg-gray-700"
              >
                View on Reddit
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </a>
            {proofTxHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${proofTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-indigo-600 text-indigo-400 hover:text-indigo-300 hover:bg-gray-700"
                >
                  <Shield className="mr-2 h-3 w-3" />
                  Proof
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
