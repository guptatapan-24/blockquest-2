import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import CryptoJS from 'crypto-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate random nonce (32 bytes as hex string)
export const generateNonce = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// Hash nonce with timestamp and user ID for uniqueness
export const hashNonce = (nonce: string, timestamp: number, userId: string): string => {
  return CryptoJS.SHA256(nonce + timestamp.toString() + userId).toString();
};

// Convert hex string to bytes32 for Solidity
export const hexToBytes32 = (hex: string): string => {
  // Ensure 0x prefix
  if (!hex.startsWith('0x')) {
    hex = '0x' + hex;
  }
  // Pad to 32 bytes (64 hex chars + 0x)
  return hex.padEnd(66, '0');
};

// Format timestamp for display
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Truncate address for display
export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
