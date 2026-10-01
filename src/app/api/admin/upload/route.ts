import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type (${file.type}). Only JPG, PNG, and WebP are allowed.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds the maximum size limit of 5MB.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.jpg';
      const safeBase = file.name
        .replace(ext, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .slice(0, 30);
      const filename = `${safeBase}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/products/${filename}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length} image(s) uploaded successfully`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
