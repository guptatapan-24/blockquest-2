# Wallet2FA Smart Contract Deployment Instructions

## 📋 Prerequisites
- MetaMask wallet installed
- Sepolia test ETH (get from faucet: https://sepoliafaucet.com or https://www.alchemy.com/faucets/ethereum-sepolia)
- Need at least 0.001 ETH for deployment (~30k gas)

## 🚀 Deployment Steps via Remix IDE

### 1. Open Remix
- Go to https://remix.ethereum.org

### 2. Create Contract File
- In File Explorer (left panel), click "contracts" folder
- Create new file: `Wallet2FA.sol`
- Copy the entire contract code from `/app/contracts/Wallet2FA.sol`

### 3. Compile Contract
- Click "Solidity Compiler" tab (left sidebar)
- Select compiler version: **0.8.24** or higher
- Click "Compile Wallet2FA.sol"
- Verify green checkmark appears

### 4. Deploy to Sepolia
- Click "Deploy & Run Transactions" tab
- **Environment**: Select "Injected Provider - MetaMask"
- MetaMask will popup - **switch to Sepolia network**
- Confirm connection in MetaMask
- Under "Contract", select "Wallet2FA"
- Click **"Deploy"** button (orange)
- MetaMask will ask to confirm transaction
- **IMPORTANT**: Save the transaction hash and wait for confirmation

### 5. Get Contract Details
Once deployed (wait ~15 seconds):
- **Contract Address**: Copy from Remix console (looks like `0x1234...abcd`)
- **ABI**: 
  - In Remix, click "Solidity Compiler" tab
  - Scroll down to "Compilation Details"
  - Click "ABI" button to copy
  - It's a JSON array - save it

### 6. Verify on Etherscan (Optional but Recommended)
- Go to https://sepolia.etherscan.io
- Search your contract address
- Click "Contract" → "Verify and Publish"
- Follow wizard (compiler version 0.8.24, no optimization)

## 📝 What You Need to Provide Back
After successful deployment, share:
1. **Contract Address**: `0x...`
2. **ABI**: The JSON array from Remix

## 🔍 Verify Deployment
After deployment, you can test in Remix:
- Under "Deployed Contracts", expand your contract
- Try calling `loginCount` with any address (should return 0)
- Transaction hash viewable at: `https://sepolia.etherscan.io/tx/YOUR_TX_HASH`

## ⚠️ Troubleshooting
- **Insufficient funds**: Get more test ETH from faucet
- **Wrong network**: Make sure MetaMask shows "Sepolia" not "Ethereum Mainnet"
- **Compilation error**: Double-check pragma version matches (0.8.24)

---

Once you have the **Contract Address** and **ABI**, provide them so we can integrate into the app!
