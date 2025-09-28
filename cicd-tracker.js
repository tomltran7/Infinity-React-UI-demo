import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Play, RefreshCw, CheckCircle, XCircle, MessageSquare
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip }
from "recharts";

// ------------------------------
// Helpers
// ------------------------------
function getEnvVarSafe(name) {
  // Only read from window-based config; never reference `process` to avoid ReferenceError in browsers.
  if (typeof window === "undefined") return undefined;
  try {
    if (window.__DAGSTER_CONFIG__ && window.__DAGSTER_CONFIG__[name])
return window.__DAGSTER_CONFIG__[name];
  } catch (e) {}
  try {
    if (window[name]) return window[name];
  } catch (e) {}
  return undefined;
}

function makeWebsocketUrl(httpUrl) {
  // Convert HTTP(S) URL to WS(S) URL in a robust way
  if (!httpUrl) return undefined;
  try {
    const u = new URL(httpUrl, typeof window !== 'undefined' ?
window.location.href : undefined);
    if (u.protocol === 'https:') u.protocol = 'wss:';
    else if (u.protocol === 'http:') u.protocol = 'ws:';
    return u.toString();
  } catch (e) {
    // fallback simple replace
    if (httpUrl.startsWith('https://')) return
httpUrl.replace(/^https:/, 'wss:');
    if (httpUrl.startsWith('http://')) return httpUrl.replace(/^http:/, 'ws:');
    return httpUrl;
  }
}

// ------------------------------
// GraphQL queries / mutations / subscriptions
// ------------------------------
const GET_PIPELINES = `query Pipelines { pipelinesOrError { __typename
... on PipelineConnection { nodes { id name modes { name } } } } }`;
const GET_RECENT_RUNS = `query Runs($limit: Int!) { runsOrError(limit:
$limit) { __typename ... on Runs { results { id status startTime
endTime pipelineName } } } }`;
const LAUNCH_RUN = `mutation Launch($pipelineName: String!,
$retryRunId: String) { launchPipelineExecution(executionParams: {
selector: { pipelineName: $pipelineName }, parentRunId: $retryRunId })
{ __typename ... on LaunchRunSuccess { run { id } } ... on PythonError
{ message } } }`;
const GET_SCHEDULES = `query Schedules { schedulesOrError { __typename
... on Schedules { results { name cronSchedule pipelineName isStopped
} } } }`;
const TOGGLE_SCHEDULE = `mutation ToggleSchedule($name: String!,
$shouldStop: Boolean!) { toggleScheduleExecution(scheduleName: $name,
shouldStop: $shouldStop) { __typename ... on ScheduleToggleSuccess {
schedule { name isStopped } } ... on PythonError { message } } }`;
const CREATE_SCHEDULE = `mutation CreateSchedule($name: String!,
$pipelineName: String!, $cron: String!) { createSchedule(scheduleName:
$name, pipelineName: $pipelineName, cronSchedule: $cron) { __typename
... on ScheduleCreationSuccess { schedule { name } } ... on
PythonError { message } } }`;
// Typical Dagster subscription (servers differ); we'll request it as a subscription.
const SUBSCRIBE_RUN_LOGS = `subscription Logs($runId: ID!) {
pipelineRunLogs(runId: $runId) { messages { level timestamp text } }
}`;

// ------------------------------
// Mock data fallback
// ------------------------------
const MOCK_PIPELINES = [
  { id: 'p1', name: 'daily_ingest' },
  { id: 'p2', name: 'transform_users' },
  { id: 'p3', name: 'train_model' },
];
const MOCK_RUNS = [
  { id: 'r1', status: 'SUCCESS', startTime: Date.now() - 1000 * 60 *
60, endTime: Date.now() - 1000 * 60 * 30, pipelineName:
'daily_ingest', needsReview: false, reviewStatus: 'approved',
reviewer: 'alice@company.com' },
  { id: 'r2', status: 'FAILED', startTime: Date.now() - 1000 * 60 *
120, endTime: Date.now() - 1000 * 60 * 110, pipelineName:
'transform_users', needsReview: false, reviewStatus: null, reviewer:
null },
  { id: 'r3', status: 'STARTED', startTime: Date.now() - 1000 * 60 *
5, endTime: null, pipelineName: 'train_model', needsReview: true,
reviewStatus: null, reviewer: null },
];

// ------------------------------
// Component
// ------------------------------
export default function DagsterDashboard({ graphqlUrl, apiToken,
runLimit = 10, useMockIfFailed = true }) {
  // Resolve configuration (props > window config > fallback)
  const config = {
    graphqlUrl: graphqlUrl ||
getEnvVarSafe('REACT_APP_DAGSTER_GRAPHQL_URL') ||
getEnvVarSafe('DAGSTER_GRAPHQL_URL') || '/graphql',
    apiToken: apiToken || getEnvVarSafe('REACT_APP_DAGSTER_API_TOKEN')
|| getEnvVarSafe('DAGSTER_API_TOKEN') || null,
  };

  const [pipelines, setPipelines] = useState([]);
  const [runs, setRuns] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [error, setError] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterText, setFilterText] = useState('');

  // Logs + WS
  const [logs, setLogs] = useState([]);
  const logsAutoScrollRef = useRef(true);
  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Peer Review
  const [reviewFeedback, setReviewFeedback] = useState({});
  const [pendingReviews, setPendingReviews] = useState([]);

  // Basic fetch helper for POST GraphQL
  const dagsterFetch = useCallback(async (body) => {
    try {
      const res = await fetch(config.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { Authorization: `Bearer
${config.apiToken}` } : {}),
        },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (e) {
      return { error: e };
    }
  }, [config.graphqlUrl, config.apiToken]);

  const dagsterQuery = useCallback(async (query, variables = {}) => {
    const r = await dagsterFetch({ query, variables });
    if (!r) return { error: 'no-response' };
    if (r.errors) return { errors: r.errors };
    // Depending on server, r.data may be present
    return r.data || r;
  }, [dagsterFetch]);

  // Load pipelines, runs and schedules initially
  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      const [pR, rR, sR] = await Promise.allSettled([
        dagsterQuery(GET_PIPELINES),
        dagsterQuery(GET_RECENT_RUNS, { limit: runLimit }),
        dagsterQuery(GET_SCHEDULES),
      ]);

      if (!mounted) return;

      // pipelines
      if (pR.status === 'fulfilled' && pR.value &&
pR.value.pipelinesOrError && pR.value.pipelinesOrError.nodes) {
        setPipelines(pR.value.pipelinesOrError.nodes.map(n => ({ id:
n.id, name: n.name })));
      } else {
        setPipelines(useMockIfFailed ? MOCK_PIPELINES : []);
      }

      // runs
      if (rR.status === 'fulfilled' && rR.value &&
rR.value.runsOrError && rR.value.runsOrError.results) {
        setRuns(rR.value.runsOrError.results);
      } else {
        setRuns(useMockIfFailed ? MOCK_RUNS : []);
      }

      // Extract pending reviews from runs
      const pending = (useMockIfFailed ? MOCK_RUNS : []).filter(r =>
r.needsReview && !r.reviewStatus);
      setPendingReviews(pending);

      // schedules
      if (sR.status === 'fulfilled' && sR.value &&
sR.value.schedulesOrError && sR.value.schedulesOrError.results) {
        setSchedules(sR.value.schedulesOrError.results);
      } else {
        setSchedules([]);
      }

      setLoading(false);

      if ((pR.status === 'rejected' || (pR.status === 'fulfilled' &&
pR.value && (pR.value.error || pR.value.errors))) && useMockIfFailed)
{
        setError('Using mock data for pipelines.');
      }
      if ((rR.status === 'rejected' || (rR.status === 'fulfilled' &&
rR.value && (rR.value.error || rR.value.errors))) && useMockIfFailed)
{
        setError(prev => prev ? prev + ' Runs use mock.' : 'Using mock data for runs.');
      }
    }

    loadAll();
    return () => { mounted = false; };
  }, [dagsterQuery, runLimit, useMockIfFailed]);

  // Derived filtered runs
  const filteredRuns = runs.filter(r => {
    const statusMatch = filterStatus ? r.status === filterStatus : true;
    const search = (filterText || '').trim().toLowerCase();
    const textMatch = !search || (r.id &&
r.id.toLowerCase().includes(search)) || (r.pipelineName &&
r.pipelineName.toLowerCase().includes(search));
    return statusMatch && textMatch;
  });

  const chartData = filteredRuns.map(r => ({ name: r.pipelineName,
duration: r.endTime ? Math.max(0, (r.endTime - r.startTime) / 1000) :
(Date.now() - r.startTime) / 1000 }));

  // Status badge helper
  function humanStatusBadge(status) {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-fulltext-xs font-medium';
    if (status === 'SUCCESS') return <span className={`${base}
bg-green-100 text-green-800`}>Success</span>;
    if (status === 'FAILED') return <span className={`${base}
bg-red-100 text-red-800`}>Failed</span>;
    if (status === 'STARTED' || status === 'STARTING') return <span
className={`${base} bg-yellow-100 text-yellow-800`}>Running</span>;
    return <span className={`${base} bg-gray-100
text-gray-800`}>{status}</span>;
  }

  // Review status badge helper
  function reviewStatusBadge(run) {
    if (!run.needsReview) return null;
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2';
    if (run.reviewStatus === 'approved') return <span className={`${base} bg-green-100 text-green-800`}>✓ Approved</span>;
    if (run.reviewStatus === 'denied') return <span className={`${base} bg-red-100 text-red-800`}>✗ Denied</span>;
    return <span className={`${base} bg-blue-100 text-blue-800`}>⏳ Pending Review</span>;
  }

  // Handle peer review actions
  function handleReviewAction(runId, action, feedback = '') {
    const updatedRuns = runs.map(run => {
      if (run.id === runId) {
        return {
          ...run,
          reviewStatus: action,
          reviewer: 'current-user@company.com', // In real app, get from auth
          reviewFeedback: feedback,
          reviewedAt: Date.now()
        };
      }
      return run;
    });
    setRuns(updatedRuns);
    setPendingReviews(prev => prev.filter(r => r.id !== runId));
    setReviewFeedback(prev => ({ ...prev, [runId]: '' }));
    setError(`Run ${runId} ${action} successfully`);
  }

  // Launch or retry
  async function launchOrRetry(pipelineName, retryRunId = null) {
    const res = await dagsterQuery(LAUNCH_RUN, { pipelineName, retryRunId });
    if (res && res.launchPipelineExecution &&
res.launchPipelineExecution.__typename === 'LaunchRunSuccess') {
      const rr = await dagsterQuery(GET_RECENT_RUNS, { limit: runLimit });
      if (rr && rr.runsOrError && rr.runsOrError.results)
setRuns(rr.runsOrError.results);
    } else {
      setError('Failed to launch or retry run.');
    }
  }

  // Schedules toggle
  async function toggleSchedule(name, shouldStop) {
    const res = await dagsterQuery(TOGGLE_SCHEDULE, { name, shouldStop });
    if (res && res.toggleScheduleExecution &&
res.toggleScheduleExecution.__typename === 'ScheduleToggleSuccess') {
      setSchedules(prev => prev.map(s => s.name === name ? { ...s,
isStopped: res.toggleScheduleExecution.schedule.isStopped } : s));
    } else {
      setError('Failed to toggle schedule.');
    }
  }

  // Create schedule
  async function createSchedule(name, pipelineName, cron) {
    const res = await dagsterQuery(CREATE_SCHEDULE, { name,
pipelineName, cron });
    if (res && res.createSchedule && res.createSchedule.__typename ===
'ScheduleCreationSuccess') {
      setSchedules(prev => [...prev, { name, cronSchedule: cron,
pipelineName, isStopped: false }]);
    } else {
      setError('Failed to create schedule.');
    }
  }

  // ------------------ Live logs via WebSocket ------------------
  function startLogSubscription(runId) {
    stopLogSubscription();
    setLogs([]);
    if (!runId) return;

    const wsUrl = makeWebsocketUrl(config.graphqlUrl);
    if (!wsUrl) return;

    // Attempt multiple common GraphQL WS subprotocols; servers will pick one that they support.
    const protocols = ['graphql-transport-ws', 'graphql-ws'];
    try {
      const ws = new WebSocket(wsUrl, protocols);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send a connection_init which is used by both protocols
        ws.send(JSON.stringify({ type: 'connection_init', payload: {} }));

        // Send both start styles: subscription-transport-ws uses type: 'start', graphql-transport-ws uses 'subscribe'
        const startMsg = JSON.stringify({ id: '1', type: 'start',
payload: { query: SUBSCRIBE_RUN_LOGS, variables: { runId } } });
        const subscribeMsg = JSON.stringify({ id: '1', type:
'subscribe', payload: { query: SUBSCRIBE_RUN_LOGS, variables: { runId
} } });
        try { ws.send(startMsg); } catch (e) {}
        try { ws.send(subscribeMsg); } catch (e) {}
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          // graphql-transport-ws sends type: 'next' with payload { data }
          if (msg.type === 'next' && msg.payload && msg.payload.data
&& msg.payload.data.pipelineRunLogs) {
            const incoming = msg.payload.data.pipelineRunLogs.messages || [];
            setLogs(prev => [...prev, ...incoming]);
          }
          // subscription-transport-ws sends type: 'data' with payload { data }
          if (msg.type === 'data' && msg.payload && msg.payload.data
&& msg.payload.data.pipelineRunLogs) {
            const incoming = msg.payload.data.pipelineRunLogs.messages || [];
            setLogs(prev => [...prev, ...incoming]);
          }
          // errors
          if (msg.type === 'error') setError(JSON.stringify(msg.payload));
          if (msg.type === 'complete') {
            // server finished the subscription
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      ws.onerror = (e) => {
        // Use a lightweight error message; keep logging available via polling fallback
        setError('WebSocket error while subscribing to logs');
      };

      ws.onclose = () => { wsRef.current = null; };
    } catch (e) {
      // fallback to polling if WebSocket construction failed
      setError('Unable to create WebSocket; falling back to polling logs.');
      pollIntervalRef.current = setInterval(async () => {
        // Some servers expose a logs query; this is a best-effort placeholder
        try {
          await dagsterQuery(GET_RECENT_RUNS, { limit: runLimit });
        } catch (e) {}
      }, 3000);
    }
  }

  function stopLogSubscription() {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (e) {}
      wsRef.current = null;
    }
    if (pollIntervalRef.current) {
clearInterval(pollIntervalRef.current); pollIntervalRef.current =
null; }
  }

  // Subscribe when selectedRun changes
  useEffect(() => {
    if (selectedRun && selectedRun.id) startLogSubscription(selectedRun.id);
    else stopLogSubscription();
    return () => stopLogSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRun, config.graphqlUrl]);

  // Auto-scroll logs view
  useEffect(() => {
    if (!logsAutoScrollRef.current) return;
    try {
      const el = document.getElementById('run-logs-scroll');
      if (el) el.scrollTop = el.scrollHeight;
    } catch (e) {}
  }, [logs]);

  // ------------------ Render ------------------
  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dagster Orchestrator Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of repositories, pipelines, runs, schedules and logs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw size={16} className="mr-2" /> Refresh
          </Button>
          <Button>
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        <section className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <div>Loading...</div> : (
                <div className="space-y-3">
                  {pipelines.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-md hover:bg-slate-100">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">id: {p.id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => {setSelectedPipeline(p); setSelectedRun(null); }}><Play size={14} /> Select</Button>
                        <Button onClick={() => launchOrRetry(p.name)}><Play size={14} /> Run</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button onClick={() => { alert('Open sensors view (not implemented in mock)'); }}>View Sensors</Button>
                <Button onClick={() => { alert('Open workspace'); }}>Open Workspace</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {schedules.length === 0 && <div className="text-xs
text-gray-500">No schedules found.</div>}
                {schedules.map(s => (
                  <div key={s.name} className="flex items-center
justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs
text-gray-500">{s.pipelineName} • {s.cronSchedule || '—'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">{s.isStopped ?
'Paused' : 'Active'}</label>
                      <input type="checkbox" checked={!s.isStopped}
onChange={(e) => toggleSchedule(s.name, e.target.checked ? false :
true)} />
                    </div>
                  </div>
                ))}

                <div className="mt-3 p-2 border rounded">
                  <div className="text-sm font-semibold">Create Schedule</div>
                  <CreateScheduleForm pipelines={pipelines}
onCreate={createSchedule} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="col-span-6">
          <div className="flex items-center gap-3 mb-3">
            <select value={filterStatus} onChange={(e) =>
setFilterStatus(e.target.value)} className="p-2 border rounded">
              <option value="">All statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="STARTED">Running</option>
            </select>
            <input className="p-2 border rounded flex-1"
placeholder="Filter by run id or pipeline" value={filterText}
onChange={(e) => setFilterText(e.target.value)} />
            <Button onClick={() => { setFilterStatus('');
setFilterText(''); }}>Clear</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-96">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Pipeline</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Started</th>
                      <th className="p-2">Duration</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRuns.map(r => (
                      <tr key={r.id} className="border-b hover:bg-slate-50">
                        <td className="p-2">
                          <div className="flex items-center">
                            {r.pipelineName}
                            {reviewStatusBadge(r)}
                          </div>
                        </td>
                        <td className="p-2">{humanStatusBadge(r.status)}</td>
                        <td className="p-2">{r.startTime ? new
Date(r.startTime).toLocaleString() : '-'}</td>
                        <td className="p-2">{r.endTime ?
`${Math.round((r.endTime - r.startTime) / 1000)}s` : '—'}</td>
                        <td className="p-2 flex gap-2">
                          <Button size="sm" onClick={() => {
setSelectedRun(r); }}>Logs</Button>
                          <Button size="sm" onClick={() => alert(`Open
run ${r.id} in Dagit (if configured)`)}>Open</Button>
                          {r.status === 'FAILED' && <Button size="sm"
onClick={() => launchOrRetry(r.pipelineName, r.id)}>Retry</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Run Durations (seconds)</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="duration" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPipeline ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg
font-semibold">{selectedPipeline.name}</div>
                        <div className="text-sm text-gray-500">id:
{selectedPipeline.id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() =>
launchOrRetry(selectedPipeline.name)}><Play size={14} />
Launch</Button>
                        <Button onClick={() => alert('Open pipeline definition in Dagit')}>Open in Dagit</Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-md
shadow-sm">Description: <em>Not available in mock</em></div>
                      <div className="p-3 bg-white rounded-md
shadow-sm">Modes: <em>default</em></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No pipeline
selected.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                Peer Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReviews.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No pending reviews
                  </div>
                ) : (
                  pendingReviews.map(run => (
                    <div key={run.id} className="border rounded-lg p-3
bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium
text-sm">{run.pipelineName}</div>
                          <div className="text-xs text-gray-500">Run
ID: {run.id}</div>
                        </div>
                        <div className="text-xs text-blue-600">
                          {humanStatusBadge(run.status)}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-medium
text-gray-700 mb-1">
                          Review Feedback
                        </label>
                        <textarea
                          placeholder="Add your review comments..."
                          className="w-full p-2 text-xs border rounded
resize-none"
                          rows={3}
                          value={reviewFeedback[run.id] || ''}
                          onChange={(e) => setReviewFeedback(prev => ({
                            ...prev,
                            [run.id]: e.target.value
                          }))}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600
hover:bg-green-700 text-white"
                          onClick={() => handleReviewAction(run.id,
'approved', reviewFeedback[run.id])}
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-red-600
hover:bg-red-700 text-white"
                          onClick={() => handleReviewAction(run.id,
'denied', reviewFeedback[run.id])}
                        >
                          <XCircle size={14} className="mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Review History */}
              <div className="mt-6 pt-4 border-t">
                <div className="text-sm font-medium mb-3">Recent Reviews</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {runs.filter(r => r.reviewStatus).slice(0, 5).map(run => (
                    <div key={run.id} className="p-2 border rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{run.pipelineName}</span>
                        <span className={run.reviewStatus === 'approved' ? 'text-green-600' : 'text-red-600'}>
                          {run.reviewStatus === 'approved' ? '✓Approved' : '✗ Denied'}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        by {run.reviewer} • {run.reviewedAt ? new Date(run.reviewedAt).toLocaleDateString() : 'Unknown'}
                      </div>
                      {run.reviewFeedback && (
                        <div className="mt-1 p-1 bg-gray-50 rounded
text-gray-700">
                          "{run.reviewFeedback}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Live Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm">Selected run:</div>
                <div className="font-medium">{selectedRun ?
selectedRun.id : '—'}</div>
                <Button onClick={() => { setSelectedRun(null);
setLogs([]); }}>Clear</Button>
              </div>
              <div id="run-logs-scroll" style={{ maxHeight: 320,
overflow: 'auto', background: '#0f172a', color: '#e6eef8', padding: 8,
borderRadius: 6 }}>
                {logs.length === 0 && <div className="text-xs
text-gray-400">No logs yet.</div>}
                {logs.map((m, i) => (
                  <div key={i} style={{ fontFamily: 'monospace',
fontSize: 12, marginBottom: 6 }}>[{m.level || 'INFO'}] {m.timestamp ?
new Date(m.timestamp).toLocaleTimeString() : ''} — {m.text}</div>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && <div className="mt-4 p-3 bg-red-50 text-red-700
rounded-md shadow">Error: {String(error)}</div>}
        </section>
      </main>

      <footer className="mt-8 text-xs text-gray-500">Built for Dagster
• Replace mock data with live Dagster GraphQL for full
functionality</footer>
    </div>
  );
}

// ------------------ CreateScheduleForm ------------------
function CreateScheduleForm({ pipelines, onCreate }) {
  const [name, setName] = useState('');
  const [cron, setCron] = useState('0 0 * * *');
  const [pipeline, setPipeline] = useState(pipelines && pipelines[0] ?
pipelines[0].name : '');

  useEffect(() => {
    if (pipelines && pipelines[0]) setPipeline(pipelines[0].name);
  }, [pipelines]);

  return (
    <div className="space-y-2">
      <input placeholder="Schedule name" className="w-full p-2 border
rounded" value={name} onChange={(e) => setName(e.target.value)} />
      <select className="w-full p-2 border rounded" value={pipeline}
onChange={(e) => setPipeline(e.target.value)}>
        {pipelines.map(p => <option key={p.id}
value={p.name}>{p.name}</option>)}
      </select>
      <input placeholder="Cron (e.g. 0 0 * * *)" className="w-full p-2
border rounded" value={cron} onChange={(e) => setCron(e.target.value)}
/>
      <div className="flex justify-end">
        <Button onClick={() => { if (!name || !pipeline || !cron)
return alert('Please fill all fields'); onCreate(name, pipeline,
cron); setName(''); }}>
          Create
        </Button>
      </div>
    </div>
  );
}