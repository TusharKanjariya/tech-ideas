import fs from 'fs/promises';
import path from 'path';

export async function saveDigest(d) {
    const dir = path.join(process.cwd(), 'public', 'digests');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'latest.json'), JSON.stringify(d, null, 2));
    await fs.writeFile(path.join(dir, `${d.date}.json`), JSON.stringify(d, null, 2));
}
