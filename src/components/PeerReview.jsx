import React from 'react';

const PRS = [
  {
    title: 'Add authentication system',
    status: 'Open',
    author: 'Tom Tran',
    repo: 'Likely-To-Pay-Model',
    updated: '2 hours ago',
    labels: ['feature'],
  },
  {
    title: 'Update header styling and responsive design',
    status: 'Closed',
    author: 'Jane Smith',
    repo: 'Value-Based Reimbursement Model',
    updated: '5 hours ago',
    labels: ['ui', 'design'],
  },
  {
    title: 'Fix API endpoint URLs',
    status: 'Open',
    author: 'John Doe',
    repo: 'FWA Detection Model',
    updated: '1 day ago',
    labels: ['bug'],
  },
];

const PeerReview = () => {
  const [tab, setTab] = React.useState('Open');
  const [search, setSearch] = React.useState('');

  const filteredPRs = PRS.filter(pr =>
    (tab === pr.status) &&
    (pr.title.toLowerCase().includes(search.toLowerCase()) ||
      pr.author.toLowerCase().includes(search.toLowerCase()) ||
      pr.repo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Peer Review Request(s)</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded font-medium shadow hover:bg-green-700">New Pull Request</button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        {['Open', 'Closed'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2 px-4 -mb-px border-b-2 font-medium text-sm focus:outline-none ${tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
          >
            {t} {t === 'Open' ? filteredPRs.length : PRS.filter(pr => pr.status === 'Closed').length}
          </button>
        ))}
      </div>

      {/* Filters/Search */}
      <div className="flex items-center mb-6 gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full text-sm"
          placeholder="Search pull requests by title, author, or repo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="px-3 py-2 bg-gray-100 border rounded text-sm">Filters</button>
      </div>

      {/* PR List */}
      <div className="space-y-4">
        {filteredPRs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No pull requests found.</div>
        ) : (
          filteredPRs.map((pr, idx) => (
            <div key={idx} className="border rounded-lg bg-white shadow-sm p-4 flex items-center justify-between hover:shadow-md">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-blue-700 text-md">{pr.title}</span>
                  {pr.labels.map(label => (
                    <span key={label} className="px-2 py-0.5 bg-gray-200 text-xs rounded text-gray-700">{label}</span>
                  ))}
                </div>
                <div className="text-xs text-gray-500">{pr.repo} • {pr.author} • Updated {pr.updated}</div>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${pr.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{pr.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PeerReview;
