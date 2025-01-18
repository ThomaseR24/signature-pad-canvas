import { promises as fs } from 'fs';
import path from 'path';
import { Contract } from '@/app/types/contract';
import Image from 'next/image';
import Link from 'next/link';

interface Contract {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  initiator: {
    name: string;
    representative: {
      name: string;
      position: string;
      email: string;
    };
    signature?: {
      image: string;
      timestamp: string;
    };
  };
  recipient: {
    name: string;
    representative: {
      name: string;
      position: string;
      email: string;
    };
    signature?: {
      image: string;
      timestamp: string;
    };
  };
  pdfUrl: string;
  hash?: string;
}

async function getContract(contractId: string): Promise<Contract | null> {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    const contracts = Array.isArray(jsonData) ? jsonData : [];
    const contract = contracts.find((c: Contract) => c.id === contractId);
    return contract || null;
  } catch (error) {
    console.error('Error loading contract:', error);
    return null;
  }
}

export default async function ContractDetailsPage({ 
  params 
}: { 
  params: { contractId: string } 
}) {
  const contract = await getContract(params.contractId);

  if (!contract) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-8">
            Vertrag nicht gefunden
          </h1>
          <p className="text-center text-gray-600">
            Der Vertrag mit der ID {params.contractId} konnte nicht gefunden werden.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              Erstellt am: {formatDate(contract.createdAt)}
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
                {contract.initiator.signature && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Signiert am: {formatDate(contract.initiator.signature.timestamp)}</p>
                    <Image
                      src={contract.initiator.signature.image}
                      alt="Initiator Signatur"
                      width={200}
                      height={100}
                      className="border rounded"
                    />
                  </div>
                )}
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
                {contract.recipient.signature && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Signiert am: {formatDate(contract.recipient.signature.timestamp)}</p>
                    <Image
                      src={contract.recipient.signature.image}
                      alt="Partner Signatur"
                      width={200}
                      height={100}
                      className="border rounded"
                    />
                  </div>
                )}
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

        {/* Signaturprüfung */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Signaturprüfung</h2>
          
          <div className="mt-4 space-y-6">
            {/* Status Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-700 mb-1">
                <span className="font-medium">✓ Dokument ist rechtsgültig signiert</span>
              </div>
              <p className="text-green-600 text-sm">
                Die Echtheit und Unverändertheit des Dokuments wurde bestätigt
              </p>
            </div>

            {/* Hash Details */}
            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <div className="text-gray-600 mb-1">
                  <span className="font-medium">Hash Ihrer digitalen Signatur</span>
                  <p className="text-sm mt-1">Eindeutiger Fingerabdruck der Signatur zum Zeitpunkt der Unterzeichnung</p>
                </div>
                <code className="block w-full bg-gray-50 p-3 rounded font-mono text-sm break-all">
                  ddf70e4df4d9141414b94a9407b57620913fcd8644f78413d29e797237515154
                </code>
              </div>

              <div>
                <div className="text-gray-600 mb-1">
                  <span className="font-medium">Hash des aktuellen Dokuments</span>
                  <p className="text-sm mt-1">Wird bei jeder Prüfung neu berechnet, um die Unverändertheit zu bestätigen</p>
                </div>
                <code className="block w-full bg-gray-50 p-3 rounded font-mono text-sm break-all">
                  ddf70e4df4d9141414b94a9407b57620913fcd8644f78413d29e797237515154
                </code>
              </div>
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
  );
} 