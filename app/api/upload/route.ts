import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { existsSync } from 'fs';

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
    
    // Speichere PDF
    await writeFile(
      path.join(uploadDir, fileName), 
      Buffer.from(await file.arrayBuffer())
    );

    // Bereite Vertragsdaten vor
    const newContract = {
      ...contractData,
      documentDetails: {
        ...contractData.documentDetails,
        pdfFile: `/uploads/${fileName}`,
        uploadedAt: new Date().toISOString()
      }
    };

    // Speichere oder aktualisiere contracts.json
    const contractsPath = path.join(dataDir, 'contracts.json');
    let contracts = [];
    
    if (existsSync(contractsPath)) {
      const contractsRaw = await import(`@/data/contracts.json`);
      contracts = contractsRaw.contracts;
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