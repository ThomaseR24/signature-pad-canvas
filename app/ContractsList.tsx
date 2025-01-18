'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeleteOverlay from './components/DeleteOverlay';
import { Contract } from './types/contract';

interface ContractsListProps {
  contracts: Contract[];
}

export default function ContractsList({ contracts }: ContractsListProps) {
  const [contracts, setContracts] = useState(contracts);
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteClick = (contractId: string) => {
    setContractToDelete(contractId);
    setShowDeleteOverlay(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;

    try {
      const response = await fetch('/api/contracts/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractId: contractToDelete }),
      });

      if (!response.ok) {
        throw new Error('Löschen fehlgeschlagen');
      }

      setContracts(contracts.filter(c => c.contractId !== contractToDelete));
      setShowDeleteOverlay(false);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Fehler beim Löschen des Vertrags');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteOverlay(false);
    setContractToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">
          NDA Übersicht
        </h1>

        {/* Header */}
        <div className="grid grid-cols-7 gap-4 p-4 font-medium bg-gray-50 rounded-t-lg">
          <div>Vertrag ID</div>
          <div>Initiator</div>
          <div>Partner</div>
          <div>Status</div>
          <div>Datum</div>
          <div className="col-span-2">Aktion</div>
        </div>

        {/* Vertragsliste */}
        {contracts.map((contract) => (
          <div 
            key={contract.contractId} 
            className="grid grid-cols-7 gap-4 p-4 border-b hover:bg-gray-50"
          >
            <div className="text-sm">{contract.contractId}</div>
            <div>{contract.parties[0].name}</div>
            <div>{contract.parties[1].name}</div>
            <div>
              <span className={`px-2 py-1 rounded-full text-sm ${
                contract.parties[0].signature && contract.parties[1].signature
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {contract.parties[0].signature && contract.parties[1].signature 
                  ? 'Signiert' 
                  : 'Offen'}
              </span>
            </div>
            <div className="text-sm">
              {new Date(contract.createdAt).toLocaleDateString('de-DE')}
            </div>
            <div className="col-span-2 space-x-4">
              <Link
                href={`/contract/${contract.contractId}`}
                className="text-gray-600 hover:text-gray-800"
              >
                Details
              </Link>
              {!(contract.parties[0].signature && contract.parties[1].signature) && (
                <Link
                  href={`/signature/${contract.contractId}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Signieren
                </Link>
              )}
              <a 
                href={contract.documentDetails.pdfFile} 
                target="_blank"
                className="text-gray-600 hover:text-gray-800"
              >
                PDF
              </a>
              <button
                onClick={() => handleDeleteClick(contract.contractId)}
                className="text-red-600 hover:text-red-800"
              >
                Löschen
              </button>
            </div>
          </div>
        ))}

        {/* Neuer Vertrag Button */}
        <div className="mt-8">
          <Link
            href="/upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Neue NDA erstellen
          </Link>
        </div>

        {/* Delete Overlay */}
        {showDeleteOverlay && (
          <DeleteOverlay 
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}
      </div>
    </div>
  );
} 