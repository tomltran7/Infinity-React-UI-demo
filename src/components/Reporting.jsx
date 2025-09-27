import React from 'react';

const REPORTS = [
  {
    title: 'Weekly PR Summary',
    status: 'Completed',
    author: 'Tom Tran',
    repo: 'Likely-To-Pay-Model',
    updated: '2 hours ago',
    labels: ['summary'],
  },
  {
    title: 'Open PRs by Author',
    status: 'In Progress',
    author: 'Jane Smith',
    repo: 'Value-Based Reimbursement Model',
    updated: '5 hours ago',
    labels: ['analytics'],
  },
  {
    title: 'PR Review Time Analysis',
    status: 'Completed',
    author: 'John Doe',
    repo: 'FWA Detection Model',
    updated: '1 day ago',
    labels: ['metrics'],
  },
];

// GitHub-like contribution calendar chart
function generateCalendarData(weeks = 20) {
  // 20 weeks x 7 days
  return Array.from({ length: weeks * 7 }, () => Math.floor(Math.random() * 5));
}

const ContributionCalendar = () => {
  const data = generateCalendarData();
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  const colors = ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"];

  // Generate month labels for the top of the chart
  const today = new Date();
  const monthLabels = [];
  for (let w = 0; w < weeks.length; w++) {
    // Get the first day of each week
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (weeks.length - w - 1) * 7);
    const month = weekStart.toLocaleString('default', { month: 'short' });
    // Only show label if it's the first week of a month or the first week
    if (w === 0 || month !== monthLabels[monthLabels.length - 1]) {
      monthLabels.push(month);
    } else {
      monthLabels.push('');
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-md font-semibold mb-2">Contribution Calendar</h2>
      {/* Month labels */}
      <div className="flex gap-1 mb-1 ml-1">
        {monthLabels.map((label, idx) => (
          <div key={idx} style={{ width: 14 }} className="text-xs text-gray-500 text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((val, di) => (
              <div
                key={di}
                title={`Contributions: ${val}`}
                style={{ width: 14, height: 14, background: colors[val], borderRadius: 2 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">Last 20 weeks</div>
    </div>
  );
};

const Reporting = () => {
  const [tab, setTab] = React.useState('Completed');
  const [search, setSearch] = React.useState('');

  const filteredReports = REPORTS.filter(report =>
    (tab === report.status) &&
    (report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.author.toLowerCase().includes(search.toLowerCase()) ||
      report.repo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reporting</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium shadow hover:bg-blue-700">New Report</button>
      </div>

      {/* Activity Overview Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Activity Overview</h2>
        <div className="flex gap-8">
          <div>
            <div className="text-2xl font-bold text-green-700">128</div>
            <div className="text-xs text-gray-500">Total PRs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-700">34</div>
            <div className="text-xs text-gray-500">Open PRs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-700">12</div>
            <div className="text-xs text-gray-500">In Review</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">82</div>
            <div className="text-xs text-gray-500">Closed PRs</div>
          </div>
        </div>
      </div>



      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        {['Completed', 'In Progress'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2 px-4 -mb-px border-b-2 font-medium text-sm focus:outline-none ${tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
          >
            {t} {t === 'Completed' ? filteredReports.length : REPORTS.filter(report => report.status === 'In Progress').length}
          </button>
        ))}
      </div>

      {/* Filters/Search */}
      <div className="flex items-center mb-6 gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full text-sm"
          placeholder="Search reports by title, author, or repo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="px-3 py-2 bg-gray-100 border rounded text-sm">Filters</button>
      </div>

      {/* Report List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No reports found.</div>
        ) : (
          filteredReports.map((report, idx) => (
            <div key={idx} className="border rounded-lg bg-white shadow-sm p-4 flex items-center justify-between hover:shadow-md">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-blue-700 text-md">{report.title}</span>
                  {report.labels.map(label => (
                    <span key={label} className="px-2 py-0.5 bg-gray-200 text-xs rounded text-gray-700">{label}</span>
                  ))}
                </div>
                <div className="text-xs text-gray-500">{report.repo} • {report.author} • Updated {report.updated}</div>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${report.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{report.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reporting;
