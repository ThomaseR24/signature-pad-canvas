import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { Contract } from '@/app/types/contract';

const redis = new Redis({
  url: process.env.UPSTASH_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_REST_API_TOKEN!
});

export async function POST(request: NextRequest) {
  try {
    const { contractId, party, signature, signatureImage, timestamp } = await request.json();
    
    const contract = await redis.get<Contract>(contractId);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Update contract with signature
    if (party === 'initiator') {
      contract.initiatorSignature = signature;
      contract.initiatorSignatureImage = signatureImage;
      contract.initiatorSignedAt = timestamp;
    } else {
      contract.recipientSignature = signature;
      contract.recipientSignatureImage = signatureImage;
      contract.recipientSignedAt = timestamp;
    }

    await redis.set(contractId, contract);

    return NextResponse.json({
      success: true,
      message: 'Signature saved successfully'
    });

  } catch (error) {
    console.error('Error saving signature:', error);
    return NextResponse.json(
      { error: 'Failed to save signature' },
      { status: 500 }
    );
  }
} 