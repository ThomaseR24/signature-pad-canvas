import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';

async function handleSign() {
  if (!signatureRef.current) return;

  const signatureImage = signatureRef.current.toDataURL();
  
  // PDF Hash berechnen
  const pdfResponse = await fetch(contract.pdfUrl);
  const pdfBlob = await pdfResponse.blob();
  const pdfHash = await calculateHash(pdfBlob);

  // Signatur + Hash ans Backend senden
  const response = await fetch('/api/contracts/sign', {
    method: 'POST',
    body: JSON.stringify({
      contractId: contract.id,
      signature: {
        image: signatureImage,
        timestamp: new Date().toISOString(),
        name: name
      },
      pdfHash: pdfHash  // Hash mit senden
    })
  });

  if (response.ok) {
    onClose();
    router.refresh();
  }
}

const SignatureDialog: React.FC = () => {
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  return (
    <div>
      {/* ... rest of the component code ... */}
    </div>
  );
};

export default SignatureDialog; 