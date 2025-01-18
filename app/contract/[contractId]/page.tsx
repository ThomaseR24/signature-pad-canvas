import { promises as fs } from 'fs';
import path from 'path';
import { Contract } from '@/app/types/contract';
import Image from 'next/image';
import Link from 'next/link';
import SignatureClient from './SignatureClient';

async function getContract(contractId: string): Promise<Contract | null> {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data);
    return contracts.find((c: Contract) => c.id === contractId) || null;
  } catch (error) {
    console.error('Error loading contract:', error);
    return null;
  }
}

export default async function ContractDetailsPage({ 
  params 
}: { 
  params: Promise<{ contractId: string }> 
}) {
  const { contractId } = await params;
  const contract = await getContract(contractId);

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-8">
            Vertrag nicht gefunden
          </h1>
          <p className="text-center text-gray-600">
            Der Vertrag mit der ID {contractId} konnte nicht gefunden werden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-center mb-8">
            Vertrag Details
          </h1>

          <div className="space-y-8">
            {/* Vertragsdetails */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Initiator</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Unternehmen:</span> {contract.initiator.name}</p>
                  <p><span className="font-medium">Vertreter:</span> {contract.initiator.representative.name}</p>
                  <p><span className="font-medium">Position:</span> {contract.initiator.representative.position}</p>
                  <p><span className="font-medium">E-Mail:</span> {contract.initiator.representative.email}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Partner</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Unternehmen:</span> {contract.recipient.name}</p>
                  <p><span className="font-medium">Vertreter:</span> {contract.recipient.representative.name}</p>
                  <p><span className="font-medium">Position:</span> {contract.recipient.representative.position}</p>
                  <p><span className="font-medium">E-Mail:</span> {contract.recipient.representative.email}</p>
                </div>
              </div>
            </div>

            {/* Signaturen */}
            <SignatureClient contract={contract} />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    </div>
  );
} 