'use client';

import { useState, useEffect } from 'react';
import { calculateDocumentHash } from '@/app/utils/documentHash';
import { Contract } from '@/app/types/contract';

interface HashVerificationProps {
  contract: Contract;
}

export default function HashVerification({ contract }: HashVerificationProps) {
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyHash = async () => {
      try {
        const calculatedHash = await calculateDocumentHash(contract);
        setCurrentHash(calculatedHash);
        setIsValid(calculatedHash === contract.hash);
      } catch (error) {
        console.error('Error verifying hash:', error);
        setIsValid(false);
      }
    };

    verifyHash();
  }, [contract]);

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Dokumenten-Integrität</h3>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Gespeicherter Hash:</span><br/>
          <code className="text-xs break-all bg-gray-100 p-1 rounded">{contract.hash}</code>
        </p>
        
        {currentHash && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Aktueller Hash:</span><br/>
            <code className="text-xs break-all bg-gray-100 p-1 rounded">{currentHash}</code>
          </p>
        )}

        <div className={`mt-4 flex items-center ${
          isValid === null ? 'text-gray-500' :
          isValid ? 'text-green-600' : 'text-red-600'
        }`}>
          {isValid === null ? (
            <span>Überprüfe Dokument...</span>
          ) : isValid ? (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Dokument ist unverändert</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Warnung: Dokument wurde möglicherweise verändert!</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 