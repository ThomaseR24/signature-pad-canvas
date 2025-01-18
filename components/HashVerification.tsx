interface HashVerificationProps {
  pdfUrl: string;
  storedHash?: string | null;
}

export default async function HashVerification({ pdfUrl, storedHash }: HashVerificationProps) {
  // Fetch PDF und berechne Hash
  const response = await fetch(pdfUrl);
  const pdfBlob = await response.blob();
  const calculatedHash = await calculateHash(pdfBlob);

  return (
    <div>
      <h2>Hash Verifikation</h2>
      
      {storedHash && (
        <div>
          <p>Gespeicherter Hash:</p>
          <code>{storedHash}</code>
        </div>
      )}

      <div>
        <p>Berechneter Hash:</p>
        <code>{calculatedHash}</code>
      </div>

      {storedHash && (
        <div>
          <p>Status: {storedHash === calculatedHash ? "✅ Verifiziert" : "❌ Nicht verifiziert"}</p>
        </div>
      )}
    </div>
  );
} 