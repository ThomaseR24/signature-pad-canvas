'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateDocumentHash } from '@/app/utils/documentHash';
import Image from 'next/image';
import { Contract, Party } from '@/app/types/contract';

interface SignatureClientProps {
  contract: Contract;
}

export default function SignatureClient({ contract }: SignatureClientProps) {
  const router = useRouter();
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [signatures, setSignatures] = useState<{[key: number]: {
    name: string;
    image: string | null;
  }}>({});

  // Funktion zum Generieren der Unterschrift
  const generateSignature = async (name: string): Promise<string | null> => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.font = '48px "Dancing Script"';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, canvas.width / 2, canvas.height / 2);
      return canvas.toDataURL('image/png');
    }
    return null;
  };

  // Initial Namen setzen
  useEffect(() => {
    const initialSigs: {[key: number]: {name: string; image: string | null}} = {};
    contract.parties.forEach((party: Party, index: number) => {
      initialSigs[index] = {
        name: party.representative.name,
        image: null
      };
    });
    setSignatures(initialSigs);
    updateSignatures(initialSigs);
  }, [contract, updateSignatures]);

  // Unterschriften für alle Parteien generieren
  const updateSignatures = async (sigs: typeof signatures) => {
    const updated = {...sigs};
    for (const [index, sig] of Object.entries(updated)) {
      const image = await generateSignature(sig.name);
      updated[Number(index)].image = image;
    }
    setSignatures(updated);
  };

  const handleNameChange = async (partyIndex: number, newName: string) => {
    const updated = {
      ...signatures,
      [partyIndex]: {
        name: newName,
        image: null
      }
    };
    setSignatures(updated);
    updateSignatures(updated);
  };

  // Signatur-Prozess
  const handleSignature = async (partyIndex: number) => {
    try {
      setIsSigningInProgress(true);
      const currentName = signatures[partyIndex].name;
      
      // Document Hash berechnen
      const documentHash = await calculateDocumentHash(contract);
      
      // Unterschrift mit dem bearbeiteten Namen generieren
      const signatureImg = await generateSignature(currentName);
      setSignatureImage(signatureImg);

      // API-Call zum Speichern der Signatur
      const response = await fetch('/api/signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract.contractId,
          party: partyIndex === 0 ? 'initiator' : 'partner',
          timestamp: new Date().toISOString(),
          documentHash: documentHash,
          signatureImage: signatureImg,
          name: currentName
        }),
      });

      if (!response.ok) {
        throw new Error('Signatur fehlgeschlagen');
      }

      setShowSuccessOverlay(true);
    } catch (error) {
      console.error('Fehler beim Signieren:', error);
      alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSigningInProgress(false);
    }
  };

  // Erfolgs-Overlay bestätigen und zur Übersicht navigieren
  const handleSuccessConfirm = () => {
    router.push('/');
  };

  // Bestimmen, welcher Button angezeigt werden soll
  const renderSignatureButton = (partyIndex: number) => {
    const party = contract.parties[partyIndex];
    const currentSignature = signatures[partyIndex] || { 
      name: party.representative.name,
      image: null
    };
    
    if (party.signature) {
      return (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">Signiert von {party.representative.name}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Name für die Unterschrift:</label>
          <input
            type="text"
            value={currentSignature.name}
            onChange={(e) => handleNameChange(partyIndex, e.target.value)}
            className="w-full p-2 border rounded-lg bg-white text-gray-700"
          />
        </div>

        {/* Vorschau der Unterschrift */}
        <div className="p-4 bg-gray-50 border rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Ihre Unterschrift wird so aussehen:</p>
          <div className="h-[100px] flex items-center justify-center border-b border-gray-300">
            {currentSignature.image && (
              <Image 
                src={currentSignature.image} 
                alt={`Unterschrift von ${currentSignature.name}`}
                width={200} 
                height={100}
                className="border border-gray-300 rounded"
              />
            )}
          </div>
        </div>
        
        {/* Signatur Button */}
        <button
          onClick={() => handleSignature(partyIndex)}
          disabled={isSigningInProgress || !currentSignature.name.trim()}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSigningInProgress ? (
            <span>Signatur wird erstellt...</span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Jetzt als {currentSignature.name} unterschreiben</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Vorschau der generierten Unterschrift */}
      {signatureImage && (
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Generierte Unterschrift:</p>
          <Image 
            src={signatureImage} 
            alt="Generierte Unterschrift" 
            width={200} 
            height={100}
            className="border border-gray-300 rounded"
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Initiator Signatur */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Initiator Signatur</h3>
          {renderSignatureButton(0)}
        </div>

        {/* Partner Signatur */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Partner Signatur</h3>
          {renderSignatureButton(1)}
        </div>
      </div>

      {/* Erfolgs-Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              Signatur erfolgreich
            </h3>
            <p className="text-gray-600 mb-6">
              Der Vertrag wurde erfolgreich signiert.
            </p>
            <button
              onClick={handleSuccessConfirm}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 