'use server';

import { get } from '@vercel/edge-config';

export async function getEdgeConfig<T>(key: string): Promise<T | null> {
  try {
    return await get(key);
  } catch (error) {
    console.error('Edge Config Error:', error);
    return null;
  }
}

export async function setEdgeConfig(key: string, value: any) {
  // Für den PoC loggen wir nur
  console.log('Would set:', { key, value });
  return true;
} 