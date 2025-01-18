import { Contract } from '@/app/types/contract';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';

interface SignatureRequest {
  contractId: string;
  party: 'initiator' | 'partner';
  timestamp: string;
  signatureImage: string;
  name: string;
}

export async function POST(request: Request) {
  try {
    const signatureData: SignatureRequest = await request.json();
    
    // Lade aktuelle Verträge
    const contractsPath = path.join(process.cwd(), 'data', 'contracts.json');
    const contractsData = await fs.readFile(contractsPath, 'utf8');
    const contractsJson = JSON.parse(contractsData);

    // Finde den richtigen Vertrag
    const contract = contractsJson.contracts.find(
      (c: Contract) => c.contractId === signatureData.contractId
    );
    
    if (!contract) {
      console.error('Contract not found:', signatureData.contractId);
      return NextResponse.json({ error: 'Vertrag nicht gefunden' }, { status: 404 });
    }

    // Bestimme den Index der zu aktualisierenden Partei
    const partyIndex = signatureData.party === 'initiator' ? 0 : 1;
    console.log('Signing as:', partyIndex === 0 ? 'initiator' : 'partner');

    // Wenn es die erste Signatur ist, berechne den Hash aus der PDF
    if (partyIndex === 0) {
      // PDF-Pfad ermitteln und Datei einlesen
      const pdfPath = path.join(process.cwd(), 'public', contract.documentDetails.pdfFile);
      console.log('Reading PDF from:', pdfPath);
      const pdfContent = await fs.readFile(pdfPath);
      
      // Hash aus PDF-Inhalt berechnen
      const hash = crypto
        .createHash('sha256')
        .update(pdfContent)
        .digest('hex');

      console.log('Generated hash from PDF:', hash);
      
      // Speichere den Hash im Vertrag
      contract.documentDetails.hash = hash;
      console.log('Saved hash in contract:', contract.documentDetails.hash);
    }

    // Aktualisiere die Signatur-Daten der Partei
    contract.parties[partyIndex] = {
      ...contract.parties[partyIndex],
      signature: contract.documentDetails.hash, // Verwende den gespeicherten Hash
      signatureImage: signatureData.signatureImage,
      signatureTimestamp: signatureData.timestamp
    };

    console.log('Updated contract:', JSON.stringify(contract, null, 2));

    // Speichere die aktualisierten Daten
    await fs.writeFile(contractsPath, JSON.stringify({ contracts: contractsJson.contracts }, null, 2));
    console.log('Saved contract data to file');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing signature:', error);
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Signatur' },
      { status: 500 }
    );
  }
} 