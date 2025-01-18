import { Contract } from '../types/contract';

export async function calculateDocumentHash(document: Contract) {
  // Erstelle ein deterministisches Objekt mit nur den relevanten Daten
  const relevantData = {
    contractId: document.contractId,
    content: document.documentDetails.content,
    createdAt: document.createdAt,
    // Nur die unveränderlichen Eigenschaften der Parteien
    parties: document.parties.map(party => ({
      name: party.name,
      representative: {
        name: party.representative.name,
        position: party.representative.position,
        email: party.representative.email
      },
      address: party.address
    }))
  };

  // Sortiere die Objekt-Keys für konsistente Serialisierung
  const sortedData = JSON.stringify(relevantData, Object.keys(relevantData).sort());
  
  console.log('Hash input data:', sortedData);

  const msgBuffer = new TextEncoder().encode(sortedData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  console.log('Generated hash:', hash);
  
  return hash;
} 