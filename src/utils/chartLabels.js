// src/utils/chartLabels.js
function formatDateLabel(dateStr, period) {
  const d = new Date(dateStr + "T00:00:00");
  if (period === "7D") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (period === "1Y" || period === "All") return d.toLocaleDateString("en-US", { month: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getSmartLabelsForAllPeriod(dates) {
  const first = new Date(dates[0] + "T00:00:00");
  const last = new Date(dates[dates.length - 1] + "T00:00:00");

  // TS-check friendly: Date -> number
  const spanDays = Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));

  if (spanDays <= 60) {
    const step = Math.floor(dates.length / 4);
    return Array.from({ length: 5 }).map((_, i) => {
      const idx = i === 4 ? dates.length - 1 : i * step;
      return { date: dates[idx], label: formatDateLabel(dates[idx], "30D") };
    });
  }

  const seen = new Set();
  const monthDates = [];
  for (const ds of dates) {
    const d = new Date(ds + "T00:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      monthDates.push(ds);
    }
  }

  if (monthDates.length <= 5) {
    return monthDates.map((ds) => ({ date: ds, label: formatDateLabel(ds, "All") }));
  }

  const step = Math.floor(monthDates.length / 4);
  return Array.from({ length: 5 }).map((_, i) => {
    const idx = i === 4 ? monthDates.length - 1 : i * step;
    return { date: monthDates[idx], label: formatDateLabel(monthDates[idx], "All") };
  });
}

export function getXAxisLabels(dates, period) {
  if (!dates?.length) return [];

  if (period === "All") return getSmartLabelsForAllPeriod(dates);

  const labelCount = period === "1Y" ? 5 : period === "90D" ? 4 : 3;
  const step = Math.floor(dates.length / (labelCount - 1));

  return Array.from({ length: labelCount }).map((_, i) => {
    const idx = i === labelCount - 1 ? dates.length - 1 : i * step;
    return { date: dates[idx], label: formatDateLabel(dates[idx], period) };
  });
}