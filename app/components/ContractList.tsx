'use client';

import { Contract } from '../types/contract';
import Link from 'next/link';
import { deleteContract } from '../actions/deleteContract';
import { useState } from 'react';
import DeleteModal from './DeleteModal';

interface ContractListProps {
  contracts: Contract[];
}

export default function ContractList({ contracts }: ContractListProps) {
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
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-t-lg">
          <div>Vertrag ID</div>
          <div>Initiator</div>
          <div>Partner</div>
          <div>Status</div>
          <div>Datum</div>
          <div>Aktion</div>
        </div>

        <div className="divide-y">
          {contracts.map((contract) => {
            const isCompleted = contract.initiatorSignature && contract.recipientSignature;
            const status = isCompleted ? 'completed' : 'pending';
            
            return (
              <div key={contract.id} className="grid grid-cols-6 gap-4 p-4">
                <div className="text-gray-900">{contract.id}</div>
                <div>{contract.initiator.name}</div>
                <div>{contract.recipient.name}</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    status === 'completed' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {status}
                  </span>
                </div>
                <div className="text-gray-600">
                  {new Date(contract.createdAt).toLocaleString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="space-x-4">
                  <Link
                    href={isCompleted ? `/contract/${contract.id}` : `/signature/${contract.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {isCompleted ? 'Anzeigen' : 'Signieren'}
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(contract.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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