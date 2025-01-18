import ContractsList from './ContractsList';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'; // Wichtig für die Aktualisierung

async function getContracts() {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data).contracts;
    return contracts;
  } catch (error) {
    console.error('Error loading contracts:', error);
    return [];
  }
}

export default async function Home() {
  const contracts = await getContracts();

  return (
    <main className="min-h-screen bg-background">
      <ContractsList initialContracts={contracts} />
    </main>
  );
}
