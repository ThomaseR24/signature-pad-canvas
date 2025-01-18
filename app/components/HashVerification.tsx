'use client';

import { useState, useEffect } from 'react';
import crypto from 'crypto';

interface HashVerificationProps {
  hash: string | null;
  pdfPath: string;
}

export default function HashVerification({ hash, pdfPath }: HashVerificationProps) {
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyHash() {
      try {
        // PDF-Datei laden
        const response = await fetch(pdfPath);
        const pdfBuffer = await response.arrayBuffer();
        
        // Hash aus PDF-Inhalt berechnen
        const calculatedHash = crypto
          .createHash('sha256')
          .update(Buffer.from(pdfBuffer))
          .digest('hex');
        
        setCurrentHash(calculatedHash);
        setIsValid(calculatedHash === hash);
      } catch (error) {
        console.error('Error verifying hash:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (hash && pdfPath) {
      verifyHash();
    }
  }, [hash, pdfPath]);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Hash Verifikation</h3>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Gespeicherter Hash:</span><br/>
          <code className="text-xs break-all bg-gray-100 p-1 rounded">{hash}</code>
        </p>

        {currentHash && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Berechneter Hash:</span><br/>
            <code className="text-xs break-all bg-gray-100 p-1 rounded">{currentHash}</code>
          </p>
        )}

        <div className="mt-4">
          {isLoading ? (
            <p className="text-gray-600">Überprüfe Dokument...</p>
          ) : isValid ? (
            <div className="flex items-center text-green-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              <span>Dokument ist unverändert</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>Warnung: Dokument wurde möglicherweise verändert!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 