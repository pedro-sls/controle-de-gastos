"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney } from "@/features/finance/money";

type CashFlowPoint = {
  date: string;
  income: number;
  expense: number;
};

type ExpenseCategoryPoint = {
  id: string;
  name: string;
  color: string | null;
  amount: number;
};

function shortDate(value: string) {
  return value.slice(8, 10);
}

function compactMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  return (
    <div
      className="h-72 w-full"
      aria-label="Gráfico de receitas e despesas por dia"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
          accessibilityLayer
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            opacity={0.35}
          />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tickLine={false}
            axisLine={false}
            minTickGap={12}
          />
          <YAxis
            tickFormatter={compactMoney}
            tickLine={false}
            axisLine={false}
            width={58}
          />
          <Tooltip
            formatter={(value, name) => [
              formatMoney(Number(value)),
              name === "income" ? "Receitas" : "Despesas",
            ]}
            labelFormatter={(label) => `Dia ${shortDate(String(label))}`}
            contentStyle={{
              borderRadius: 12,
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--card-foreground)",
            }}
          />
          <Bar
            dataKey="income"
            name="Receitas"
            fill="#16A34A"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expense"
            name="Despesas"
            fill="#F97316"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpenseCategoryChart({
  data,
}: {
  data: ExpenseCategoryPoint[];
}) {
  return (
    <div className="h-72 w-full" aria-label="Gráfico de despesas por categoria">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart accessibilityLayer>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            innerRadius="52%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {data.map((item) => (
              <Cell key={item.id} fill={item.color ?? "#64748B"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatMoney(Number(value)), name]}
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
