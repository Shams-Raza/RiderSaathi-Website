import { handleSubmitAppUtr } from '../submit-utr/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  return handleSubmitAppUtr(req);
}
