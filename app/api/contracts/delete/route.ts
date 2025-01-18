import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Contract } from '@/app/types/contract';

export async function DELETE(request: Request) {
  const { contractId }: { contractId: string } = await request.json();
  // Rest des Codes...
}

export async function POST(request: NextRequest) {
  try {
    const { contractId } = await request.json();
    const contractsPath = path.join(process.cwd(), 'data/contracts.json');
    
    // Lade aktuelle Verträge
    const data = await fs.readFile(contractsPath, 'utf8');
    const { contracts } = JSON.parse(data);
    
    // Finde den zu löschenden Vertrag
    const contractToDelete = contracts.find((c: any) => c.contractId === contractId);
    if (!contractToDelete) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Lösche die PDF-Datei
    try {
      const pdfPath = path.join(process.cwd(), 'public', contractToDelete.documentDetails.pdfFile);
      await fs.unlink(pdfPath);
      console.log(`PDF deleted: ${pdfPath}`);
    } catch (error) {
      console.error('Error deleting PDF:', error);
      // Wir setzen fort, auch wenn die PDF-Datei nicht gefunden wurde
    }

    // Filtere den Vertrag aus der Liste
    const updatedContracts = contracts.filter((c: any) => c.contractId !== contractId);
    
    // Speichere aktualisierte Liste
    await fs.writeFile(
      contractsPath,
      JSON.stringify({ contracts: updatedContracts }, null, 2)
    );

    return NextResponse.json({ 
      success: true,
      message: 'Contract and PDF deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
} 