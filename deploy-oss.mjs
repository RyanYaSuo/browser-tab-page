import { build } from 'vite';
import OSS from 'ali-oss';
import { readdirSync, statSync, readFileSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const BUCKET = 'cupidtab';
const ACCESS_KEY_ID = process.env.OSS_AK_ID;
const ACCESS_KEY_SECRET = process.env.OSS_AK_SECRET;
const REGION = process.env.OSS_REGION || 'oss-us-west-1';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(__dirname, 'dist');

if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET) {
  console.error('请设置 OSS_AK_ID 和 OSS_AK_SECRET 环境变量');
  process.exit(1);
}

async function main() {
  // Step 1: Build
  console.log('📦 构建项目...');
  await build({ root: __dirname, logLevel: 'warn' });

  // Step 2: OSS client
  const client = new OSS({
    region: REGION,
    accessKeyId: ACCESS_KEY_ID,
    accessKeySecret: ACCESS_KEY_SECRET,
    bucket: BUCKET,
    secure: true,
  });

  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.png':  'image/png',
    '.json': 'application/json; charset=utf-8',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.webp': 'image/webp',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
  };

  async function uploadDir(dir, prefix = '') {
    const entries = readdirSync(dir);
    for (const name of entries) {
      const full = join(dir, name);
      const key = prefix ? `${prefix}/${name}` : name;
      const st = statSync(full);
      if (st.isDirectory()) {
        await uploadDir(full, key);
      } else {
        const ext = extname(name).toLowerCase();
        const headers = {
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
        };
        if (MIME[ext]) headers['Content-Type'] = MIME[ext];
        const buf = readFileSync(full);
        process.stdout.write(`  ↑ ${key} (${(buf.length / 1024).toFixed(1)} KB)... `);
        try {
          await client.put(key, buf, { headers });
          console.log('✓');
        } catch (e) {
          console.log('✗', e.message);
        }
      }
    }
  }

  console.log(`☁️  上传到 ${BUCKET} (${REGION})`);
  await uploadDir(DIST);
  console.log('✅ 部署完成');
}

main().catch(e => { console.error(e); process.exit(1); });
