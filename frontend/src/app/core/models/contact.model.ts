export type ContactType = 'CUSTOMER' | 'SUPPLIER' | 'BOTH';

export interface Contact {
  id: number;
  code: string;
  name: string;
  taxId?: string;
  type: ContactType;
  email?: string;
  phone?: string;
  address?: string;
}
