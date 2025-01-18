'use client';

export default function ErrorOverlay({ 
  message,
  onClose 
}: { 
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Fehler
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            {message}
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
} 