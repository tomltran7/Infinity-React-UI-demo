import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Motion, spring, useMotionValue, motion } from "framer-motion";
import { Clock, Activity, GitPullRequest, ServerCog, Users } from
"lucide-react";

// Single-file mock Swarmia dashboard. Uses Tailwind for styling and
Recharts for charts.
// Replace mockData with real API calls to Swarmia / GitHub / Datadog
where needed.

const kpiData = {
  deploymentFrequency: { value7d: 3, value30d: 12 },
  changeLeadTimeHours: { median: 52 },
  prCycleTimeHours: { median: 36 },
  reviewTimeHours: { median: 8 },
  testsPassRate: { pct: 96.2 },
  wipOpenPRs: { count: 18 },
};

const weeks = Array.from({ length: 12 }).map((_, i) => `W-${11 - i}`);
const timeSeries = weeks.map((w, i) => ({
  week: w,
  merges: Math.round(8 + i * 3 + (Math.random() * 6 - 3)),
  deployments: Math.round(1 + i / 3 + Math.random() * 2),
  tests_passed: 40 + i * 4 + Math.round(Math.random() * 6),
  tests_failed: 3 + Math.round(Math.random() * 4),
  latency_ms: 120 - i + Math.round(Math.random() * 10 - 5),
  error_rate: +(1 + Math.random() * 1.5).toFixed(2),
  queries: 200 + i * 120 + Math.round(Math.random() * 200),
}));

const contributors = [
  { name: "alice", commits: 150 },
  { name: "bob", commits: 120 },
  { name: "carol", commits: 95 },
  { name: "dave", commits: 80 },
  { name: "eve", commits: 60 },
];

const investment = [
  { name: "Features", value: 55 },
  { name: "Bugs", value: 20 },
  { name: "Tech debt", value: 15 },
  { name: "Ops", value: 10 },
];

// small helper to produce heatmap cells
function Heatmap({ matrix = [], max = 5 }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {matrix.flat().map((v, idx) => {
        const intensity = Math.min(1, v / max);
        const shade = Math.round(100 + intensity * 600);
        const bg = `bg-green-${Math.min(900, Math.max(100, shade))}`;
// Tailwind-like intent (approx)
        // fallback style using inline rgba
        const color = `rgba(34,197,94,${0.15 + 0.85 * intensity})`;
        return (
          <div
            key={idx}
            title={`${v} contributions`}
            className="w-6 h-6 rounded-sm"
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}

export default function SwarmiaMockDashboard() {
  const [timeRange, setTimeRange] = useState("90d");
  const [selectedTeam, setSelectedTeam] = useState("All teams");

  const heatmapMatrix = useMemo(() => {
    // create 12x7 matrix of small integers
    const rows = 12;
    const cols = 7;
    const m = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => Math.max(0,
Math.round(Math.random() * 6 + (r * 0.5))))
    );
    return m;
  }, []);

  const totalAdopters = useMemo(() => timeSeries.reduce((s, t) => s +
Math.round(t.merges / 6), 0), []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Swarmia — Engineering
Health & Model Adoption</h1>
          <div className="flex gap-3 items-center">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border px-3 py-1 rounded-md bg-white"
            >
              <option value="7d">7d</option>
              <option value="30d">30d</option>
              <option value="90d">90d</option>
              <option value="1y">1y</option>
            </select>

            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="border px-3 py-1 rounded-md bg-white"
            >
              <option>All teams</option>
              <option>Platform</option>
              <option>ML</option>
              <option>Product</option>
            </select>

            <button className="bg-indigo-600 text-white px-4 py-1
rounded-md">Share</button>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-1">Dashboard showing
DORA metrics, PR flow, CI/test signals, and model adoption.</p>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <Card icon={<Activity />} title="Deployments / 7d"
value={`${kpiData.deploymentFrequency.value7d}`} />
        <Card icon={<Clock />} title="Change lead time (median)"
value={`${kpiData.changeLeadTimeHours.median} hrs`} />
        <Card icon={<GitPullRequest />} title="PR cycle time"
value={`${kpiData.prCycleTimeHours.median} hrs`} />
        <Card icon={<Users />} title="Review time"
value={`${kpiData.reviewTimeHours.median} hrs`} />
        <Card icon={<ServerCog />} title="Tests pass rate"
value={`${kpiData.testsPassRate.pct}%`} />
        <Card icon={<Activity />} title="Open WIP PRs"
value={`${kpiData.wipOpenPRs.count}`} />
      </div>

      {/* Middle row with overlay and worklog */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-8 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Velocity & Quality
Overlay</h3>
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 10, right:
50, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="merges"
stroke="#2563eb" name="PR merges" strokeWidth={2} />
                <Line yAxisId="left" type="monotone"
dataKey="deployments" stroke="#10b981" name="Deployments"
strokeWidth={2} />
                <Line yAxisId="right" type="monotone"
dataKey="error_rate" stroke="#ef4444" name="Error rate (%)"
strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-span-4 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">PR Worklog</h3>
          <div className="space-y-2">
            <WorklogRow title="Fix claim validation edge case"
author="alice" age="2h ago" status="Open" />
            <WorklogRow title="Add new claim processing rule"
author="bob" age="6h ago" status="Review" />
            <WorklogRow title="Refactor adjudication service"
author="carol" age="1d ago" status="Merged" />
            <WorklogRow title="Improve claim cycle metrics"
author="dave" age="2d ago" status="Open" />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Team Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ team: "Platform", lead: 48, review: 6
}, { team: "ML", lead: 36, review: 8 }, { team: "Product", lead: 60,
review: 12 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="lead" name="Lead time (hrs)" fill="#2563eb" />
              <Bar dataKey="review" name="Review time (hrs)" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-5 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Tests & CI Insights</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timeSeries} margin={{ top: 10, right: 20,
left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="tests_passed"
stroke="#10b981" fillOpacity={1} fill="url(#pass)" name="Tests passed"
/>
              <Area type="monotone" dataKey="tests_failed"
stroke="#ef4444" fillOpacity={1} fill="url(#fail)" name="Tests failed"
/>
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">Avg CI queue /
wait: <strong>45s</strong></div>
            <div className="text-sm text-slate-600">Flaky tests
flagged: <strong>4</strong></div>
          </div>
        </div>

        <div className="col-span-3 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Investment Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={investment} dataKey="value" nameKey="name"
outerRadius={60} label>
                {investment.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#2563eb",
"#ef4444", "#f59e0b", "#10b981"][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-3 text-sm space-y-1">
            {investment.map((i) => (
              <div key={i.name} className="flex justify-between">
                <div className="text-slate-700">{i.name}</div>
                <div className="font-medium">{i.value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-6 text-sm text-slate-500">Mock dashboard —
data is synthetic. Connect your Swarmia, GitHub, and Datadog
integrations to populate real metrics.</footer>
    </div>
  );
}

// --- Small subcomponents ---
function Card({ icon, title, value }) {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm flex items-center gap-3">
      <div className="p-2 bg-slate-100 rounded-md">{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

function WorklogRow({ title, author, age, status }) {
  return (
    <div className="border rounded-md p-2 flex items-center justify-between">
      <div>
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-slate-500">{author} • {age}</div>
      </div>
      <div className="text-xs px-2 py-1 rounded-md bg-slate-100">{status}</div>
    </div>
  );
}