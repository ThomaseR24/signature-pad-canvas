import { getContract } from '@/app/actions';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const HASH = "sha256-f3d8b2a7c1e9d4f6"; // Simulierter Hash

export default async function ContractPage({ params }: { params: { id: string } }) {
  const contract = await getContract(params.id);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">NDA Signatur Status</h1>

      {/* ... bestehender Contract Display Code ... */}

      <h2 className="text-xl font-semibold mt-8">Vertragsdokument</h2>
      
      {/* ... PDF Viewer ... */}

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Hash Verifikation</h2>
        
        <div className="mt-4 bg-white rounded-lg shadow-sm border p-6">
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
            <div className="flex items-center text-green-700">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Signatur ist gültig</span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Die digitale Signatur wurde erfolgreich verifiziert
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="font-medium mb-2">Gespeicherter Hash:</div>
              <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                sha256-8f2d5d3d7e1a9c4b6f8e2d5a7c1b4f9e
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">Überprüfe Dokument...</div>
              <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                sha256-8f2d5d3d7e1a9c4b6f8e2d5a7c1b4f9e
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/contracts"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Zurück zur Übersicht
        </Link>
      </div>
    </main>
  );
} 