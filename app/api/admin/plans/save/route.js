import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateJSON } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = getAdminSession(cookies());
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      id, name, name_hi, price, wasPrice, durationDays, durationText, durationText_hi,
      badge, badge_hi, active, description, description_hi, features, features_hi,
    } = body;

    if (!name || isNaN(Number(price))) {
      return NextResponse.json({ success: false, message: 'Valid Plan Name and Price are required.' }, { status: 400 });
    }

    let parsedFeatures = Array.isArray(features) ? features : [];
    if (typeof features === 'string') {
      parsedFeatures = features.split('\n').map(s => s.trim()).filter(Boolean);
    }

    let parsedFeaturesHi = Array.isArray(features_hi) ? features_hi : [];
    if (typeof features_hi === 'string') {
      parsedFeaturesHi = features_hi.split('\n').map(s => s.trim()).filter(Boolean);
    }

    const planId = (id && String(id).trim()) ? String(id).trim() : ('plan_' + Date.now().toString(36));
    const planData = {
      id: planId,
      name: String(name).trim(),
      name_hi: name_hi ? String(name_hi).trim() : String(name).trim(),
      price: Number(price),
      wasPrice: wasPrice !== undefined && wasPrice !== '' ? Number(wasPrice) : Number(price),
      durationDays: Number(durationDays) || 1,
      durationText: durationText ? String(durationText).trim() : `${Number(durationDays) || 1} days`,
      durationText_hi: durationText_hi ? String(durationText_hi).trim() : `${Number(durationDays) || 1} दिन`,
      badge: badge ? String(badge).trim() : '',
      badge_hi: badge_hi ? String(badge_hi).trim() : '',
      active: active === true || active === 'true' || active === 'on',
      description: description ? String(description).trim() : '',
      description_hi: description_hi ? String(description_hi).trim() : '',
      features: parsedFeatures.length > 0 ? parsedFeatures : [
        'Rapido, Uber & Porter Support',
        'Go-To Route Filter',
        'Custom Fare & Distance Rules',
        'Voice Alerts',
      ],
      features_hi: parsedFeaturesHi.length > 0 ? parsedFeaturesHi : [
        'Rapido, Uber और Porter सपोर्ट',
        'घर की तरफ (Go-To) रूट फ़िल्टर',
        'कस्टम किराया और दूरी रूल्स',
        'आवाज और साउंड अलर्ट्स',
      ],
    };

    await updateJSON('plans.json', (plans = []) => {
      const existingIdx = plans.findIndex(p => p.id === planId);
      if (existingIdx >= 0) {
        plans[existingIdx] = planData;
      } else {
        plans.push(planData);
      }
      return plans;
    }, []);

    return NextResponse.json({ success: true, message: `Plan "${planData.name}" saved!`, plan: planData });
  } catch (err) {
    console.error('Error saving plan:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
