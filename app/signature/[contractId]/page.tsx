import { promises as fs } from 'fs';
import path from 'path';
import SignatureClient from './SignatureClient';
import { Contract } from '@/app/types/contract';

async function getContract(contractId: string): Promise<Contract | null> {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data);
    
    console.log('Looking for contract:', contractId);
    // Suche nach 'id' statt 'contractId'
    const contract = contracts.find((c: Contract) => c.id === contractId);
    
    if (!contract) {
      console.log('No contract found with id:', contractId);
      return null;
    }
    
    return contract;
  } catch (error) {
    console.error('Error loading contract:', error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ contractId: string }>;
}

export default async function SignaturePage({ params }: PageProps) {
  // Warten auf params
  const resolvedParams = await params;
  const contractId = resolvedParams.contractId;
  
  console.log('Loading contract:', contractId);
  const contract = await getContract(contractId);

  if (!contract) {
    return (
      <div className="min-h-screen bg-background p-8">
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-8">
          NDA Signatur Status
        </h1>

        {/* Vertragsdetails */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Vertragsinformationen</h2>
            <p className="text-sm text-gray-600">Vertrag ID: {contract.id}</p>
            <p className="text-sm text-gray-600">
              Erstellt am: {new Date(contract.createdAt).toLocaleString('de-DE')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Initiator Details */}
            <div className="space-y-2">
              <h3 className="font-medium">Initiator:</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{contract.initiator.name}</p>
                <p>{contract.initiator.representative.name}</p>
                <p className="text-sm text-gray-600">
                  {contract.initiator.representative.position}
                </p>
                <p className="text-sm text-gray-600">
                  {contract.initiator.representative.email}
                </p>
              </div>
            </div>

            {/* Partner Details */}
            <div className="space-y-2">
              <h3 className="font-medium">Partner:</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{contract.recipient.name}</p>
                <p>{contract.recipient.representative.name}</p>
                <p className="text-sm text-gray-600">
                  {contract.recipient.representative.position}
                </p>
                <p className="text-sm text-gray-600">
                  {contract.recipient.representative.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Vorschau */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Vertragsdokument</h2>
          <div className="border rounded-lg p-4">
            <div className="mb-4">
              <a 
                href={contract.pdfUrl}
                target="_blank"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                PDF öffnen
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            <iframe
              src={`${contract.pdfUrl}#view=FitH`}
              className="w-full h-[500px] border rounded"
            />
          </div>
        </div>

        {/* Client Komponente für Signatur-Funktionalität */}
        <SignatureClient contract={contract} />
      </div>
    </div>
  );
} 