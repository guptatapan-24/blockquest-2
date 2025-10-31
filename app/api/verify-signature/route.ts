import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/ethers';
import { nonceStore } from '@/lib/nonceStore';

// Rate limiting (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(userId);

  if (!limit || limit.resetTime < now) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute
    return true;
  }

  if (limit.count >= 5) {
    return false; // Max 5 attempts per minute
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, nonce, nonceHash, walletAddress, userId, email } = body;

    // Validate inputs
    if (!signature || !nonce || !walletAddress || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify signature
    let recoveredAddress: string;
    try {
      recoveredAddress = verifySignature(nonce, signature);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Check if recovered address matches provided wallet address
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Signature verification failed. Address mismatch.' },
        { status: 401 }
      );
    }

    // In production, verify nonce hasn't been used and isn't expired
    // For MVP, we'll trust the client-side validation

    return NextResponse.json({
      success: true,
      message: 'Signature verified successfully',
      recoveredAddress,
      walletAddress,
    });
  } catch (error: any) {
    console.error('Signature verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to verify signatures' },
    { status: 405 }
  );
}
