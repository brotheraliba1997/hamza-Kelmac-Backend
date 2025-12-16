import * as path from 'path';
import * as fs from 'fs';

export default function getPdfLink(filename: string): string | null {
  const filePath = path.join(process.cwd(), 'pdfs', filename);

  if (!fs.existsSync(filePath)) {
    console.log('PDF file does not exist:', filename);
    return null;
  }

  const backendDomain = process.env.BACKEND_DOMAIN || process.env.BASE_URL || 'http://localhost:3000';
  const link = `${backendDomain}/pdfs/${filename}`;
  return link;
}

