import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Missing file payload.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dynamic destination path: /public/uploads/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExtension = path.extname(file.name) || '.png';
    const sanitizedBase = path.basename(file.name, fileExtension).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFilename = `${sanitizedBase}_${Date.now()}${fileExtension}`;
    const destinationPath = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(destinationPath, buffer);
    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Multipart upload exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
