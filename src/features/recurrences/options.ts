export const recurrenceFrequencies = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
  { value: "bimonthly", label: "Bimestral" },
  { value: "quarterly", label: "Trimestral" },
  { value: "semiannual", label: "Semestral" },
  { value: "annual", label: "Anual" },
] as const;

export function getRecurrenceFrequencyLabel(value: string) {
  return (
    recurrenceFrequencies.find((item) => item.value === value)?.label ??
    "Frequência desconhecida"
  );
}
