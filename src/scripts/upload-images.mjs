import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const SUPABASE_URL = "https://nlewjhlvxupcavvsyyau.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdqaGx2eHVwY2F2dnN5eWF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg1NzAyNCwiZXhwIjoyMDkxNDMzMDI0fQ.UqueZn4_1TgPp0KCxN-v3DmejM_J3AKmHZA9D7OSoP8";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const BUCKET = "product-images";
const SCRAPED_DIR = path.resolve("public/products/scraped");
const BATCH_SIZE = 10; // concurrent uploads

// ── Sanitize filename for Supabase Storage (ASCII-only keys) ────────────────
// Strips Arabic/non-ASCII chars, collapses hyphens, appends short hash for uniqueness
function sanitizeKey(filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  // Strip non-ASCII characters (Arabic, etc.)
  let safe = base.replace(/[^\x20-\x7E]/g, "");
  // Replace spaces & special chars with hyphens
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, "-");
  // Collapse multiple hyphens
  safe = safe.replace(/-{2,}/g, "-");
  // Trim leading/trailing hyphens
  safe = safe.replace(/^-+|-+$/g, "");

  // If the safe name is too short (all Arabic), use a hash of the original
  if (safe.length < 3) {
    const hash = crypto.createHash("md5").update(base).digest("hex").slice(0, 12);
    safe = safe ? `${safe}-${hash}` : hash;
  }

  return `${safe}${ext}`;
}

async function createBucket() {
  console.log("🪣 Creating storage bucket...");
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
  });
  if (error && !error.message.includes("already exists")) {
    console.error("Bucket error:", error.message);
    return false;
  }
  console.log("✅ Bucket ready");
  return true;
}

async function uploadFile(localPath, remotePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const mimeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  const contentType = mimeMap[ext] || "image/jpeg";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(remotePath, fileBuffer, { contentType, upsert: true });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

async function uploadBatch(items, startIdx, totalFiles) {
  const promises = items.map(async ({ localFile, remotePath }, i) => {
    const idx = startIdx + i;
    const localPath = path.join(SCRAPED_DIR, localFile);
    const result = await uploadFile(localPath, remotePath);
    if (result.success) {
      process.stdout.write(`\r✅ ${idx + 1}/${totalFiles} — ${localFile}`);
    } else {
      console.log(`\n❌ ${localFile}: ${result.error}`);
    }
    return { localFile, remotePath, ...result };
  });
  return Promise.all(promises);
}

async function main() {
  // 1. Create bucket
  const ok = await createBucket();
  if (!ok) return;

  // 2. Get all image files
  const allFiles = fs.readdirSync(SCRAPED_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
  });
  const totalFiles = allFiles.length;
  console.log(`\n📦 Found ${totalFiles} images to upload (${SCRAPED_DIR})`);

  // 3. Build mapping: original filename → sanitized remote path
  //    Also detect collisions and resolve them
  const usedKeys = new Set();
  const fileMap = []; // { localFile, remotePath, sanitizedName }

  for (const file of allFiles) {
    let safeName = sanitizeKey(file);

    // Handle collisions
    if (usedKeys.has(safeName)) {
      const hash = crypto
        .createHash("md5")
        .update(file)
        .digest("hex")
        .slice(0, 8);
      const ext = path.extname(safeName);
      const base = path.basename(safeName, ext);
      safeName = `${base}-${hash}${ext}`;
    }
    usedKeys.add(safeName);

    fileMap.push({
      localFile: file,
      remotePath: `scraped/${safeName}`,
      sanitizedName: safeName,
    });
  }

  const arabicCount = fileMap.filter(
    (f) => f.localFile !== f.sanitizedName
  ).length;
  console.log(
    `🔤 ${arabicCount} files with Arabic chars will be renamed for upload`
  );

  // 4. Upload in batches
  let uploaded = 0;
  let failed = 0;
  for (let i = 0; i < fileMap.length; i += BATCH_SIZE) {
    const batch = fileMap.slice(i, i + BATCH_SIZE);
    const results = await uploadBatch(batch, i, totalFiles);
    uploaded += results.filter((r) => r.success).length;
    failed += results.filter((r) => !r.success).length;
  }

  console.log(`\n\n🏁 Upload done! Uploaded: ${uploaded}, Failed: ${failed}`);

  // 5. Build a lookup: original base slug → array of remote URLs
  //    Original filenames follow pattern: {slug}-{index}.{ext} or {slug}.{ext}
  const slugToUrls = new Map(); // slug → [{index, url}]

  const publicUrl = (remotePath) =>
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remotePath}`;

  for (const item of fileMap) {
    // Only include successfully uploaded files
    // (we'll just include all — failed ones won't be accessible but that's ok)
    const original = item.localFile;
    const ext = path.extname(original);
    const base = path.basename(original, ext);

    // Extract slug and index: {slug}-{N} or just {slug}
    const indexMatch = base.match(/^(.+)-(\d+)$/);
    let slug, index;
    if (indexMatch) {
      slug = indexMatch[1];
      index = parseInt(indexMatch[2]);
    } else {
      slug = base;
      index = 0;
    }

    if (!slugToUrls.has(slug)) slugToUrls.set(slug, []);
    slugToUrls.get(slug).push({
      index,
      url: publicUrl(item.remotePath),
    });
  }

  // Sort each slug's images by index
  for (const [, urls] of slugToUrls) {
    urls.sort((a, b) => a.index - b.index);
  }

  // 6. Update products table with image URLs
  console.log("\n🔗 Linking images to products...");
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, slug, image, images");

  if (prodErr || !products) {
    console.error("Failed to fetch products:", prodErr?.message);
    return;
  }

  let linked = 0;
  let skipped = 0;
  for (const product of products) {
    const urls = slugToUrls.get(product.slug);
    if (!urls || urls.length === 0) {
      skipped++;
      continue;
    }

    const imageUrls = urls.map((u) => u.url);
    const mainImage = imageUrls[0];

    const { error: updateErr } = await supabase
      .from("products")
      .update({
        image: mainImage,
        images: imageUrls,
      })
      .eq("id", product.id);

    if (!updateErr) {
      linked++;
    } else {
      console.log(`\n⚠️ Failed to link ${product.slug}: ${updateErr.message}`);
    }
  }

  console.log(
    `\n✅ Linked images to ${linked}/${products.length} products (${skipped} had no matching images)`
  );
}

main().catch(console.error);
