import { count, countDistinct, desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { pageViews } from "@/db/schema";

const costaRicaToday = sql`(date_trunc('day', now() AT TIME ZONE 'America/Costa_Rica') AT TIME ZONE 'America/Costa_Rica')`;
const lastSevenDays = sql`(${costaRicaToday}) - interval '6 days'`;
const lastThirtyDays = sql`(${costaRicaToday}) - interval '29 days'`;

function totalsSince(start: typeof costaRicaToday) {
  return db.select({ views: count(pageViews.id), visitors: countDistinct(pageViews.visitorHash) })
    .from(pageViews)
    .where(sql`${pageViews.visitedAt} >= ${start}`);
}

export async function getVisitorAnalytics() {
  const views = count(pageViews.id);
  const [todayRows, sevenDayRows, thirtyDayRows, topPages, topCities] = await Promise.all([
    totalsSince(costaRicaToday),
    totalsSince(lastSevenDays),
    totalsSince(lastThirtyDays),
    db.select({ path: pageViews.path, views, visitors: countDistinct(pageViews.visitorHash) })
      .from(pageViews)
      .where(sql`${pageViews.visitedAt} >= ${lastThirtyDays}`)
      .groupBy(pageViews.path)
      .orderBy(desc(views))
      .limit(5),
    db.select({ city: pageViews.city, region: pageViews.region, country: pageViews.country, views, visitors: countDistinct(pageViews.visitorHash) })
      .from(pageViews)
      .where(sql`${pageViews.visitedAt} >= ${lastThirtyDays} AND ${pageViews.city} IS NOT NULL`)
      .groupBy(pageViews.city, pageViews.region, pageViews.country)
      .orderBy(desc(views))
      .limit(5),
  ]);

  return {
    today: todayRows[0] ?? { views: 0, visitors: 0 },
    sevenDays: sevenDayRows[0] ?? { views: 0, visitors: 0 },
    thirtyDays: thirtyDayRows[0] ?? { views: 0, visitors: 0 },
    topPages,
    topCities,
  };
}
