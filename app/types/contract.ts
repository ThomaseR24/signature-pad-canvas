export interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface Representative {
  name: string;
  position: string;
  email: string;
}

export interface Party {
  name: string;
  representative: Representative;
  address: Address;
  role?: 'disclosing_party' | 'receiving_party';
  signature?: string | null;
  signatureImage?: string | null;
  signatureTimestamp?: string | null;
}

export interface DocumentDetails {
  title: string;
  validFrom: string;
  validUntil: string;
  pdfFile: string;
  hash?: string | null;
}

export interface Contract {
  id: string;
  createdAt: string;
  status: 'pending' | 'signed';
  pdfUrl: string;
  hash?: string;
  initiator: {
    name: string;
    representative: {
      name: string;
      position: string;
      email: string;
    };
    address: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    };
    role?: 'disclosing_party' | 'receiving_party';
    signature?: {
      image: string;
      timestamp: string;
      name: string;
    };
  };
  recipient: {
    name: string;
    representative: {
      name: string;
      position: string;
      email: string;
    };
    address: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    };
    signature?: {
      image: string;
      timestamp: string;
      name: string;
    };
  };
} 