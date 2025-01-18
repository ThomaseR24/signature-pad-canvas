'use client';

import { Contract } from '@/app/types/contract';
import Link from 'next/link';
import { deleteContract } from '../actions/deleteContract';
import { useState } from 'react';
import DeleteModal from './DeleteModal';

export default function ContractList({ contracts }: { contracts: Contract[] }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (contractId: string) => {
    setContractToDelete(contractId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (contractToDelete) {
      await deleteContract(contractToDelete);
      setDeleteModalOpen(false);
      setContractToDelete(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Vertrag ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Initiator</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Partner</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Datum</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{contract.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{contract.initiator.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{contract.recipient.name}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${contract.status === 'Signiert' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {contract.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatDate(contract.createdAt)}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <Link
                    href={`/contract/${contract.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Anzeigen
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(contract.id)}
                    className="text-red-600 hover:text-red-900 ml-2"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setContractToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
} 