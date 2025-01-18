import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Pfad zur JSON-Datei
const dataFile = path.join(process.cwd(), 'data', 'contracts.json');

// Hilfsfunktion zum Laden der Contracts
async function getContracts() {
  try {
    const data = await fs.readFile(dataFile, 'utf8');
    const contracts = JSON.parse(data);
    // Stelle sicher, dass es ein Array ist
    return Array.isArray(contracts) ? contracts : [];
  } catch (error) {
    // Wenn die Datei nicht existiert, leeres Array zurückgeben
    return [];
  }
}

// Hilfsfunktion zum Speichern der Contracts
async function saveContracts(contracts: any[]) {
  // Stelle sicher, dass das Verzeichnis existiert
  await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(contracts, null, 2));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    const contracts = await getContracts();
    const contract = contracts.find(c => c.id === contractId);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error('Get Error:', error);
    return NextResponse.json(
      { error: 'Failed to get contract' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const contractData = await request.json();
    
    if (!contractData.id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    console.log('Saving contract:', contractData);

    // Aktuelle Contracts laden und sicherstellen, dass es ein Array ist
    let contracts = await getContracts();
    if (!Array.isArray(contracts)) {
      contracts = [];
    }
    
    // Neuen Contract hinzufügen
    contracts.push(contractData);

    // Alle Contracts speichern
    await saveContracts(contracts);
    
    console.log('Contract saved successfully:', contractData.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Contract saved',
      contractId: contractData.id 
    });
  } catch (error) {
    console.error('Save Error:', error);
    return NextResponse.json(
      { error: 'Failed to save contract', details: error.message },
      { status: 500 }
    );
  }
} 