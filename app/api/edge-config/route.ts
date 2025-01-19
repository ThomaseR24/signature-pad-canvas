import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { put } from '@vercel/edge-config';

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
  } catch (err) {
    console.error('Failed to fetch edge config:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Attempting to save contract data:', data);

    // Wenn es ein Contract ist, speichern wir es unter einem spezifischen Key
    if (data.contract) {
      await put('contracts', data.contract);
      return NextResponse.json({ success: true });
    }

    // Für Test-Zwecke und andere Daten
    if (data.key && data.value) {
      await put(data.key, data.value);
      return NextResponse.json({ success: true });
    }

    throw new Error('Invalid data format');
  } catch (error) {
    console.error('Edge Config error:', error);
    // Detailliertere Fehlerinformationen
    return NextResponse.json({
      error: 'Failed to save contract',
      details: error.message,
      data: error.stack
    }, { status: 500 });
  }
} 