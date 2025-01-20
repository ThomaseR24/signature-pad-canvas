// app/upload/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import ErrorOverlay from '../components/ErrorOverlay';
import DocumentValidation from '../components/DocumentValidation';
import LegalConfirmation from '../components/LegalConfirmation';
import { setEdgeConfig, getEdgeConfig } from '../lib/edge-config';
import type { PutBlobResult } from '@vercel/blob';
import SuccessOverlay from '../components/SuccessOverlay';

// Test-Button zum Debuggen
const TestEdgeConfig = () => {
  const testConfig = async () => {
    try {
      console.log('Testing Edge Config...');
      
      // Speichern testen
      await setEdgeConfig('test', { hello: 'world' });
      console.log('Edge Config write test successful!');
      
      // Lesen testen
      const result = await getEdgeConfig('test');
      console.log('Read result:', result);
    } catch (error) {
      console.error('Edge Config Error:', error);
    }
  };

  return (
    <button 
      onClick={testConfig}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Test Edge Config
    </button>
  );
};

// Test-Button für Blob Upload
const TestBlobUpload = () => {
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  
  const testUpload = async () => {
    try {
      console.log('Starting test blob upload...');
      
      // Erstelle ein Test-PDF
      const testContent = new Blob(['Test PDF Content'], { type: 'application/pdf' });
      const testFile = new File([testContent], 'test.pdf', { type: 'application/pdf' });
      
      const response = await fetch(
        `/api/upload?filename=test-${Date.now()}.pdf`,
        {
          method: 'POST',
          body: testFile,
        }
      );

      const newBlob = await response.json();
      console.log('Upload successful:', newBlob);
      setBlob(newBlob);
      
      // Öffne die URL
      if (newBlob.url) {
        window.open(newBlob.url, '_blank');
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={testUpload}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Test Blob Upload
      </button>
      {blob && (
        <div className="mt-2">
          Blob URL: <a href={blob.url} target="_blank" rel="noopener noreferrer">{blob.url}</a>
        </div>
      )}
    </div>
  );
};

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
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const [isDocumentValid, setIsDocumentValid] = useState(false);
  const [isLegallyConfirmed, setIsLegallyConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': [] },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;

    try {
      console.log('1. Starting upload process');
      
      // 1. PDF Upload
      const uploadUrl = `/api/upload?filename=${encodeURIComponent(`nda-${Date.now()}-${file.name}`)}`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
      });
      const blobData = await response.json();
      console.log('2. PDF uploaded to Blob:', blobData);

      // 2. Contract Daten
      const contractId = `NDA-${Date.now()}`;
      const edgeConfigData = {
        key: contractId,
        value: {
          id: contractId,
          createdAt: new Date().toISOString(),
          status: 'pending',
          pdfUrl: blobData.url,
          initiator,
          recipient
        }
      };

      console.log('3. Sending to Edge Config:', edgeConfigData);

      // 3. Contract in Edge Config speichern
      const contractResponse = await fetch('/api/edge-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(edgeConfigData)
      });

      if (!contractResponse.ok) {
        throw new Error('Failed to save contract data');
      }

      console.log('4. Contract saved successfully');
      router.push(`/signature/${contractId}`);

    } catch (error) {
      console.error('Upload failed:', error);
      setShowError(true);
      setErrorMessage(`Upload fehlgeschlagen: ${error.message}`);
    }
  };

  // Prüfe ob alle Bedingungen erfüllt sind
  const isFormValid = file && isDocumentValid && isLegallyConfirmed;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">NDA Upload</h1>

      <TestEdgeConfig />
      <TestBlobUpload />

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

      {/* Success Overlay entfernen, nur Error Overlay behalten */}
      {showError && (
        <ErrorOverlay
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
}