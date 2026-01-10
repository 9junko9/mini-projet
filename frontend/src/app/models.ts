export type Equipment = {
  id: number;
  name: string;
  type: string;
  status: 'in_stock' | 'assigned' | 'retired' | string;
  owner: string;
  created_at: string;
};
