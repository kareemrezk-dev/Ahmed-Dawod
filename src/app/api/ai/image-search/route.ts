import { NextRequest, NextResponse } from "next/server";
import {
  products,
  getCategoryLabel,
  getProductName,
  type Product,
} from "@/lib/products";

// ─── Gemini Vision API call ───────────────────────────────────────────────────
async function analyzeImage(base64Image: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return JSON.stringify({
      error: true,
      message: "AI service not configured",
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

  // Strip data URL prefix if present
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const body = {
    contents: [
      {
        parts: [
          {
            text: `You are an industrial bearing and machinery parts expert. Analyze this image and identify:
1. What type of industrial product this is (bearing, linear rail, ball screw, shaft, housing, etc.)
2. The specific subtype if identifiable (e.g., deep groove ball bearing, needle bearing, cam follower, etc.)
3. Any visible brand markings (SKF, NSK, NTN, FAG, etc.)
4. Any visible model numbers
5. Estimated dimensions if possible
6. The condition (new, used, damaged)

RESPOND IN JSON FORMAT ONLY:
{
  "productType": "bearing" | "linear" | "ball-screw" | "hard-chrome" | "lead-screw" | "fastener" | "housing" | "pulley" | "unknown",
  "subType": "specific subtype description",
  "brand": "identified brand or null",
  "modelNumber": "identified model or null",
  "estimatedDimensions": "e.g. 20x47x14mm or null",
  "condition": "new" | "used" | "damaged" | "unknown",
  "confidence": 0.0 to 1.0,
  "description_ar": "وصف قصير بالعربية",
  "description_en": "short English description",
  "searchKeywords": ["keyword1", "keyword2"]
}`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 512,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error("Gemini Vision error:", response.status);
    return JSON.stringify({ error: true, message: "Vision API error" });
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
}

// ─── Find matching products ──────────────────────────────────────────────────
function findMatchingProducts(analysis: {
  productType?: string;
  subType?: string;
  brand?: string;
  modelNumber?: string;
  searchKeywords?: string[];
}): Product[] {
  let matches: Product[] = [];

  // 1. Try exact model number match
  if (analysis.modelNumber) {
    const modelQ = analysis.modelNumber.toLowerCase();
    matches = products.filter(
      (p) =>
        p.modelNumber.toLowerCase().includes(modelQ) ||
        p.slug.toLowerCase().includes(modelQ)
    );
    if (matches.length > 0) return matches.slice(0, 8);
  }

  // 2. Try brand + subtype
  if (analysis.brand) {
    const brandQ = analysis.brand.toLowerCase();
    const brandMatches = products.filter((p) =>
      p.brand.toLowerCase().includes(brandQ)
    );

    if (analysis.searchKeywords && analysis.searchKeywords.length > 0) {
      const keywordMatches = brandMatches.filter((p) => {
        const searchText =
          `${p.nameEn} ${p.nameAr} ${p.modelNumber} ${p.tags.join(" ")} ${p.descriptionEn}`.toLowerCase();
        return analysis.searchKeywords!.some((kw) =>
          searchText.includes(kw.toLowerCase())
        );
      });
      if (keywordMatches.length > 0) return keywordMatches.slice(0, 8);
    }

    if (brandMatches.length > 0) return brandMatches.slice(0, 8);
  }

  // 3. Try top category mapping
  if (analysis.productType && analysis.productType !== "unknown") {
    const topCatMap: Record<string, string> = {
      bearing: "bearings",
      linear: "linear",
      "ball-screw": "ball-screw",
      "hard-chrome": "hard-chrome",
      "lead-screw": "lead-screw",
      fastener: "fasteners",
      housing: "housings",
      pulley: "pulleys",
    };
    const topCat = topCatMap[analysis.productType];
    if (topCat) {
      matches = products
        .filter((p) => p.topCategory === topCat)
        .slice(0, 8);
      if (matches.length > 0) return matches;
    }
  }

  // 4. Keyword search fallback
  if (analysis.searchKeywords && analysis.searchKeywords.length > 0) {
    for (const kw of analysis.searchKeywords) {
      const kwLower = kw.toLowerCase();
      const kwMatches = products.filter((p) => {
        const searchText =
          `${p.nameEn} ${p.nameAr} ${p.modelNumber} ${p.tags.join(" ")} ${p.descriptionEn} ${p.descriptionAr}`.toLowerCase();
        return searchText.includes(kwLower);
      });
      matches.push(...kwMatches);
    }
    // Deduplicate
    const seen = new Set<string>();
    matches = matches.filter((p) => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });
    return matches.slice(0, 8);
  }

  return [];
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { image, locale = "ar" } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // Analyze image with Gemini Vision
    const rawAnalysis = await analyzeImage(image);

    // Parse the JSON response
    let analysis: Record<string, unknown>;
    try {
      // Extract JSON from potential markdown code fences
      const jsonMatch = rawAnalysis.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      analysis = {};
    }

    if ((analysis as { error?: boolean }).error) {
      return NextResponse.json(
        {
          analysis: null,
          products: [],
          message:
            locale === "ar"
              ? "عذراً، مقدرناش نحلل الصورة. حاول تاني بصورة أوضح."
              : "Sorry, we couldn't analyze the image. Try again with a clearer photo.",
        },
        { status: 200 }
      );
    }

    // Find matching products
    const matchingProducts = findMatchingProducts(
      analysis as {
        productType?: string;
        subType?: string;
        brand?: string;
        modelNumber?: string;
        searchKeywords?: string[];
      }
    );

    // Format products for response
    const formattedProducts = matchingProducts.map((p) => ({
      slug: p.slug,
      modelNumber: p.modelNumber,
      brand: p.brand,
      name: getProductName(p, locale),
      category: getCategoryLabel(p.category, locale),
      topCategory: p.topCategory,
      image: p.images?.[0] ?? p.image ?? null,
    }));

    return NextResponse.json({
      analysis,
      products: formattedProducts,
      message:
        matchingProducts.length > 0
          ? locale === "ar"
            ? `لقينا ${matchingProducts.length} منتج مطابق 🎯`
            : `Found ${matchingProducts.length} matching product(s) 🎯`
          : locale === "ar"
            ? "ملقيناش منتج مطابق. جرب تتواصل معانا عالواتساب وابعتلنا الصورة."
            : "No exact match found. Try contacting us on WhatsApp with the image.",
    });
  } catch (error) {
    console.error("Image search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
