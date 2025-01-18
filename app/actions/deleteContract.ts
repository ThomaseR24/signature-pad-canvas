'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { Contract } from '@/app/types/contract';
import { revalidatePath } from 'next/cache';

export async function deleteContract(contractId: string) {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data);
    
    const updatedContracts = contracts.filter((c: Contract) => c.id !== contractId);
    await fs.writeFile(contractsPath, JSON.stringify(updatedContracts, null, 2));
    
    revalidatePath('/');
    return true;
  } catch (error) {
    console.error('Error deleting contract:', error);
    return false;
  }
} 