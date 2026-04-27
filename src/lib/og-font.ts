const REGULAR =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/crimsontext/CrimsonText-Regular.ttf";
const SEMIBOLD =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/crimsontext/CrimsonText-SemiBold.ttf";

let cache: { regular: ArrayBuffer; semibold: ArrayBuffer } | null = null;

export async function loadOgSerif(): Promise<{
  regular: ArrayBuffer;
  semibold: ArrayBuffer;
}> {
  if (cache) return cache;
  const [regular, semibold] = await Promise.all([
    fetch(REGULAR).then((r) => {
      if (!r.ok) throw new Error(`Font fetch failed: ${r.status}`);
      return r.arrayBuffer();
    }),
    fetch(SEMIBOLD).then((r) => {
      if (!r.ok) throw new Error(`Font fetch failed: ${r.status}`);
      return r.arrayBuffer();
    }),
  ]);
  cache = { regular, semibold };
  return cache;
}
