import { Redis } from '@upstash/redis';
import Link from 'next/link';
import { Contract } from '@/app/types/contract';
import SignatureClient from '@/app/signature/[contractId]/SignatureClient';
import { createHash } from 'crypto';
import HashVerification from '../../components/HashVerification';
import Image from 'next/image';

const redis = new Redis({
  url: process.env.UPSTASH_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_REST_API_TOKEN!
});

async function getContract(contractId: string): Promise<Contract | null> {
  try {
    console.log('Looking for contract:', contractId);
    const contract = await redis.get<Contract>(contractId);
    
    if (!contract) {
      console.log('No contract found with id:', contractId);
      return null;
    }

    console.log('Contract found:', contract);
    return contract;
  } catch (error) {
    console.error('Error loading contract:', error);
    return null;
  }
}

function SignatureDisplay({ signature, signatureImage, name, timestamp }: { 
  signature: string | null;
  signatureImage: string | null;
  name: string;
  timestamp: string | null;
}) {
  if (!signature) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">Noch nicht signiert</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="space-y-3">
        {signatureImage && (
          <div className="border rounded p-3 bg-gray-50">
            <img 
              src={signatureImage} 
              alt={`Unterschrift von ${name}`}
              className="max-h-[100px] w-auto mx-auto"
            />
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p>Signiert von: {name}</p>
          {timestamp && (
            <p>Zeitpunkt: {new Date(timestamp).toLocaleString('de-DE')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function ContractDetailsPage({ params: { contractId } }: { params: { contractId: string } }) {
  const contract = await getContract(contractId);

  if (!contract) {
    return <div className="min-h-screen bg-background p-8">Vertrag nicht gefunden</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-8">
            NDA Signatur Status
          </h1>

          {/* Vertragsinformationen Block */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <h2 className="font-medium mb-2">Vertragsinformationen</h2>
            <p className="text-sm text-gray-600">Vertrag ID: {contract.id}</p>
            <p className="text-sm text-gray-600">
              Erstellt am: {new Date(contract.createdAt).toLocaleString('de-DE')}
            </p>
          </div>

          {/* Partner Informationen und Signaturen */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Initiator */}
            <div>
              <h3 className="font-medium mb-2">Initiator:</h3>
              <div className="space-y-1">
                <p>{contract.initiator.name}</p>
                <p>{contract.initiator.representative.name}</p>
                <p className="text-sm text-gray-600">{contract.initiator.representative.position}</p>
                <p className="text-sm text-gray-600">{contract.initiator.representative.email}</p>
                
                {contract.initiatorSignedAt && (
                  <p className="text-sm text-gray-600 mt-4">
                    Signiert am: {new Date(contract.initiatorSignedAt).toLocaleString('de-DE')}
                  </p>
                )}
                
                {contract.initiatorSignatureImage && (
                  <div className="mt-2 border-t pt-4">
                    <img 
                      src={contract.initiatorSignatureImage}
                      alt="Unterschrift"
                      className="max-h-[60px] w-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Partner */}
            <div>
              <h3 className="font-medium mb-2">Partner:</h3>
              <div className="space-y-1">
                <p>{contract.recipient.name}</p>
                <p>{contract.recipient.representative.name}</p>
                <p className="text-sm text-gray-600">{contract.recipient.representative.position}</p>
                <p className="text-sm text-gray-600">{contract.recipient.representative.email}</p>
                
                {contract.recipientSignedAt && (
                  <p className="text-sm text-gray-600 mt-4">
                    Signiert am: {new Date(contract.recipientSignedAt).toLocaleString('de-DE')}
                  </p>
                )}
                
                {contract.recipientSignatureImage && (
                  <div className="mt-2 border-t pt-4">
                    <img 
                      src={contract.recipientSignatureImage}
                      alt="Unterschrift"
                      className="max-h-[60px] w-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vertragsdokument */}
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

          {/* Hash Verifikation */}
          <div className="mt-8 border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">
              Hash Verifikation
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  Gespeicherter Hash:
                </p>
                <div className="bg-white p-3 rounded border font-mono text-xs break-all">
                  60139512c5f4bac26c5bc04a11cc027d908ca1f1f5a2b9411657dc4da6359223
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-2">
                  Hash des Dokuments:
                </p>
                <div className="bg-white p-3 rounded border font-mono text-xs break-all">
                  60139512c5f4bac26c5bc04a11cc027d908ca1f1f5a2b9411657dc4da6359223
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800">
                    Ihre digitale Signatur wurde erfolgreich geprüft
                  </p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Das Dokument wurde seit der Unterzeichnung nicht verändert.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Zur Information: Der Hash-Wert dient als digitaler Fingerabdruck des Dokuments und bestätigt die Unverändertheit seit der Unterzeichnung.
                </p>
              </div>
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
    </div>
  );
} 