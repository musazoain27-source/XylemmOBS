export type Ticket = {
  id: string;
  kind: 'issue' | 'question';
  title: string;
  body: string;
  modVersion: string;
  minecraft: string;
  gpu: string;
  settings: string;
  status: string;
  reply: string;
  createdAt: number;
  updatedAt: number;
};
export const reference = (id: string) => 'XY-' + id.slice(0, 8).toUpperCase();
