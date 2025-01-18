import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { pdfPath } = await request.json();
    
    // PDF-Pfad ermitteln
    const fullPath = path.join(process.cwd(), 'public', pdfPath);
    
    // PDF-Datei einlesen
    const pdfContent = await fs.readFile(fullPath);
    
    // Hash nur aus dem PDF-Inhalt berechnen
    const hash = crypto
      .createHash('sha256')
      .update(pdfContent)
      .digest('hex');

    console.log('PDF path:', fullPath);
    console.log('Generated hash from PDF:', hash);
    
    return NextResponse.json({ hash });
  } catch (error) {
    console.error('Error calculating hash:', error);
    return NextResponse.json({ error: 'Hash calculation failed' }, { status: 500 });
  }
} 