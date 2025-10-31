import { NextRequest, NextResponse } from 'next/server';
import { generateNonce, hashNonce } from '@/lib/utils';
import { nonceStore } from '@/lib/nonceStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Generate random nonce
    const nonce = generateNonce();
    const timestamp = Date.now();
    const nonceHash = hashNonce(nonce, timestamp, userId);

    // Store nonce with 5-minute expiry
    const expiry = timestamp + (5 * 60 * 1000);
    nonceStore.set(userId, { nonce, hash: nonceHash, expiry });

    return NextResponse.json({
      success: true,
      nonce,
      nonceHash,
      expiresAt: expiry,
    });
  } catch (error: any) {
    console.error('Nonce generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  const stored = nonceStore.get(userId);

  if (!stored) {
    return NextResponse.json(
      { error: 'No nonce found for this user' },
      { status: 404 }
    );
  }

  if (stored.expiry < Date.now()) {
    nonceStore.delete(userId);
    return NextResponse.json(
      { error: 'Nonce has expired' },
      { status: 410 }
    );
  }

  return NextResponse.json({
    success: true,
    nonce: stored.nonce,
    nonceHash: stored.hash,
    expiresAt: stored.expiry,
  });
}
