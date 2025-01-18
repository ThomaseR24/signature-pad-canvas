// app/upload/page.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import UploadSuccessOverlay from '../components/UploadSuccessOverlay';
import ErrorOverlay from '../components/ErrorOverlay';
import DocumentValidation from '../components/DocumentValidation';
import LegalConfirmation from '../components/LegalConfirmation';

export default function Upload() {
  // Fester Vertragsinitiator mit Adresse
  const initiator = {
    name: "Technologie Innovation GmbH",
    representative: {
      name: "Dr. Thomas Weber",
      position: "Geschäftsführer",
      email: "t.weber@tech-innovation.de"
    },
    address: {
      street: "Innovationsstraße 42",
      city: "München",
      zipCode: "80333",
      country: "Deutschland"
    },
    role: "disclosing_party"
  };

  // State für den einzuladenden Partner
  const [recipient, setRecipient] = useState({
    name: "Digital Solutions AG",
    representative: {
      name: "Maria Schmidt",
      position: "Projektleiterin",
      email: "m.schmidt@digital-solutions.de"
    },
    address: {
      street: "Digitalstraße 15",
      city: "Berlin",
      zipCode: "10115",
      country: "Deutschland"
    }
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedContractId, setUploadedContractId] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const [isDocumentValid, setIsDocumentValid] = useState(false);
  const [isLegallyConfirmed, setIsLegallyConfirmed] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': [] },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setErrorMessage('Bitte eine PDF-Datei hochladen.');
      setShowError(true);
      return;
    }

    // Erstelle einen neuen Vertragsdatensatz
    const contractData = {
      contractId: `NDA-${Date.now()}`,
      type: "NDA",
      status: "pending",
      createdAt: new Date().toISOString(),
      parties: [
        {
          ...initiator,
          signature: null,
          signedAt: null
        },
        {
          ...recipient,
          role: "receiving_party",
          signature: null,
          signedAt: null
        }
      ],
      documentDetails: {
        title: "Vertraulichkeitsvereinbarung",
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 63072000000).toISOString(), // +2 Jahre
        pdfFile: file.name,
        hash: null
      }
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('contractData', JSON.stringify(contractData));

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      const data = await response.json();
      setUploadedContractId(data.contractId);
      setShowSuccess(true);

    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage('Fehler beim Upload. Bitte versuchen Sie es erneut.');
      setShowError(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push('/');
  };

  // Prüfe ob alle Bedingungen erfüllt sind
  const isFormValid = file && isDocumentValid && isLegallyConfirmed;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">NDA Upload</h1>

      {/* Initiator Info (fest) */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">NDA Initiator:</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">{initiator.name}</p>
            <p className="text-sm text-gray-600">{initiator.representative.name}</p>
            <p className="text-sm text-gray-600">{initiator.representative.position}</p>
            <p className="text-sm text-gray-600">{initiator.representative.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{initiator.address.street}</p>
            <p className="text-sm text-gray-600">{initiator.address.zipCode} {initiator.address.city}</p>
            <p className="text-sm text-gray-600">{initiator.address.country}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Info (editierbar) */}
        <div className="space-y-4">
          <h2 className="font-semibold">NDA Partner einladen:</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Unternehmensdaten */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Firmenname:
                </label>
                <input
                  type="text"
                  value={recipient.name}
                  onChange={(e) => setRecipient({...recipient, name: e.target.value})}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Vertreter Name:
                </label>
                <input
                  type="text"
                  value={recipient.representative.name}
                  onChange={(e) => setRecipient({
                    ...recipient, 
                    representative: {...recipient.representative, name: e.target.value}
                  })}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Position:
                </label>
                <input
                  type="text"
                  value={recipient.representative.position}
                  onChange={(e) => setRecipient({
                    ...recipient, 
                    representative: {...recipient.representative, position: e.target.value}
                  })}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  E-Mail:
                </label>
                <input
                  type="email"
                  value={recipient.representative.email}
                  onChange={(e) => setRecipient({
                    ...recipient, 
                    representative: {...recipient.representative, email: e.target.value}
                  })}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Adressdaten */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Straße:
                </label>
                <input
                  type="text"
                  value={recipient.address.street}
                  onChange={(e) => setRecipient({
                    ...recipient, 
                    address: {...recipient.address, street: e.target.value}
                  })}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  PLZ:
                </label>
                <input
                  type="text"
                  value={recipient.address.zipCode}
                  onChange={(e) => setRecipient({
                    ...recipient, 
                    address: {...recipient.address, zipCode: e.target.value}
                  })}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Stadt:
                </label>
                <input
                  type="text"
                  value={recipient.address.city}
                  onChange={(e) => setRecipient({
                    ...recipient, 
                    address: {...recipient.address, city: e.target.value}
                  })}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Land:
                </label>
                <input
                  type="text"
                  value={recipient.address.country}
                  onChange={(e) => setRecipient({
                    ...recipient, 
                    address: {...recipient.address, country: e.target.value}
                  })}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dokument Upload Bereich */}
        <div className="mb-6">
          <h2 className="font-semibold mb-4">NDA Dokument:</h2>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              Drag &apos;n&apos; drop eine PDF-Datei hier, oder klicken um eine auszuwählen
            </p>
          </div>

          {file && (
            <>
              <p className="mt-2 text-sm text-gray-600">
                Hochgeladene Datei: {file.name}
              </p>
              
              {/* Dokumentenvalidierung */}
              <DocumentValidation 
                file={file} 
                onValidationComplete={setIsDocumentValid}
              />

              {/* Rechtliche Bestätigung */}
              <LegalConfirmation 
                onConfirm={setIsLegallyConfirmed}
              />
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Abbrechen
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white
              ${isFormValid 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            NDA erstellen und Partner einladen
          </button>
        </div>
      </form>

      {/* Success/Error Overlays */}
      {showSuccess && (
        <UploadSuccessOverlay
          onClose={handleSuccessClose}
          contractId={uploadedContractId}
        />
      )}
      
      {showError && (
        <ErrorOverlay
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
}