import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Contract } from '@/app/types/contract';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_REST_API_TOKEN!
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
): Promise<NextResponse> {
  try {
    const { contractId } = await params;
    
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data);

    const contract = contracts.find((c: Contract) => c.id === contractId);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error loading contract:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { contractId: string } }
) {
  try {
    // Contract aus Redis löschen
    await redis.del(params.contractId);
    
    // Contract-ID aus der contracts_list entfernen
    const contractsList = await redis.get<string[]>('contracts_list') || [];
    const updatedList = contractsList.filter(id => id !== params.contractId);
    await redis.set('contracts_list', updatedList);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
} 