import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import HashVerification from '../../components/HashVerification';

interface ExtendedParty {
  name: string;
  representative: {
    name: string;
    position: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  signature: string | null;
  signatureImage: string | null;
  signatureTimestamp: string | null;
}

interface Contract {
  contractId: string;
  type: string;
  status: string;
  createdAt: string;
  parties: ExtendedParty[];
  documentDetails: {
    title: string;
    validFrom: string;
    validUntil: string;
    pdfFile: string;
    hash: string | null;
  };
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

async function getContract(contractId: string): Promise<Contract | null> {
  try {
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    const data = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(data).contracts;
    const contract = contracts.find((c: Contract) => c.contractId === contractId);
    console.log('Contract details:', JSON.stringify(contract, null, 2));
    return contract || null;
  } catch (error) {
    console.error('Error loading contract:', error);
    return null;
  }
}

interface PageProps {
  params: {
    contractId: string;
  };
}

export default async function ContractDetailsPage({ params }: PageProps) {
  const contract = await getContract(params.contractId);

  if (!contract) {
    return <div className="min-h-screen bg-background p-8">Vertrag nicht gefunden</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Zurück zur Übersicht
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            Vertragsdetails
          </h1>
          {!contract.parties[1].signature && (
            <Link
              href={`/signature/${contract.contractId}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Signieren
            </Link>
          )}
        </div>

        {/* Vertragsdetails */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Vertragsinformationen</h2>
            <p className="text-sm text-gray-600">Vertrag ID: {contract.contractId}</p>
            <p className="text-sm text-gray-600">
              Erstellt am: {new Date(contract.createdAt).toLocaleString('de-DE')}
            </p>
          </div>
         
          <div className="grid grid-cols-2 gap-8">
            {/* Initiator Details */}
            <div className="space-y-2">
              <h3 className="font-medium">Initiator:</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{contract.parties[0].name}</p>
                <p>{contract.parties[0].representative.name}</p>
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
              </div>
            </div>

            {/* Partner Details */}
            <div className="space-y-2">
              <h3 className="font-medium">Partner:</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{contract.parties[1].name}</p>
                <p>{contract.parties[1].representative.name}</p>
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
        <div className="mt-8">
          <HashVerification 
            hash={contract.documentDetails.hash} 
            pdfPath={contract.documentDetails.pdfFile}
          />
        </div>
      </div>
    </div>
  );
} 