import { Redis } from '@upstash/redis';
import { Contract } from '@/app/types/contract';
import { notFound } from 'next/navigation';
import SignatureClient from './SignatureClient';

export const revalidate = 0; // Deaktiviert das Caching

// oder alternativ
export const dynamic = 'force-dynamic';

async function getContract(contractId: string): Promise<Contract | null> {
  const redis = new Redis({
    url: process.env.UPSTASH_KV_REST_API_URL!,
    token: process.env.UPSTASH_KV_REST_API_TOKEN!
  });

  try {
    console.log('Loading contract:', contractId);
    const contractData = await redis.get<Contract>(contractId);
    
    if (!contractData) {
      console.log('No contract found with id:', contractId);
      return null;
    }

    console.log('Contract found:', contractData);
    return contractData;
  } catch (error) {
    console.error('Error loading contract:', error);
    return null;
  }
}

export default async function SignaturePage({
  params: { contractId },
}: {
  params: { contractId: string };
}) {
  const contract = await getContract(contractId);

  if (!contract) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-4">
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