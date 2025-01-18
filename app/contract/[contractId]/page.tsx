import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import HashVerification from '../../components/HashVerification';

async function getContract(contractId: string) {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data).contracts;
    return contracts.find((c: any) => c.contractId === contractId);
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
        {/* Signatur Image - nur wenn vorhanden */}
        {signatureImage && (
          <div className="border rounded p-3 bg-gray-50">
            <img 
              src={signatureImage} 
              alt={`Unterschrift von ${name}`}
              className="max-h-[100px] w-auto mx-auto"
            />
          </div>
        )}
        
        {/* Signatur Details - immer anzeigen */}
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

export default async function ContractDetailsPage({ 
  params 
}: { 
  params: { contractId: string } 
}) {
  const contract = await getContract(params.contractId);
  
  // Debug-Ausgabe hinzufügen
  console.log('Contract Data:', JSON.stringify(contract, null, 2));

  if (!contract) {
    return <div className="min-h-screen bg-background p-8">Vertrag nicht gefunden</div>;
  }

  const initiatorName = contract.parties[0].representative.name;
  const recipientName = contract.parties[1].representative.name;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            NDA Details
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            Zurück zur Übersicht
          </Link>
        </div>

        {/* Vertragsdetails */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Vertragsinformationen</h2>
            <p className="text-sm text-gray-600">Vertrag ID: {contract.contractId}</p>
            <p className="text-sm text-gray-600">
              Erstellt am: {new Date(contract.createdAt).toLocaleString('de-DE')}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Status: {' '}
              <span className={`px-2 py-1 rounded-full ${
                contract.parties[0].signature && contract.parties[1].signature
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {contract.parties[0].signature && contract.parties[1].signature ? 'Signiert' : 'Offen'}
              </span>
            </p>
            {contract.parties[0].signature && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-green-800">Dokumenten-Hash:</p>
                <p className="text-xs text-gray-600 font-mono break-all bg-gray-100 p-2 rounded mt-1">
                  {contract.parties[0].signature}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Dieser Hash repräsentiert den Zustand des Dokuments zum Zeitpunkt der Signatur
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Initiator Details */}
            <div className="space-y-2">
              <h3 className="font-medium">Initiator:</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{contract.parties[0].name}</p>
                <p>{initiatorName}</p>
                <p className="text-sm text-gray-600">
                  {contract.parties[0].representative.position}
                </p>
                <p className="text-sm text-gray-600">
                  {contract.parties[0].representative.email}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>{contract.parties[0].address.street}</p>
                  <p>
                    {contract.parties[0].address.zipCode} {contract.parties[0].address.city}
                  </p>
                  <p>{contract.parties[0].address.country}</p>
                </div>
                {contract.parties[0].signature && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-green-800">Signiert am:</p>
                    <p className="text-sm text-gray-600">
                      {new Date(contract.parties[0].signatureTimestamp).toLocaleString('de-DE')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Partner Details */}
            <div className="space-y-2">
              <h3 className="font-medium">Partner:</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{contract.parties[1].name}</p>
                <p>{recipientName}</p>
                <p className="text-sm text-gray-600">
                  {contract.parties[1].representative.position}
                </p>
                <p className="text-sm text-gray-600">
                  {contract.parties[1].representative.email}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>{contract.parties[1].address.street}</p>
                  <p>
                    {contract.parties[1].address.zipCode} {contract.parties[1].address.city}
                  </p>
                  <p>{contract.parties[1].address.country}</p>
                </div>
                {contract.parties[1].signature && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-green-800">Signiert am:</p>
                    <p className="text-sm text-gray-600">
                      {new Date(contract.parties[1].signatureTimestamp).toLocaleString('de-DE')}
                    </p>
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
                href={contract.documentDetails.pdfFile}
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
              src={`${contract.documentDetails.pdfFile}#view=FitH`}
              className="w-full h-[500px] border rounded"
            />
          </div>
        </div>

        {/* Signaturen Bereich */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Signaturen</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Initiator Signatur */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Initiator Signatur</h3>
              <SignatureDisplay
                signature={contract.parties[0].signature}
                signatureImage={contract.parties[0].signatureImage}
                name={contract.parties[0].representative.name}
                timestamp={contract.parties[0].signatureTimestamp}
              />
            </div>

            {/* Partner Signatur */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Partner Signatur</h3>
              <SignatureDisplay
                signature={contract.parties[1].signature}
                signatureImage={contract.parties[1].signatureImage}
                name={contract.parties[1].representative.name}
                timestamp={contract.parties[1].signatureTimestamp}
              />
            </div>
          </div>
        </div>

        {/* Hash Verifikation */}
        {contract.parties[0].signature && (
          <HashVerification 
            storedHash={contract.parties[0].signature}
            documentData={contract}
          />
        )}
      </div>
    </div>
  );
} 