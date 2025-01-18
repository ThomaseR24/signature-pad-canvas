import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Contract } from '@/app/types/contract';

export async function GET(
  request: NextRequest,
  { params }: { params: { contractId: string } }
) {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data).contracts;
    
    const contract = contracts.find((c: any) => c.contractId === params.contractId);
    
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 