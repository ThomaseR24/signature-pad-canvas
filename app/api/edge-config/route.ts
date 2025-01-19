import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';
import { Redis } from '@upstash/redis'

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

// Upstash Redis Client initialisieren
const redis = new Redis({
  url: process.env.UPSTASH_URL!,
  token: process.env.UPSTASH_REST_TOKEN!,
})

// Erhöhe den Timeout auf das Maximum
export const maxDuration = 60; // Maximum für Hobby/Pro Plan

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
    console.log('Starting Redis storage operation');

    if (!data.key || !data.value) {
      return NextResponse.json({
        error: 'Invalid data',
        details: 'Missing key or value'
      }, { status: 400 });
    }

    // Redis statt KV verwenden
    await redis.set(data.key, data.value);
    console.log('Data saved successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Contract saved successfully',
      key: data.key
    });

  } catch (error: any) {
    console.error('Redis Storage error:', error);
    return NextResponse.json({
      error: 'Failed to save contract',
      details: error.message
    }, { 
      status: 500 
    });
  }
} 