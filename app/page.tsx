import { promises as fs } from 'fs';
import path from 'path';
import ContractsList from './ContractsList';

async function getContracts() {
  const contractsPath = path.join(process.cwd(), 'data/contracts.json');
  const data = await fs.readFile(contractsPath, 'utf8');
  return JSON.parse(data).contracts;
}

export default async function Page() {
  const contracts = await getContracts();
  
  return <ContractsList contracts={contracts} />;
}
