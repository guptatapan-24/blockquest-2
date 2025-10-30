import { useState, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { switchToSepolia } from '@/lib/ethers';
import toast from 'react-hot-toast';

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask not detected. Please install MetaMask.');
      return null;
    }

    try {
      setLoading(true);

      // Request account access
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to Sepolia
      await switchToSepolia();
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
      
      return address;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else if (error.code === -32002) {
        toast.error('Connection request pending. Check MetaMask.');
      } else {
        toast.error(error.message || 'Failed to connect wallet');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signMessage = useCallback(async (message: string) => {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      
      return signature;
    } catch (error: any) {
      console.error('Signature error:', error);
      
      if (error.code === 4001) {
        throw new Error('Signature rejected by user');
      }
      
      throw new Error(error.message || 'Failed to sign message');
    }
  }, []);

  return { account, loading, connectWallet, signMessage };
};
