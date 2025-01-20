import { Redis } from '@upstash/redis';
import { Contract } from './types/contract';
import Link from 'next/link';
import ContractList from './components/ContractList';

// Redis Client initialisieren
const redis = new Redis({
  url: process.env.UPSTASH_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_REST_API_TOKEN!
});

async function getContracts(): Promise<Contract[]> {
  try {
    console.log('Redis Config:', {
      hasUrl: !!process.env.UPSTASH_KV_REST_API_URL,
      hasToken: !!process.env.UPSTASH_KV_REST_API_TOKEN
    });

    // Hole alle Contract IDs aus der contracts_list
    const contractsList = await redis.get<string[]>('contracts_list') || [];
    console.log('Raw contracts_list:', contractsList);

    if (!contractsList.length) {
      console.log('No contracts found in list');
      return [];
    }

    // Hole die Daten für jeden Contract
    const contracts = await Promise.all(
      contractsList.map(async (contractId) => {
        console.log('Fetching contract:', contractId);
        const contract = await redis.get<Contract>(contractId);
        console.log('Contract data:', contract);
        return contract;
      })
    );

    const filteredContracts = contracts.filter((contract): contract is Contract => 
      contract !== null && contract !== undefined
    );
    
    console.log('Final contracts:', filteredContracts);
    return filteredContracts;

  } catch (error) {
    console.error('Error loading contracts from Redis:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return [];
  }
}

export const revalidate = 0; // Deaktiviert das Caching
// oder
export const dynamic = 'force-dynamic';

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
