export function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function resolveCoordinates(
  location: string,
  country: string,
  customLat?: number,
  customLng?: number
): { lat: number; lng: number } {
  if (
    customLat !== undefined &&
    customLng !== undefined &&
    !isNaN(customLat) &&
    !isNaN(customLng) &&
    customLat !== 0 &&
    customLng !== 0
  ) {
    return { lat: Number(customLat), lng: Number(customLng) };
  }

  const loc = (location || "").toLowerCase();
  const c = (country || "").toLowerCase();

  // India
  if (loc.includes("bengaluru") || loc.includes("bangalore") || loc.includes("outer ring")) {
    return { lat: 12.9249, lng: 77.6744 };
  }
  if (loc.includes("hyderabad") || loc.includes("gachibowli") || loc.includes("hitec")) {
    return { lat: 17.4474, lng: 78.3762 };
  }
  if (loc.includes("mumbai") || loc.includes("bandra")) {
    return { lat: 19.0760, lng: 72.8777 };
  }
  if (loc.includes("delhi")) {
    return { lat: 28.6139, lng: 77.2090 };
  }

  // Brazil
  if (loc.includes("rio") || loc.includes("vargas") || c.includes("brazil")) {
    return { lat: -22.9035, lng: -43.1824 };
  }
  if (loc.includes("são paulo") || loc.includes("sao paulo") || loc.includes("paulista")) {
    return { lat: -23.5505, lng: -46.6333 };
  }

  // South Africa
  if (loc.includes("johannesburg") || loc.includes("newtown") || loc.includes("m1") || c.includes("south")) {
    return { lat: -26.2041, lng: 28.0473 };
  }
  if (loc.includes("cape town")) {
    return { lat: -33.9249, lng: 18.4241 };
  }

  // Russia
  if (loc.includes("moscow") || loc.includes("tverskaya") || c.includes("russia")) {
    return { lat: 55.7558, lng: 37.6173 };
  }

  // China
  if (loc.includes("beijing") || loc.includes("chaoyang") || c.includes("china")) {
    return { lat: 39.9042, lng: 116.4074 };
  }

  // Default fallback (deterministic)
  return { lat: 17.3850, lng: 78.4867 };
}

export function generateDeterministicSemanticVector(text: string): number[] {
  const words = (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const dim = 64;
  const vec = new Array(dim).fill(0);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash * 31 + word.charCodeAt(c)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1;
    if (i < words.length - 1) {
      const bigramHash = (hash * 37 + words[i + 1].length) & 0xffffffff;
      vec[Math.abs(bigramHash) % dim] += 0.5;
    }
  }
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vec[i] /= norm;
  }
  return vec;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}
