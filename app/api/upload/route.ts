import { writeFile, mkdir, readFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { existsSync } from 'fs';
import { Contract } from '@/app/types/contract';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const contractData = JSON.parse(formData.get('contractData') as string);

    // Erstelle Uploads Ordner, falls nicht vorhanden
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const dataDir = path.join(process.cwd(), 'data');
    
    // Erstelle Verzeichnisse falls sie nicht existieren
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Generiere eindeutigen Dateinamen
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `nda-${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Speichere PDF
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    // Berechne Hash direkt aus dem PDF-Inhalt
    const hash = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    console.log('Generated hash from PDF:', hash);

    // Bereite Vertragsdaten vor
    const newContract: Contract = {
      contractId: contractData.contractId,
      type: 'NDA' as const,
      status: 'pending',
      createdAt: new Date().toISOString(),
      parties: contractData.parties,
      documentDetails: {
        title: "Vertraulichkeitsvereinbarung",
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 63072000000).toISOString(), // +2 Jahre
        pdfFile: `/uploads/${fileName}`,
        hash: hash  // Speichere den berechneten Hash
      }
    };

    // Speichere oder aktualisiere contracts.json
    const contractsPath = path.join(dataDir, 'contracts.json');
    let contracts = [];
    
    if (existsSync(contractsPath)) {
      const data = await readFile(contractsPath, 'utf8');
      const existingData = JSON.parse(data);
      contracts = existingData.contracts || [];
    }

    contracts.push(newContract);
    await writeFile(
      contractsPath, 
      JSON.stringify({ contracts }, null, 2)
    );

    return NextResponse.json({ 
      success: true, 
      message: 'NDA erfolgreich erstellt',
      contractId: contractData.contractId
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Fehler beim Upload' },
      { status: 500 }
    );
  }
} 