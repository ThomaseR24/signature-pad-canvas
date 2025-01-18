import { Contract } from '@/app/types/contract';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

interface SignatureRequest {
  contractId: string;
  party: 'initiator' | 'recipient';
  timestamp: string;
  signatureImage: string;
  name: string;
  pdfHash: string;
}

export async function POST(request: Request) {
  try {
    const signatureData: SignatureRequest = await request.json();
    
    // Lade aktuelle Verträge
    const contractsPath = path.join(process.cwd(), 'data', 'contracts.json');
    const contractsData = await fs.readFile(contractsPath, 'utf8');
    const contracts = JSON.parse(contractsData);
    
    // Finde den richtigen Vertrag
    const contract = contracts.find(
      (c: Contract) => c.id === signatureData.contractId
    );
    
    if (!contract) {
      console.error('Contract not found:', signatureData.contractId);
      return NextResponse.json({ error: 'Vertrag nicht gefunden' }, { status: 404 });
    }

    // Hash speichern
    contract.hash = signatureData.pdfHash;

    // Aktualisiere die entsprechende Partei
    const party = signatureData.party;
    if (party === 'initiator') {
      contract.initiator.signature = {
        image: signatureData.signatureImage,
        timestamp: signatureData.timestamp,
        name: signatureData.name
      };
    } else {
      contract.recipient.signature = {
        image: signatureData.signatureImage,
        timestamp: signatureData.timestamp,
        name: signatureData.name
      };
    }

    // Speichere die aktualisierten Daten
    await fs.writeFile(contractsPath, JSON.stringify(contracts, null, 2));
    console.log('Saved contract data with hash to file');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing signature:', error);
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Signatur' },
      { status: 500 }
    );
  }
} 