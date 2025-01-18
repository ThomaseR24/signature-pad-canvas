import { Contract } from '@/app/types/contract';

export async function calculateDocumentHash(contract: Contract): Promise<string> {
  try {
    const response = await fetch('/api/hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfPath: contract.documentDetails.pdfFile
      })
    });

    if (!response.ok) {
      throw new Error('Hash calculation failed');
    }

    const data = await response.json();
    return data.hash;
  } catch (error) {
    console.error('Error calculating document hash:', error);
    throw error;
  }
} 