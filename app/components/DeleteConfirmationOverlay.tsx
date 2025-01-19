export default function DeleteConfirmationOverlay({ 
  onConfirm, 
  onCancel 
}: { 
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Vertrag löschen
        </h3>
        
        <p className="text-gray-600 mb-6">
          Möchten Sie diesen Vertrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
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