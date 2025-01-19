'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Contract } from '@/app/types/contract';

interface SignatureClientProps {
  contract: Contract;
}

export default function SignatureClient({ contract }: SignatureClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [initiatorName, setInitiatorName] = useState(contract.initiator.representative.name);
  const [recipientName, setRecipientName] = useState(contract.recipient.representative.name);
  const [initiatorImage, setInitiatorImage] = useState<string | null>(null);
  const [recipientImage, setRecipientImage] = useState<string | null>(null);
  const router = useRouter();

  // Funktion zum Generieren der Unterschrift als Bild
  const generateSignatureImage = (name: string) => {
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

  const handleInitiatorNameChange = (name: string) => {
    setInitiatorName(name);
    const image = generateSignatureImage(name);
    setInitiatorImage(image);
  };

  const handleRecipientNameChange = (name: string) => {
    setRecipientName(name);
    const image = generateSignatureImage(name);
    setRecipientImage(image);
  };

  const handleSignature = async (party: 'initiator' | 'recipient') => {
    const name = party === 'initiator' ? initiatorName : recipientName;
    const image = party === 'initiator' ? initiatorImage : recipientImage;
    
    if (!name || !image) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: contract.id,
          party,
          signature: name,
          signatureImage: image,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Signatur fehlgeschlagen');
      }

      router.push(`/contract/${contract.id}`);
    } catch (error) {
      console.error('Fehler beim Signieren:', error);
      alert('Fehler bei der Signatur. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Initiator Signatur */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Initiator Signatur</h2>
        <div>
          <label className="block text-sm text-gray-600">
            Name für die Unterschrift:
          </label>
          <input
            type="text"
            value={initiatorName}
            onChange={(e) => handleInitiatorNameChange(e.target.value)}
            className="mt-1 w-full p-2 border rounded"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Ihre Unterschrift wird so aussehen:</p>
          <div className="border rounded p-3 bg-white">
            {initiatorImage && (
              <Image 
                src={initiatorImage} 
                alt="Unterschrift Vorschau"
                width={400}
                height={100}
              />
            )}
          </div>
        </div>

        <button
          onClick={() => handleSignature('initiator')}
          disabled={isLoading || !initiatorName}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Wird signiert...' : `Jetzt als ${initiatorName} unterschreiben`}
        </button>
      </div>

      {/* Partner Signatur */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Partner Signatur</h2>
        <div>
          <label className="block text-sm text-gray-600">
            Name für die Unterschrift:
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => handleRecipientNameChange(e.target.value)}
            className="mt-1 w-full p-2 border rounded"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Ihre Unterschrift wird so aussehen:</p>
          <div className="border rounded p-3 bg-white">
            {recipientImage && (
              <Image 
                src={recipientImage} 
                alt="Unterschrift Vorschau"
                width={400}
                height={100}
              />
            )}
          </div>
        </div>

        <button
          onClick={() => handleSignature('recipient')}
          disabled={isLoading || !recipientName}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Wird signiert...' : `Jetzt als ${recipientName} unterschreiben`}
        </button>
      </div>
    </div>
  );
} 