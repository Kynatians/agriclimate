import {
  listBlocks,
  getBlockMetrics,
  getDistrictSummary,
  listAlerts,
  getTimeSeries,
  getIrrigationPlan,
  BlockMetrics,
  TimeSeriesPoint,
  CropRecommendation,
} from "@/lib/dal";
import { recommendTop } from "@/lib/indices/css";
import { AppModeSwitch } from "@/components/shared/AppModeSwitch";

export default async function Page() {
  const blocks = await listBlocks("kurigram");
  const summary = await getDistrictSummary("kurigram");
  const alerts = await listAlerts({ districtId: "kurigram" });
  const irrigationPlan = await getIrrigationPlan("kurigram");

  // Fetch metrics, recommendations, and time series in parallel
  const metricsMap: Record<string, BlockMetrics> = {};
  const recommendationsMap: Record<string, CropRecommendation[]> = {};
  const timeSeriesMap: Record<string, TimeSeriesPoint[]> = {};

  await Promise.all(
    blocks.map(async (block) => {
      const [m, ts] = await Promise.all([
        getBlockMetrics(block.id),
        getTimeSeries(block.id, 30),
      ]);
      if (m) {
        metricsMap[block.id] = m;
        recommendationsMap[block.id] = recommendTop(m, 7);
      }
      if (ts) {
        timeSeriesMap[block.id] = ts;
      }
    })
  );

  return (
    <main className="min-h-screen w-full">
      <AppModeSwitch
        blocks={blocks}
        metricsMap={metricsMap}
        summary={summary}
        alerts={alerts}
        recommendationsMap={recommendationsMap}
        timeSeriesMap={timeSeriesMap}
        irrigationPlan={irrigationPlan}
      />
    </main>
  );
}
