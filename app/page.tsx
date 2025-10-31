'use client';

import { Shield, Lock, CheckCircle, Github, Zap, Database, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';

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

export default function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: 'Phishing Resistant',
      description: 'Cryptographic signatures prevent phishing attacks. Your private key never leaves your wallet.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Database,
      title: 'On-Chain Audits',
      description: 'Every successful login is logged on-chain with timestamp, creating a tamper-proof audit trail.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Social Ready',
      description: 'Integrate Reddit OAuth post-2FA for secure social logins with blockchain proofs.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const steps = [
    { step: 1, title: 'Email/Password Login', desc: 'Sign in with Firebase to get your nonce challenge' },
    { step: 2, title: 'Connect MetaMask', desc: 'Connect wallet on Sepolia and sign the nonce message' },
    { step: 3, title: 'Server Verification', desc: 'Backend verifies signature using ethers.js recovery' },
    { step: 4, title: 'On-Chain Logging', desc: 'Proof written to Sepolia smart contract with timestamp' },
  ];

  const techStack = [
    { name: 'Next.js 14', color: 'text-blue-400' },
    { name: 'Firebase', color: 'text-purple-400' },
    { name: 'Ethers.js v6', color: 'text-orange-400' },
    { name: 'Solidity 0.8.24', color: 'text-green-400' },
    { name: 'MetaMask', color: 'text-yellow-400' },
    { name: 'Sepolia', color: 'text-blue-300' },
    { name: 'Reddit OAuth', color: 'text-orange-500' },
    { name: 'TypeScript', color: 'text-cyan-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f0f0f] dark:via-gray-900 dark:to-[#0f0f0f] transition-colors">
      <Header />

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-20 md:py-32 text-center"
      >
        <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 px-6 py-3 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-full"
          >
            <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">BlockQuest 2025 • Track 4: Blockchain × Cybersecurity</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              Wallet-Based 2FA
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-6">
            Secure logins with crypto wallet signatures—
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">no SMS needed</span>
          </motion.p>

          <motion.p variants={itemVariants} className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Replace traditional 2FA with blockchain-powered authentication. Every login is verified through MetaMask
            signatures and logged immutably on Sepolia testnet for tamper-proof audits. Now with Reddit OAuth for
            secure social logins.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-10 py-7 text-lg shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/50"
                >
                  <Lock className="mr-2 h-6 w-6" />
                  Try Demo Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-10 py-7 text-lg"
                >
                  View Dashboard
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="container mx-auto px-4 py-20"
      >
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
                <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur h-full hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div
                      className={`mb-6 p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl w-fit shadow-lg`}
                    >
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="container mx-auto px-4 py-20 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-3xl my-12"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white"
        >
          How It Works
        </motion.h2>
        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex gap-6 items-start group"
              whileHover={{ x: 10 }}
            >
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{item.title}</h4>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tech Stack */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="container mx-auto px-4 py-20"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white"
        >
          Built With
        </motion.h2>
        <motion.div
          variants={containerVariants}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {techStack.map((tech, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.1, rotate: 2 }}
              className="p-6 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 text-center shadow-lg hover:shadow-xl transition-all"
            >
              <p className={`font-bold text-lg ${tech.color}`}>{tech.name}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-800 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-indigo-500" />
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            Wallet2FA
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Built for BlockQuest 2025 Hackathon • Track 4: Blockchain × Cybersecurity
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Innovating authentication with wallet-based 2FA on Sepolia testnet
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <Github className="h-5 w-5" />
          <span>View on GitHub</span>
        </a>
      </footer>
    </div>
  );
}
