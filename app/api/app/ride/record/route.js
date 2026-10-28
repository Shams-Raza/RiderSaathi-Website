import { handleRecordRide } from '../../rides/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  return handleRecordRide(req);
}
