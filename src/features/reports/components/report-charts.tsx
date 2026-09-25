"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ReportSnapshot } from "../schemas";

function formatter(currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency });
}

function compact(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function monthLabel(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function MonthlyReportChart({
  data,
  currency,
  locale,
}: {
  data: ReportSnapshot["monthly"];
  currency: string;
  locale: string;
}) {
  const money = formatter(currency, locale);
  return (
    <div
      className="h-80 w-full"
      role="img"
      aria-label="Evolução mensal de receitas e despesas"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
          accessibilityLayer
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            opacity={0.35}
          />
          <XAxis
            dataKey="month"
            tickFormatter={(value) => monthLabel(String(value), locale)}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => compact(Number(value), locale)}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value, name) => [
              money.format(Number(value)),
              name === "income" ? "Receitas" : "Despesas",
            ]}
            labelFormatter={(value) => monthLabel(String(value), locale)}
            contentStyle={{
              borderRadius: 12,
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--card-foreground)",
            }}
          />
          <Legend
            formatter={(value) =>
              value === "income" ? "Receitas" : "Despesas"
            }
          />
          <Bar dataKey="income" fill="#16A34A" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="#F97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReportCategoryChart({
  data,
  currency,
  locale,
}: {
  data: ReportSnapshot["expense_categories"];
  currency: string;
  locale: string;
}) {
  const money = formatter(currency, locale);
  return (
    <div
      className="h-80 w-full"
      role="img"
      aria-label="Distribuição de despesas por categoria"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart accessibilityLayer>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            innerRadius="50%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {data.map((item) => (
              <Cell key={item.id} fill={item.color ?? "#64748B"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [money.format(Number(value)), name]}
            contentStyle={{
              borderRadius: 12,
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--card-foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
