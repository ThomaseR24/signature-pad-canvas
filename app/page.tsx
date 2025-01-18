import { promises as fs } from 'fs';
import path from 'path';
import ContractList from './components/ContractList';
import { Contract } from './types/contract';
import Link from 'next/link';

async function getContracts(): Promise<Contract[]> {
  try {
    const contractsPath = path.join(process.cwd(), 'data', 'contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    
    // Debug Ausgaben
    console.log('Reading contracts from:', contractsPath);
    const contracts = JSON.parse(data);
    console.log('Loaded contracts:', contracts);
    
    // Prüfen ob es ein Array ist oder in einem Objekt verschachtelt ist
    if (Array.isArray(contracts)) {
      return contracts;
    } else if (contracts.contracts && Array.isArray(contracts.contracts)) {
      return contracts.contracts;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading contracts:', error);
    return [];
  }
}

export default async function Home() {
  const contracts = await getContracts();
  
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">
          NDA Übersicht
        </h1>
        
        {contracts.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>Keine Verträge vorhanden</p>
            <Link 
              href="/upload"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Neue NDA signieren
            </Link>
          </div>
        ) : (
          <>
            <ContractList contracts={contracts} />
            <div className="mt-8">
              <Link 
                href="/upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Neue NDA signieren
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
