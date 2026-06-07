import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  Package,
  Boxes,
  AlertTriangle,
  History,
  ArrowRight,
} from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import StatCard from "../components/ui/StatCard";
import Card, { CardHeader, CardTitle, CardBody } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { useInventory } from "../hooks/useParts";
import { useTransactions } from "../hooks/useTransactions";
import { isLowStock, formatNumber } from "../utils/format";

const INK = "#121212";
const GRID = "#e8e8e8";
const AXIS = "#909090";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-ink-100 bg-white px-3 py-2 shadow-[var(--shadow-lift)]">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="text-sm font-bold text-ink-900">
        {formatNumber(payload[0].value)}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { data: rows = [], isLoading } = useInventory();
  const { data: txns = [] } = useTransactions();

  // Distinct parts (rows share global stock by name).
  const parts = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (!map.has(r.partId))
        map.set(r.partId, {
          name: r.name,
          quantity: r.quantity,
          reorder_level: r.reorder_level,
        });
    });
    return [...map.values()];
  }, [rows]);

  const totalUnits = parts.reduce((s, p) => s + p.quantity, 0);
  const lowParts = parts.filter(isLowStock);

  const stockByPart = useMemo(
    () =>
      [...parts]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 8)
        .map((p) => ({
          name: p.name.length > 14 ? p.name.slice(0, 13) + "…" : p.name,
          quantity: p.quantity,
        })),
    [parts]
  );

  const issuesOverTime = useMemo(() => {
    const days = 14;
    const buckets = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().split("T")[0], 0);
    }
    txns.forEach((t) => {
      if (buckets.has(t.issue_date))
        buckets.set(t.issue_date, buckets.get(t.issue_date) + t.quantity);
    });
    return [...buckets.entries()].map(([date, qty]) => ({
      date: date.slice(5),
      qty,
    }));
  }, [txns]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A real-time snapshot of your spare-parts operation."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard
          label="Spare parts"
          value={formatNumber(parts.length)}
          icon={Package}
          loading={isLoading}
          hint="distinct SKUs"
        />
        <StatCard
          label="Units in stock"
          value={formatNumber(totalUnits)}
          icon={Boxes}
          loading={isLoading}
        />
        <StatCard
          label="Low stock"
          value={formatNumber(lowParts.length)}
          icon={AlertTriangle}
          loading={isLoading}
          emphasis={lowParts.length > 0}
          hint="at/below reorder"
        />
        <StatCard
          label="Transactions"
          value={formatNumber(txns.length)}
          icon={History}
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top stock by part</CardTitle>
          </CardHeader>
          <CardBody>
            {stockByPart.length === 0 ? (
              <EmptyState icon={Package} title="No stock data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={stockByPart}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: AXIS }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: AXIS }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f4f4f4" }} />
                  <Bar dataKey="quantity" fill={INK} radius={[6, 6, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Units issued · last 14 days</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={issuesOverTime}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="issueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={INK} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={INK} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: AXIS }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: AXIS }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="qty"
                  stroke={INK}
                  strokeWidth={2}
                  fill="url(#issueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Low stock list */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Low stock alerts</CardTitle>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
          >
            View inventory <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {lowParts.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="All stock levels are healthy"
              description="No parts are at or below their reorder level."
            />
          ) : (
            <ul className="divide-y divide-ink-50">
              {lowParts.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between px-6 py-3.5"
                >
                  <span className="font-medium text-ink-900">{p.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-sm text-ink-500">
                      {p.quantity} / reorder {p.reorder_level}
                    </span>
                    <Badge variant="danger">Low</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
