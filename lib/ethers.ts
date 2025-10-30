import { ethers, BrowserProvider, JsonRpcProvider, Contract } from 'ethers';

// Get contract ABI from environment
export const getContractABI = () => {
  try {
    const abi = process.env.NEXT_PUBLIC_CONTRACT_ABI;
    return abi ? JSON.parse(abi) : [];
  } catch (error) {
    console.error('Error parsing contract ABI:', error);
    return [];
  }
};

// Get contract instance with signer (for transactions)
export const getContract = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Contract address not configured');
  }

  return new Contract(contractAddress, getContractABI(), signer);
};

// Get contract instance with provider (for reading)
export const getContractReadOnly = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC;
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
  if (!rpcUrl) {
    throw new Error('RPC URL not configured');
  }
  
  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Contract address not configured');
  }

  const provider = new JsonRpcProvider(rpcUrl);
  return new Contract(contractAddress, getContractABI(), provider);
};

// Verify message signature
export const verifySignature = (message: string, signature: string): string => {
  try {
    return ethers.verifyMessage(message, signature);
  } catch (error) {
    throw new Error('Invalid signature');
  }
};

// Switch to Sepolia network
export const switchToSepolia = async () => {
  if (!window.ethereum) throw new Error('MetaMask not detected');

  const chainId = '0xaa36a7'; // Sepolia chain ID in hex

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error: any) {
    // Chain not added yet
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId,
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [process.env.NEXT_PUBLIC_SEPOLIA_RPC],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      });
    } else {
      throw error;
    }
  }
};
