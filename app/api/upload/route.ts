import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Debug: Request URL und Parameter
    const url = new URL(request.url);
    console.log('Request URL:', request.url);
    console.log('Search Params:', Object.fromEntries(url.searchParams));
    
    const filename = url.searchParams.get('filename');
    console.log('Filename from params:', filename);

    if (!filename) {
      console.error('No filename provided');
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Debug: Request Body
    console.log('Request body type:', request.body?.constructor.name);

    const blob = await put(filename, request.body, {
      access: 'public',
    });

    console.log('Upload successful:', blob);
    return NextResponse.json(blob);

  } catch (error) {
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
} 