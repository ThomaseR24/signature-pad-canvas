'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Contract } from '@/app/types/contract';

interface SignatureClientProps {
  contract: Contract;
}

export default function SignatureClient({ contract }: SignatureClientProps) {
  const [initiatorName, setInitiatorName] = useState(contract.initiator.representative.name);
  const [recipientName, setRecipientName] = useState(contract.recipient.representative.name);
  const [initiatorImage, setInitiatorImage] = useState<string | null>(null);
  const [recipientImage, setRecipientImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Generiere Signatur-Images beim ersten Laden
  useEffect(() => {
    const initImage = generateSignatureImage(initiatorName);
    setInitiatorImage(initImage);
    
    const recipImage = generateSignatureImage(recipientName);
    setRecipientImage(recipImage);
  }, [initiatorName, recipientName]);

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

      // Weiterleitung zur Übersichtsseite
      router.push('/');
    } catch (error) {
      console.error('Fehler beim Signieren:', error);
      alert('Fehler bei der Signatur. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSignatureSection = (type: 'initiator' | 'recipient') => {
    const isInitiator = type === 'initiator';
    const signature = isInitiator ? contract.initiatorSignature : contract.recipientSignature;
    const signedAt = isInitiator ? contract.initiatorSignedAt : contract.recipientSignedAt;
    const name = isInitiator 
      ? contract.initiator.representative.name 
      : contract.recipient.representative.name;

    if (signature) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-green-800">Signiert</span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <p>Von: {name}</p>
            {signedAt && (
              <p>Am: {new Date(signedAt).toLocaleString('de-DE')}</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">
            Name für die Unterschrift:
          </label>
          <input
            type="text"
            value={isInitiator ? initiatorName : recipientName}
            onChange={(e) => isInitiator 
              ? handleInitiatorNameChange(e.target.value)
              : handleRecipientNameChange(e.target.value)
            }
            className="mt-1 w-full p-2 border rounded"
          />
        </div>

        {(isInitiator ? initiatorImage : recipientImage) && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Ihre Unterschrift wird so aussehen:</p>
            <div className="border rounded p-3 bg-white">
              <Image 
                src={isInitiator ? initiatorImage! : recipientImage!}
                alt="Unterschrift Vorschau"
                width={400}
                height={100}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => handleSignature(type)}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Wird signiert...' : `Jetzt als ${isInitiator ? initiatorName : recipientName} unterschreiben`}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Initiator Signatur */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Initiator Signatur</h2>
        {renderSignatureSection('initiator')}
      </div>

      {/* Partner Signatur */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Partner Signatur</h2>
        {renderSignatureSection('recipient')}
      </div>
    </div>
  );
} 