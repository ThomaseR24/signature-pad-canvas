import React from 'react';

interface LegalConfirmationProps {
  onConfirm: (confirmed: boolean) => void;
}

export default function LegalConfirmation({ onConfirm }: LegalConfirmationProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Hinweis zur elektronischen Signatur
        </h4>
        <p className="text-sm text-blue-700">
          Dieses System verwendet eine einfache elektronische Signatur gemäß eIDAS-Verordnung. 
          Diese Form der Signatur ist für die meisten Geschäftsdokumente ausreichend, 
          entspricht jedoch nicht dem Standard einer qualifizierten elektronischen Signatur.
        </p>
      </div>

      <label className="flex items-start space-x-3">
        <input
          type="checkbox"
          className="mt-1"
          onChange={(e) => onConfirm(e.target.checked)}
        />
        <span className="text-sm text-gray-600">
          Ich bestätige, dass ich berechtigt bin, dieses Dokument im Namen meines Unternehmens zu teilen, 
          dass der Inhalt keine vertraulichen Informationen Dritter enthält und ich mit der Verwendung 
          einer einfachen elektronischen Signatur einverstanden bin.
        </span>
      </label>
    </div>
  );
} 