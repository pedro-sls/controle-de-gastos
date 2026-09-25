export const currencyOptions = [
  { value: "BRL", label: "Real brasileiro (R$)" },
] as const;

export const localeOptions = [
  { value: "pt-BR", label: "Português (Brasil)" },
] as const;

export const timezoneOptions = [
  { value: "America/Recife", label: "Recife" },
  { value: "America/Fortaleza", label: "Fortaleza" },
  { value: "America/Bahia", label: "Salvador" },
  { value: "America/Sao_Paulo", label: "Brasília / São Paulo" },
  { value: "America/Manaus", label: "Manaus" },
  { value: "America/Rio_Branco", label: "Rio Branco" },
  { value: "America/Noronha", label: "Fernando de Noronha" },
] as const;

export const dateFormatOptions = [
  { value: "dd/MM/yyyy", label: "DD/MM/AAAA" },
  { value: "MM/dd/yyyy", label: "MM/DD/AAAA" },
  { value: "yyyy-MM-dd", label: "AAAA-MM-DD" },
] as const;

export const themeOptions = [
  { value: "system", label: "Acompanhar o sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
] as const;
