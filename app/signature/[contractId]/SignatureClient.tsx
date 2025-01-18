'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignaturePad from '../../components/SignaturePad';
import SuccessOverlay from '../../components/SuccessOverlay';
import { calculateDocumentHash } from '../../utils/documentHash';

export default function SignatureClient({ contract }: { contract: any }) {
  const initiatorName = contract.parties[0].representative.name;
  const recipientName = contract.parties[1].representative.name;
  const router = useRouter();
  
  // Berechne den Dokumenten-Hash einmalig
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  // Berechne den Hash beim ersten Laden
  useEffect(() => {
    const initHash = async () => {
      // Prüfe zuerst, ob bereits ein Hash existiert
      const existingHash = contract.parties[0].signature || contract.parties[1].signature;
      
      if (existingHash) {
        console.log('Using existing hash:', existingHash);
        setDocumentHash(existingHash);
        return;
      }

      // Nur wenn kein Hash existiert, berechne einen neuen
      const hash = await calculateDocumentHash(contract);
      setDocumentHash(hash);
    };

    initHash();
  }, [contract]);

  const handleSign = async (party: 'initiator' | 'recipient') => {
    if (!documentHash) return;

    try {
      const timestamp = new Date().toISOString();
      
      const response = await fetch('/api/signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract.contractId,
          party,
          timestamp,
          documentHash,
          signatureImage: signatureImage // Optional, kann null sein
        }),
      });

      if (!response.ok) {
        throw new Error('Signatur fehlgeschlagen');
      }

      setShowSuccess(true);
    } catch (error) {
      console.error('Signatur Fehler:', error);
      alert('Fehler bei der Signatur. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-t pt-8">
          <h2 className="text-lg font-semibold mb-4">Signaturen</h2>
          <div className="grid grid-cols-2 gap-8">
            {/* Initiator Signatur */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">
                Initiator Signatur
                <span className="block text-sm text-gray-600 mt-1">{initiatorName}</span>
              </h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  Status: 
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    contract.parties[0].signature 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {contract.parties[0].signature ? `Signiert von ${initiatorName}` : 'Ausstehend'}
                  </span>
                </p>
                {contract.parties[0].signedAt && (
                  <p className="text-sm text-gray-600">
                    Zeitpunkt: {new Date(contract.parties[0].signedAt).toLocaleString('de-DE')}
                  </p>
                )}
                {!contract.parties[0].signature && (
                  <button
                    onClick={() => handleSign('initiator')}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Als {initiatorName} signieren
                  </button>
                )}
              </div>
            </div>

            {/* Recipient Signatur */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">
                Partner Signatur
                <span className="block text-sm text-gray-600 mt-1">{recipientName}</span>
              </h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  Status: 
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    contract.parties[1].signature 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {contract.parties[1].signature ? `Signiert von ${recipientName}` : 'Ausstehend'}
                  </span>
                </p>
                {contract.parties[1].signedAt && (
                  <p className="text-sm text-gray-600">
                    Zeitpunkt: {new Date(contract.parties[1].signedAt).toLocaleString('de-DE')}
                  </p>
                )}
                {!contract.parties[1].signature && (
                  <button
                    onClick={() => handleSign('recipient')}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Als {recipientName} signieren
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Link
              href="/"
              className="py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Zurück zur Übersicht
            </Link>
          </div>
        </div>

        {/* Signatur-Bereich */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold">Signatur</h3>
          
          {!showSignaturePad ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Wählen Sie, wie Sie den Vertrag signieren möchten:
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setShowSignaturePad(true)}
                  className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
                >
                  Mit Unterschrift signieren
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleSign('initiator')}
                    disabled={contract.parties[0].signature}
                    className={`flex-1 px-4 py-2 rounded-md text-sm ${
                      contract.parties[0].signature
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Als Initiator signieren
                  </button>
                  
                  <button
                    onClick={() => handleSign('recipient')}
                    disabled={contract.parties[1].signature}
                    className={`flex-1 px-4 py-2 rounded-md text-sm ${
                      contract.parties[1].signature
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Als Partner signieren
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <SignaturePad
                onSave={(image) => {
                  setSignatureImage(image);
                  // Nach dem Speichern der Signatur nicht automatisch signieren
                }}
                onClear={() => setSignatureImage(null)}
              />
              
              {signatureImage && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleSign('initiator')}
                    disabled={contract.parties[0].signature}
                    className={`flex-1 px-4 py-2 rounded-md text-sm ${
                      contract.parties[0].signature
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Als Initiator signieren
                  </button>
                  
                  <button
                    onClick={() => handleSign('recipient')}
                    disabled={contract.parties[1].signature}
                    className={`flex-1 px-4 py-2 rounded-md text-sm ${
                      contract.parties[1].signature
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Als Partner signieren
                  </button>
                </div>
              )}
              
              <button
                onClick={() => {
                  setShowSignaturePad(false);
                  setSignatureImage(null);
                }}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Zurück zur Auswahl
              </button>
            </div>
          )}
        </div>

        {showSuccess && (
          <SuccessOverlay 
            message="Der Vertrag wurde erfolgreich signiert."
            onClose={() => {
              setShowSuccess(false);
              router.push('/');
            }}
          />
        )}
      </div>
    </div>
  );
} 