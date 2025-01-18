'use client';

import { useState, useEffect } from 'react';
import { calculateDocumentHash } from '../utils/documentHash';

export default function HashVerification({ 
  storedHash, 
  documentData 
}: { 
  storedHash: string;
  documentData: any;
}) {
  const [currentHash, setCurrentHash] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyHash = async () => {
      const calculatedHash = await calculateDocumentHash(documentData);
      setCurrentHash(calculatedHash);
      setIsValid(calculatedHash === storedHash);
    };

    verifyHash();
  }, [documentData, storedHash]);

  return (
    <div className="mt-4 p-4 rounded-lg border">
      <h3 className="text-lg font-medium mb-3">Dokumenten-Integrität</h3>
      
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Gespeicherter Hash:</p>
          <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
            {storedHash}
          </p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700">Aktueller Hash:</p>
          <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
            {currentHash}
          </p>
        </div>

        <div className={`mt-4 flex items-center ${
          isValid === null ? 'text-gray-500' :
          isValid ? 'text-green-600' : 'text-red-600'
        }`}>
          {isValid === null ? (
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isValid ? (
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">
            {isValid === null ? 'Überprüfe Dokument...' :
             isValid ? 'Dokument ist unverändert' : 
             'Warnung: Dokument wurde möglicherweise verändert!'}
          </span>
        </div>
      </div>
    </div>
  );
} 