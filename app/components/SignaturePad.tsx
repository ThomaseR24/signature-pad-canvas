'use client';

import { useRef, useEffect } from 'react';

interface SignaturePadProps {
  onSave: (signatureImage: string) => void;
  onClear: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size and scale for better resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    contextRef.current = context;
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e.nativeEvent instanceof MouseEvent) {
      return {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY
      };
    } else {
      const touch = e.nativeEvent as TouchEvent;
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        offsetX: touch.touches[0].clientX - (rect?.left || 0),
        offsetY: touch.touches[0].clientY - (rect?.top || 0)
      };
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureImage = canvas.toDataURL('image/png');
    onSave(signatureImage);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Signature Area */}
      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
        {/* Canvas Container */}
        <div className="relative">
          {/* Signature Line */}
          <div className="absolute bottom-12 left-4 right-4 border-b border-gray-300" />
          
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-[200px] bg-white border border-gray-200 rounded-lg cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Hint Text */}
          <div className="absolute bottom-4 left-4 right-4 text-center text-gray-400 text-sm">
            Bitte unterschreiben Sie hier
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={clearSignature}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            type="button"
          >
            Löschen
          </button>
          <button
            onClick={saveSignature}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            type="button"
          >
            Bestätigen
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-2 text-center text-sm text-gray-500">
        Verwenden Sie die Maus oder Ihren Finger zum Unterschreiben
      </div>
    </div>
  );
} 