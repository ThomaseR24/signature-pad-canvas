import { Contract } from '@/app/types/contract';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

interface SignatureRequest {
  contractId: string;
  party: 'initiator' | 'partner';
  timestamp: string;
  documentHash: string;
  signatureImage: string;
  name: string;
}

export async function POST(request: Request) {
  try {
    const data: SignatureRequest = await request.json();

    // Lade aktuelle Verträge
    const contractsPath = path.join(process.cwd(), 'data', 'contracts.json');
    const contractsData = await fs.readFile(contractsPath, 'utf8');
    const data = JSON.parse(contractsData);

    // Finde den richtigen Vertrag
    const contract = data.contracts.find((c: any) => c.contractId === data.contractId);
    if (!contract) {
      return NextResponse.json({ error: 'Vertrag nicht gefunden' }, { status: 404 });
    }

    // Bestimme den Index der zu aktualisierenden Partei
    const partyIndex = data.party === 'initiator' ? 0 : 1;

    // Aktualisiere die Signatur-Daten
    contract.parties[partyIndex] = {
      ...contract.parties[partyIndex],
      signature: data.documentHash,
      signatureImage: data.signatureImage, // Speichere das Signatur-Image
      signatureTimestamp: data.timestamp
    };

    // Speichere die aktualisierten Daten
    await fs.writeFile(contractsPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Signature API Error:', error);
    return NextResponse.json(
      { error: 'Interner Server Fehler' },
      { status: 500 }
    );
  }
} 