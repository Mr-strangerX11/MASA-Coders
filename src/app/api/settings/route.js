import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { defaultSettings } from '@/lib/defaultSettings';

function isAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');

    const query = group ? { group } : {};
    const settingsArr = await Settings.find(query);

    // Merge with defaults
    const settingsMap = {};
    Object.entries(defaultSettings).forEach(([key, def]) => {
      settingsMap[key] = { ...def, key };
    });
    settingsArr.forEach((s) => {
      settingsMap[s.key] = { ...settingsMap[s.key], value: s.value, key: s.key };
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Admin: Update settings (bulk)
export async function PUT(request) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { settings } = await request.json();

    // Bulk upsert
    const ops = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: {
          $set: {
            key,
            value,
            group: defaultSettings[key]?.group || 'general',
            label: defaultSettings[key]?.label || key,
          },
        },
        upsert: true,
      },
    }));

    await Settings.bulkWrite(ops);
    // Revalidate all public pages since settings affect site-wide content
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
