'use client';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
        onClick={e => e.stopPropagation()} // Verhindert, dass das Modal sich schließt wenn man darauf klickt
      >
        <h3 className="text-lg font-semibold mb-4">
          Vertrag löschen
        </h3>
        <p className="text-gray-600 mb-6">
          Sind Sie sicher, dass Sie diesen Vertrag löschen möchten?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
} 