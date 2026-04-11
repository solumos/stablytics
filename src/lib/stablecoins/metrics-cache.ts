import { getSupabase } from "@/lib/supabase";
import type { GlobalMetrics } from "./metrics";

const CACHE_KEY = "global_metrics";

/** Read cached metrics from Supabase (instant, no RPC calls). */
export async function getCachedMetrics(): Promise<GlobalMetrics | null> {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 5_000)
    );

    const query = supabase
      .from("metrics_cache")
      .select("data, updated_at")
      .eq("key", CACHE_KEY)
      .single()
      .then(({ data, error }) => {
        if (error || !data?.data) return null;
        const metrics = data.data as GlobalMetrics;
        const updatedAt = new Date(data.updated_at).getTime();
        const age = Date.now() - updatedAt;
        if (age > 2 * 60 * 60 * 1000) return null;
        return metrics;
      });

    return await Promise.race([query, timeout]);
  } catch (e) {
    console.error("[metrics-cache] getCachedMetrics failed:", e);
    return null;
  }
}

/** Write computed metrics to Supabase cache. */
export async function setCachedMetrics(metrics: GlobalMetrics): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase
      .from("metrics_cache")
      .upsert({
        key: CACHE_KEY,
        data: metrics,
        updated_at: new Date().toISOString(),
      });
  } catch (e) {
    console.error("[metrics-cache] setCachedMetrics failed:", e);
  }
}
