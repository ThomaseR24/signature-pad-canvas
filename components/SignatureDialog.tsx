import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SignatureDialogProps {
  onClose: () => void;
}

export default function SignatureDialog({ onClose }: SignatureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div>
      {/* ... rest of the component code ... */}
    </div>
  );
} 