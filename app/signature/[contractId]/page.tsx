import { promises as fs } from 'fs';
import path from 'path';
import SignatureClient from './SignatureClient';

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

export default async function SignaturePage({ 
  params 
}: { 
  params: { contractId: string } 
}) {
  const contract = await getContract(params.contractId);

  if (!contract) {
    return <div className="min-h-screen bg-background p-8">Vertrag nicht gefunden</div>;
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

        {/* Client Komponente für Signatur-Funktionalität */}
        <SignatureClient contract={contract} />
      </div>
    </div>
  );
} 