'use client';

export default function UploadSuccessOverlay({ 
  onClose,
  contractId
}: { 
  onClose: () => void;
  contractId: string;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Upload erfolgreich
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            Das PDF wurde erfolgreich hochgeladen und der Vertrag wurde erstellt.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = `/signature/${contractId}`}
              className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              Zur Signatur
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-200 transition-colors"
            >
              Zur Übersicht
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 