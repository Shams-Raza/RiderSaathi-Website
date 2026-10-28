import { handleCreateAppOrder } from './create/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  return handleCreateAppOrder(req);
}
