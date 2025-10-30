'use client';

import { Shield, Lock, CheckCircle, Github } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold">Wallet2FA</span>
        </div>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <Github className="h-5 w-5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
            BlockQuest 2025 | Track 4: Blockchain × Cybersecurity
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Wallet-Based 2FA
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Secure logins with crypto wallet signatures—<span className="text-blue-400 font-semibold">no SMS needed</span>
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Replace traditional 2FA with blockchain-powered authentication. Every login is verified through MetaMask signatures and logged immutably on Sepolia testnet for tamper-proof audits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                <Lock className="mr-2 h-5 w-5" />
                Try Demo Login
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-6 text-lg">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-4 p-3 bg-blue-500/10 rounded-lg w-fit">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Phishing Resistant</h3>
              <p className="text-gray-400">
                Cryptographic signatures prevent phishing attacks. Your private key never leaves your wallet.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-4 p-3 bg-purple-500/10 rounded-lg w-fit">
                <CheckCircle className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Immutable Proofs</h3>
              <p className="text-gray-400">
                Every successful login is logged on-chain with timestamp, creating a tamper-proof audit trail.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-4 p-3 bg-green-500/10 rounded-lg w-fit">
                <Lock className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Easy Integration</h3>
              <p className="text-gray-400">
                Simple flow: Email/password → MetaMask signature → On-chain verification. No complex infrastructure.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Email/Password Login</h4>
              <p className="text-gray-400">Sign in with Firebase authentication to get your unique nonce challenge.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Connect MetaMask</h4>
              <p className="text-gray-400">Connect your wallet on Sepolia testnet and sign the nonce message.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Server Verification</h4>
              <p className="text-gray-400">Backend verifies signature authenticity using ethers.js recovery.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">4</div>
            <div>
              <h4 className="font-bold text-lg mb-1">On-Chain Logging</h4>
              <p className="text-gray-400">Successful login proof is written to Sepolia smart contract with timestamp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Built With</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="font-bold text-blue-400">Next.js 14</p>
            <p className="text-sm text-gray-400">React Framework</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="font-bold text-purple-400">Firebase</p>
            <p className="text-sm text-gray-400">Authentication</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="font-bold text-orange-400">Ethers.js v6</p>
            <p className="text-sm text-gray-400">Blockchain SDK</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="font-bold text-green-400">Solidity 0.8.24</p>
            <p className="text-sm text-gray-400">Smart Contract</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="font-bold text-yellow-400">MetaMask</p>
            <p className="text-sm text-gray-400">Wallet Provider</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="font-bold text-blue-300">Sepolia</p>
            <p className="text-sm text-gray-400">ETH Testnet</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="font-bold text-pink-400">Tailwind CSS</p>
            <p className="text-sm text-gray-400">Styling</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="font-bold text-cyan-400">TypeScript</p>
            <p className="text-sm text-gray-400">Type Safety</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800 text-center text-gray-400">
        <p>Built for BlockQuest 2025 Hackathon • Track 4: Blockchain × Cybersecurity</p>
        <p className="text-sm mt-2">Innovating authentication with wallet-based 2FA on Sepolia testnet</p>
      </footer>
    </div>
  );
}
