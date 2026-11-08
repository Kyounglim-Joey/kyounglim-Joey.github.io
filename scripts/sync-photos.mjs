#!/usr/bin/env node
/**
 * Build-time photo sync for the About-page gallery.  Runs automatically before `npm run build`
 * (npm "prebuild"), so visitors never talk to Google — photos are served from this site.
 *
 * Source, in priority order:
 *   1. Google Drive folder  — when GDRIVE_SERVICE_ACCOUNT_KEY and GDRIVE_FOLDER_ID are set
 *                             (GitHub Actions secret + variable). Read-only service account.
 *   2. Local folder photos/ — any JPG/PNG/WebP you commit to the repository.
 *   3. Nothing              — gallery section is simply not rendered.
 *
 * Every image is decoded and re-encoded with sharp: resized, auto-rotated, and ALL metadata
 * (EXIF, GPS location, camera serials) removed before it can be published.
 *
 * Output:
 *   public/gallery/<id>-sm.webp   (carousel, 800 px wide)
 *   public/gallery/<id>-lg.webp   (click-through, max 1800 px)
 *   src/data/gallery.generated.json
 * Both are git-ignored and rebuilt on every build.
 */
import { createSign, createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'gallery');
const OUT_JSON = path.join(ROOT, 'src', 'data', 'gallery.generated.json');
const LOCAL_DIR = path.join(ROOT, 'photos');
const MAX_PHOTOS = Number(process.env.GALLERY_MAX || 40);
const IMAGE_RE = /\.(jpe?g|png|webp|avif|tiff?)$/i;

const log = (...a) => console.log('[photos]', ...a);
const inCI = process.env.GITHUB_ACTIONS === 'true';

/* ----------------------------- Google Drive ----------------------------- */
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

async function driveToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${b64url(signer.sign(key.private_key))}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) throw new Error(`token request failed: HTTP ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function listDrive(token, folderId) {
  const files = [];
  let pageToken = '';
  do {
    const q = `'${folderId.replace(/'/g, "\\'")}' in parents and mimeType contains 'image/' and trashed = false`;
    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.search = new URLSearchParams({
      q,
      orderBy: 'name',
      pageSize: '100',
      fields: 'nextPageToken, files(id, name, description, modifiedTime, mimeType)',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
      ...(pageToken ? { pageToken } : {}),
    }).toString();
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`files.list failed: HTTP ${res.status} ${await res.text()}`);
    const data = await res.json();
    files.push(...(data.files || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken && files.length < MAX_PHOTOS);
  return files.slice(0, MAX_PHOTOS);
}

async function fromDrive() {
  const key = JSON.parse(process.env.GDRIVE_SERVICE_ACCOUNT_KEY);
  const folderId = process.env.GDRIVE_FOLDER_ID.trim();
  const token = await driveToken(key);
  const files = await listDrive(token, folderId);
  log(`Drive: ${files.length} image(s) in folder`);
  const items = [];
  for (const f of files) {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(f.id)}?alt=media&supportsAllDrives=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { log(`skip "${f.name}": download HTTP ${res.status}`); continue; }
    items.push({ name: f.name, caption: (f.description || '').trim(), version: f.id + f.modifiedTime, buf: Buffer.from(await res.arrayBuffer()) });
  }
  return items;
}

/* ------------------------------ Local folder ----------------------------- */
async function fromLocal() {
  let names = [];
  try { names = (await fs.readdir(LOCAL_DIR)).filter((n) => IMAGE_RE.test(n)).sort(); } catch { return []; }
  let captions = {};
  try { captions = JSON.parse(await fs.readFile(path.join(LOCAL_DIR, 'captions.json'), 'utf8')); } catch {}
  const items = [];
  for (const n of names.slice(0, MAX_PHOTOS)) {
    const buf = await fs.readFile(path.join(LOCAL_DIR, n));
    items.push({ name: n, caption: (captions[n] || '').trim(), version: n + buf.length, buf });
  }
  log(`local photos/: ${items.length} image(s)`);
  return items;
}

/* -------------------------------- Process -------------------------------- */
async function main() {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const driveConfigured = !!(process.env.GDRIVE_SERVICE_ACCOUNT_KEY && process.env.GDRIVE_FOLDER_ID);
  let items = [];
  if (driveConfigured) {
    try {
      items = await fromDrive();
    } catch (err) {
      // Fail the CI build so the previous (good) deployment stays live instead of an empty gallery.
      console.error('[photos] Google Drive sync failed:', err.message);
      if (inCI) process.exit(1);
      items = await fromLocal();
    }
  } else {
    items = await fromLocal();
  }

  const out = [];
  for (const it of items) {
    const id = createHash('sha256').update(it.version).digest('hex').slice(0, 12);
    try {
      const base = sharp(it.buf, { failOn: 'none' }).rotate(); // apply EXIF orientation, then drop metadata
      const sm = await base.clone().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer({ resolveWithObject: true });
      const lg = await base.clone().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      await fs.writeFile(path.join(OUT_DIR, `${id}-sm.webp`), sm.data);
      await fs.writeFile(path.join(OUT_DIR, `${id}-lg.webp`), lg);
      const fallbackAlt = it.name.replace(/\.[^.]+$/, '').replace(/^\d+[\s._-]*/, '').replace(/[_-]+/g, ' ').trim();
      out.push({
        sm: `/gallery/${id}-sm.webp`,
        lg: `/gallery/${id}-lg.webp`,
        width: sm.info.width,
        height: sm.info.height,
        caption: it.caption,
        alt: it.caption || fallbackAlt || 'Photo',
      });
    } catch (err) {
      log(`skip "${it.name}": cannot decode (${err.message}). Use JPG, PNG or WebP (HEIC is not supported).`);
    }
  }

  await fs.writeFile(OUT_JSON, JSON.stringify(out, null, 2) + '\n');
  log(`gallery: ${out.length} photo(s) written`);
}

main().catch((e) => { console.error(e); process.exit(1); });
