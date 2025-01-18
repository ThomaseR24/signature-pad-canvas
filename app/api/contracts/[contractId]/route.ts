import { promises as fs } from 'fs';
import path from 'path';
import { Contract } from '@/app/types/contract';

export async function GET(
  _request: Request,
  { params }: { params: { contractId: string } }
) {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data);

    const contract = contracts.find((c: Contract) => c.id === params.contractId);

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