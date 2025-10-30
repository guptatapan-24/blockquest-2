// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Wallet2FA
 * @dev Immutable login proof logger for wallet-based 2FA system
 * @notice Records successful 2FA verifications on Sepolia testnet
 */
contract Wallet2FA {
    // Event emitted when a login proof is logged
    event LoginProof(
        bytes32 indexed nonceHash,
        address indexed user,
        uint256 timestamp
    );

    // Mapping to track if a nonce hash has been used
    mapping(bytes32 => bool) public proofs;
    
    // Mapping to track login count per user
    mapping(address => uint256) public loginCount;

    /**
     * @dev Log a successful login proof on-chain
     * @param nonceHash The SHA256 hash of the nonce that was signed
     * @notice Can only be called once per unique nonce hash
     */
    function logProof(bytes32 nonceHash) external {
        require(!proofs[nonceHash], "Proof already exists");
        require(nonceHash != bytes32(0), "Invalid nonce hash");
        
        proofs[nonceHash] = true;
        loginCount[msg.sender]++;
        
        emit LoginProof(nonceHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Check if a nonce hash has been used
     * @param nonceHash The hash to check
     * @return bool True if proof exists
     */
    function isProofLogged(bytes32 nonceHash) external view returns (bool) {
        return proofs[nonceHash];
    }

    /**
     * @dev Get total login count for a user
     * @param user The user address
     * @return uint256 Number of logins
     */
    function getUserLoginCount(address user) external view returns (uint256) {
        return loginCount[user];
    }
}
