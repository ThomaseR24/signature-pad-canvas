'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SignatureClientProps {
  contract: any; // Typ entsprechend anpassen
}

export default function SignatureClient({ contract }: SignatureClientProps) {
  const router = useRouter();
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  // Funktion zum Generieren der Unterschrift
  const generateSignature = async (name: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Font laden und konfigurieren
      ctx.font = '48px "Dancing Script"';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text in der Mitte zeichnen
      ctx.fillText(name, canvas.width / 2, canvas.height / 2);
      
      // Als Base64 Image speichern
      return canvas.toDataURL('image/png');
    }
    return null;
  };

  // Signatur-Prozess
  const handleSignature = async (partyIndex: number) => {
    try {
      setIsSigningInProgress(true);
      const name = contract.parties[partyIndex].representative.name;
      
      // Unterschrift generieren
      const signatureImg = await generateSignature(name);
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
          documentHash: '7d53ad5cbd397a702d0063bdd623230822b81ab255cac29573aae274b2c83da7', // Hash sollte dynamisch generiert werden
          signatureImage: signatureImg,
        }),
      });

      if (!response.ok) {
        throw new Error('Signatur fehlgeschlagen');
      }

      // Erfolgreich - Seite neu laden
      router.refresh();
    } catch (error) {
      console.error('Fehler beim Signieren:', error);
      alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSigningInProgress(false);
    }
  };

  // Bestimmen, welcher Button angezeigt werden soll
  const renderSignatureButton = (partyIndex: number) => {
    const party = contract.parties[partyIndex];
    
    if (party.signature) {
      return (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">Signiert von {party.representative.name}</p>
        </div>
      );
    }

    return (
      <button
        onClick={() => handleSignature(partyIndex)}
        disabled={isSigningInProgress}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isSigningInProgress ? (
          <span>Signatur wird erstellt...</span>
        ) : (
          <span>Als {party.representative.name} signieren</span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-8">
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

      {/* Vorschau der generierten Unterschrift */}
      {signatureImage && (
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Generierte Unterschrift:</p>
          <img 
            src={signatureImage} 
            alt="Generierte Unterschrift" 
            className="max-h-[100px] mx-auto"
          />
        </div>
      )}
    </div>
  );
} 