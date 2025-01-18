import { Contract } from '@/app/types/contract';
import Image from 'next/image';

interface PageProps {
  params: { contractId: string };
}

export default async function Page({ params }: PageProps) {
  // Ersetze <img> mit Image
  <Image 
    src={signatureUrl} 
    alt="Signature" 
    width={200} 
    height={100}
  />
  // Rest des Codes...
} 