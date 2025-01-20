'use client';
import { useRouter } from 'next/navigation';

interface SuccessOverlayProps {
  message: string;
  contractId?: string;
}

export default function SuccessOverlay({ message, contractId }: SuccessOverlayProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {message}
          </h3>
          
          <div className="mt-6 space-y-2">
            <button
              onClick={() => router.push(`/signature/${contractId}`)}
              className="w-full inline-flex justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Jetzt signieren
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Zur Übersicht
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 