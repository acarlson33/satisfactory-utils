/*
 * Fetch item icons from the Satisfactory wiki Items category and save PNGs to public/images/items/<itemId>.png.
 * - Category members are item pages (ns=0). We fetch their lead image via pageimages.
 * - Only PNGs, skip any URL containing "v0347" and skip "vines".
 *
 * Usage: bun scripts/fetch-icons.ts
 */

import fs from "fs/promises";
import path from "path";

const API = "https://satisfactory.wiki.gg/api.php";
const OUTPUT_DIR = path.resolve(process.cwd(), "public/images/items");
const CATEGORY = "Category:Items";
const USER_AGENT =
  "satisfactory-utils-icon-fetcher/1.0 (+https://github.com/acarlson33/satisfactory-utils)";
const REQUEST_DELAY_MS = 500;
const RATE_LIMIT_BACKOFF_MS = 5000;
const RETRY_LIMIT = 6;

interface CategoryMember {
  pageid: number;
  ns: number;
  title: string; // e.g., "Iron Ore"
}

interface PageImageResponse {
  query?: {
    pages?: Record<
      string,
      {
        original?: { source: string };
        imageinfo?: { url: string }[];
      }
    >;
  };
}

interface ParseImagesResponse {
  parse?: {
    images?: string[]; // file titles
  };
}

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const toSlug = (name: string) => {
  const lower = name.replace(/_/g, " ").toLowerCase();
  return lower.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

const toPathname = (url: string) => {
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
};

const isPng = (url: string) => toPathname(url).endsWith(".png");

const isBlockedVersion = (url: string) => toPathname(url).includes("v0347");

async function fetchJson<T>(url: string, description: string): Promise<T> {
  let attempt = 0;

  while (attempt <= RETRY_LIMIT) {
    await delay(REQUEST_DELAY_MS);

    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    const json = (await res.json()) as T & {
      error?: { code?: string; info?: string };
    };

    if (res.status === 429 || json.error?.code === "ratelimited") {
      attempt++;
      const waitMs = RATE_LIMIT_BACKOFF_MS * Math.max(1, attempt);
      console.warn(
        `Rate limited while fetching ${description}. Waiting ${waitMs}ms before retry ${attempt}/${RETRY_LIMIT}...`
      );
      await delay(waitMs);
      continue;
    }

    if (!res.ok) {
      throw new Error(`${description} failed: ${res.status} ${res.statusText}`);
    }

    return json as T;
  }

  throw new Error(
    `${description} failed after ${
      RETRY_LIMIT + 1
    } attempts due to rate limiting`
  );
}

async function fetchCategoryPages(): Promise<CategoryMember[]> {
  const results: CategoryMember[] = [];
  let cmcontinue: string | undefined;

  do {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      list: "categorymembers",
      cmtitle: CATEGORY,
      cmnamespace: "0", // item pages
      cmlimit: "500",
    });
    if (cmcontinue) params.set("cmcontinue", cmcontinue);

    const json = await fetchJson<{
      query?: { categorymembers?: CategoryMember[] };
      continue?: { cmcontinue?: string };
    }>(`${API}?${params.toString()}`, "categorymembers fetch");

    results.push(...(json.query?.categorymembers || []));
    cmcontinue = json.continue?.cmcontinue;
  } while (cmcontinue);

  return results;
}

async function fetchLeadImageUrl(title: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: title,
    prop: "pageimages",
    piprop: "original",
  });
  const json = await fetchJson<PageImageResponse>(
    `${API}?${params.toString()}`,
    `pageimages for ${title}`
  );
  const page = json.query?.pages
    ? Object.values(json.query.pages)[0]
    : undefined;
  const url = page?.original?.source;
  if (url && isPng(url) && !isBlockedVersion(url)) {
    return url;
  }

  // Fallback: parse page images and pick first PNG
  const parseParams = new URLSearchParams({
    action: "parse",
    format: "json",
    page: title,
    prop: "images",
  });
  const parseJson = await fetchJson<ParseImagesResponse>(
    `${API}?${parseParams.toString()}`,
    `parse images for ${title}`
  );
  const files = parseJson.parse?.images || [];
  const fileTitle = files.find(
    (f) =>
      f.toLowerCase().endsWith(".png") && !f.toLowerCase().includes("v0347")
  );
  if (!fileTitle) return null;

  // Resolve file to URL
  const fileParams = new URLSearchParams({
    action: "query",
    format: "json",
    titles: `File:${fileTitle}`,
    prop: "imageinfo",
    iiprop: "url",
  });
  const fileJson = await fetchJson<PageImageResponse>(
    `${API}?${fileParams.toString()}`,
    `imageinfo for ${fileTitle}`
  );
  const filePage = fileJson.query?.pages
    ? Object.values(fileJson.query.pages)[0]
    : undefined;
  const fileUrl = filePage?.original?.source || filePage?.imageinfo?.[0]?.url;
  if (!fileUrl || !isPng(fileUrl)) return null;
  if (isBlockedVersion(fileUrl)) return null;
  return fileUrl;
}

async function download(url: string, destPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("image/png")) {
    throw new Error(`Unexpected content-type ${contentType} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
}

async function main() {
  await ensureDir(OUTPUT_DIR);
  console.log(`Fetching item pages from ${CATEGORY}...`);
  const members = await fetchCategoryPages();
  console.log(`Found ${members.length} item pages`);

  let downloaded = 0;
  let skipped = 0;
  for (const member of members) {
    const title = member.title; // Item page title
    const slug = toSlug(title);
    if (!slug || slug === "vines") {
      skipped++;
      continue;
    }

    let url: string | null = null;
    try {
      url = await fetchLeadImageUrl(title);
    } catch (error) {
      console.warn(`Failed to resolve image for ${title}:`, error);
      skipped++;
      continue;
    }
    if (!url) {
      console.warn(`No PNG image found for ${title}`);
      skipped++;
      continue;
    }

    const destPath = path.join(OUTPUT_DIR, `${slug}.png`);
    try {
      await download(url, destPath);
      downloaded++;
      console.log(`Saved ${slug}.png`);
    } catch (error) {
      console.warn(`Failed ${slug}:`, error);
      skipped++;
    }
  }

  console.log(
    `Done. Downloaded ${downloaded}, skipped ${skipped}. Output: ${OUTPUT_DIR}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
