export function percentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function getComparisonLabel(
  current: number,
  previous: number,
  lowerIsBetter = false,
) {
  const change = percentageChange(current, previous);
  if (change === null) return { text: "Sem base anterior", favorable: null };
  if (change === 0) {
    return { text: "Igual ao período anterior", favorable: null };
  }
  const direction = change > 0 ? "acima" : "abaixo";
  const favorable = lowerIsBetter ? change < 0 : change > 0;
  return {
    text: `${Math.abs(change).toFixed(1).replace(".", ",")}% ${direction} do período anterior`,
    favorable,
  };
}

export function getDefaultReportPeriod(today: string) {
  const end = new Date(`${today}T00:00:00.000Z`);
  const start = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 5, 1),
  );
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: today,
  };
}
