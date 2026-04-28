/**
 * Standard bearing dimensions lookup table (ISO 15).
 * Maps model number base → { inner, outer, width } in mm.
 * Used by the Smart Search to resolve dimension queries like "20x47x14" → "6204".
 */

export interface BearingDimension {
  inner: number;
  outer: number;
  width: number;
}

/** Model base → dimensions (mm) */
export const bearingDimensions: Record<string, BearingDimension> = {
  // ── 6000 Series (Deep Groove) ──
  "6000": { inner: 10, outer: 26, width: 8 },
  "6001": { inner: 12, outer: 28, width: 8 },
  "6002": { inner: 15, outer: 32, width: 9 },
  "6003": { inner: 17, outer: 35, width: 10 },
  "6004": { inner: 20, outer: 42, width: 12 },
  "6005": { inner: 25, outer: 47, width: 12 },
  "6006": { inner: 30, outer: 55, width: 13 },
  "6007": { inner: 35, outer: 62, width: 14 },
  "6008": { inner: 40, outer: 68, width: 15 },
  "6009": { inner: 45, outer: 75, width: 16 },
  "6010": { inner: 50, outer: 80, width: 16 },
  "6011": { inner: 55, outer: 90, width: 18 },
  "6012": { inner: 60, outer: 95, width: 18 },
  "6013": { inner: 65, outer: 100, width: 18 },
  "6014": { inner: 70, outer: 110, width: 20 },

  // ── 6200 Series ──
  "6200": { inner: 10, outer: 30, width: 9 },
  "6201": { inner: 12, outer: 32, width: 10 },
  "6202": { inner: 15, outer: 35, width: 11 },
  "6203": { inner: 17, outer: 40, width: 12 },
  "6204": { inner: 20, outer: 47, width: 14 },
  "6205": { inner: 25, outer: 52, width: 15 },
  "6206": { inner: 30, outer: 62, width: 16 },
  "6207": { inner: 35, outer: 72, width: 17 },
  "6208": { inner: 40, outer: 80, width: 18 },
  "6209": { inner: 45, outer: 85, width: 19 },
  "6210": { inner: 50, outer: 90, width: 20 },
  "6211": { inner: 55, outer: 100, width: 21 },
  "6212": { inner: 60, outer: 110, width: 22 },
  "6213": { inner: 65, outer: 120, width: 23 },
  "6214": { inner: 70, outer: 125, width: 24 },

  // ── 6300 Series ──
  "6300": { inner: 10, outer: 35, width: 11 },
  "6301": { inner: 12, outer: 37, width: 12 },
  "6302": { inner: 15, outer: 42, width: 13 },
  "6303": { inner: 17, outer: 47, width: 14 },
  "6304": { inner: 20, outer: 52, width: 15 },
  "6305": { inner: 25, outer: 62, width: 17 },
  "6306": { inner: 30, outer: 72, width: 19 },
  "6307": { inner: 35, outer: 80, width: 21 },
  "6308": { inner: 40, outer: 90, width: 23 },
  "6309": { inner: 45, outer: 100, width: 25 },
  "6310": { inner: 50, outer: 110, width: 27 },
  "6311": { inner: 55, outer: 120, width: 29 },
  "6312": { inner: 60, outer: 130, width: 31 },

  // ── 6800 Series (Thin Section) ──
  "6800": { inner: 10, outer: 19, width: 5 },
  "6801": { inner: 12, outer: 21, width: 5 },
  "6802": { inner: 15, outer: 24, width: 5 },
  "6803": { inner: 17, outer: 26, width: 5 },
  "6804": { inner: 20, outer: 32, width: 7 },
  "6805": { inner: 25, outer: 37, width: 7 },
  "6806": { inner: 30, outer: 42, width: 7 },
  "6807": { inner: 35, outer: 47, width: 7 },
  "6808": { inner: 40, outer: 52, width: 7 },

  // ── 6900 Series ──
  "6900": { inner: 10, outer: 22, width: 6 },
  "6901": { inner: 12, outer: 24, width: 6 },
  "6902": { inner: 15, outer: 28, width: 7 },
  "6903": { inner: 17, outer: 30, width: 7 },
  "6904": { inner: 20, outer: 37, width: 9 },
  "6905": { inner: 25, outer: 42, width: 9 },
  "6906": { inner: 30, outer: 47, width: 9 },
  "6907": { inner: 35, outer: 55, width: 10 },
  "6908": { inner: 40, outer: 62, width: 12 },

  // ── 30200 Series (Tapered Roller) ──
  "30202": { inner: 15, outer: 35, width: 12 },
  "30203": { inner: 17, outer: 40, width: 14 },
  "30204": { inner: 20, outer: 47, width: 14 },
  "30205": { inner: 25, outer: 52, width: 15 },
  "30206": { inner: 30, outer: 62, width: 16 },
  "30207": { inner: 35, outer: 72, width: 17 },
  "30208": { inner: 40, outer: 80, width: 18 },
  "30209": { inner: 45, outer: 85, width: 19 },
  "30210": { inner: 50, outer: 90, width: 20 },

  // ── 30300 Series (Tapered Roller) ──
  "30302": { inner: 15, outer: 42, width: 13 },
  "30303": { inner: 17, outer: 47, width: 14 },
  "30304": { inner: 20, outer: 52, width: 15 },
  "30305": { inner: 25, outer: 62, width: 17 },
  "30306": { inner: 30, outer: 72, width: 19 },
  "30307": { inner: 35, outer: 80, width: 21 },
  "30308": { inner: 40, outer: 90, width: 23 },

  // ── NJ Series (Cylindrical Roller) ──
  "NJ202": { inner: 15, outer: 35, width: 11 },
  "NJ203": { inner: 17, outer: 40, width: 12 },
  "NJ204": { inner: 20, outer: 47, width: 14 },
  "NJ205": { inner: 25, outer: 52, width: 15 },
  "NJ206": { inner: 30, outer: 62, width: 16 },
  "NJ207": { inner: 35, outer: 72, width: 17 },
  "NJ208": { inner: 40, outer: 80, width: 18 },
  "NJ209": { inner: 45, outer: 85, width: 19 },
  "NJ210": { inner: 50, outer: 90, width: 20 },

  // ── NU Series (Cylindrical Roller) ──
  "NU202": { inner: 15, outer: 35, width: 11 },
  "NU203": { inner: 17, outer: 40, width: 12 },
  "NU204": { inner: 20, outer: 47, width: 14 },
  "NU205": { inner: 25, outer: 52, width: 15 },
  "NU206": { inner: 30, outer: 62, width: 16 },
  "NU207": { inner: 35, outer: 72, width: 17 },
  "NU208": { inner: 40, outer: 80, width: 18 },

  // ── 32000 Series (Tapered Roller) ──
  "32004": { inner: 20, outer: 42, width: 15 },
  "32005": { inner: 25, outer: 47, width: 15 },
  "32006": { inner: 30, outer: 55, width: 17 },
  "32007": { inner: 35, outer: 62, width: 18 },
  "32008": { inner: 40, outer: 68, width: 19 },
  "32009": { inner: 45, outer: 75, width: 20 },
  "32010": { inner: 50, outer: 80, width: 20 },

  // ── UC Series (Pillow Block Inserts) ──
  "UC201": { inner: 12, outer: 47, width: 31 },
  "UC202": { inner: 15, outer: 47, width: 31 },
  "UC203": { inner: 17, outer: 47, width: 31 },
  "UC204": { inner: 20, outer: 47, width: 31 },
  "UC205": { inner: 25, outer: 52, width: 34 },
  "UC206": { inner: 30, outer: 62, width: 39 },
  "UC207": { inner: 35, outer: 72, width: 43 },
  "UC208": { inner: 40, outer: 80, width: 49 },

  // ── 51100 Series (Thrust) ──
  "51100": { inner: 10, outer: 24, width: 9 },
  "51101": { inner: 12, outer: 26, width: 9 },
  "51102": { inner: 15, outer: 28, width: 9 },
  "51103": { inner: 17, outer: 30, width: 9 },
  "51104": { inner: 20, outer: 35, width: 10 },
  "51105": { inner: 25, outer: 42, width: 11 },
  "51106": { inner: 30, outer: 47, width: 11 },
  "51107": { inner: 35, outer: 52, width: 12 },
  "51108": { inner: 40, outer: 60, width: 13 },
};

/**
 * Build a reverse index: "inner×outer×width" → model numbers
 * Enables O(1) dimension-based lookup.
 */
const dimensionIndex: Map<string, string[]> = new Map();

for (const [model, dims] of Object.entries(bearingDimensions)) {
  const key = `${dims.inner}x${dims.outer}x${dims.width}`;
  const existing = dimensionIndex.get(key) || [];
  existing.push(model);
  dimensionIndex.set(key, existing);
}

/**
 * Find bearing model numbers that match given dimensions.
 * Returns an array of model base numbers (e.g. ["6204", "30204"]).
 */
export function findModelsByDimensions(
  inner: number,
  outer: number,
  width: number
): string[] {
  const key = `${inner}x${outer}x${width}`;
  return dimensionIndex.get(key) || [];
}

/**
 * Find bearing model numbers with close (±tolerance) dimensions.
 * Useful for "similar sizes" suggestion.
 */
export function findCloseModels(
  inner: number,
  outer: number,
  width: number,
  tolerance = 3
): string[] {
  const results: string[] = [];
  for (const [model, dims] of Object.entries(bearingDimensions)) {
    if (
      Math.abs(dims.inner - inner) <= tolerance &&
      Math.abs(dims.outer - outer) <= tolerance &&
      Math.abs(dims.width - width) <= tolerance
    ) {
      results.push(model);
    }
  }
  return results;
}
