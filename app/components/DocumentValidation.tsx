import { useEffect } from 'react';

interface DocumentValidationProps {
  file: File;
  onValidationComplete: (isValid: boolean) => void;
}

export default function DocumentValidation({ file, onValidationComplete }: DocumentValidationProps) {
  useEffect(() => {
    // Basic validation - checks if file is PDF and under 10MB
    const isValid = file.type === 'application/pdf' && file.size < 10 * 1024 * 1024;
    onValidationComplete(isValid);
  }, [file, onValidationComplete]);

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Dokumentenprüfung:</h3>
      <ul className="text-sm">
        <li className="flex items-center">
          <span className={file.type === 'application/pdf' ? 'text-green-600' : 'text-red-600'}>
            ✓ PDF Format
          </span>
        </li>
        <li className="flex items-center">
          <span className={file.size < 10 * 1024 * 1024 ? 'text-green-600' : 'text-red-600'}>
            ✓ Dateigröße unter 10MB
          </span>
        </li>
      </ul>
    </div>
  );
} 