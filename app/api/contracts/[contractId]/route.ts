import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { Contract } from '@/app/types/contract';

interface RouteContext {
  params: {
    contractId: string;
  };
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data);

    const contract = contracts.find((c: Contract) => c.id === context.params.contractId);

    if (!contract) {
      return Response.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return Response.json(contract);
  } catch (error) {
    console.error('Error loading contract:', error);
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 