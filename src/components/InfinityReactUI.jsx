import React, { useState } from 'react';

// Stub Decision Table IDE
const DATATYPES = ['String', 'Number', 'Boolean', 'Date'];
const CONDITIONS = ['Equals', 'Greater Than', 'Less Than', 'Contains'];

const DecisionTableIDE = () => {
  // Decision Table state
  const [title, setTitle] = useState('Healthcare Claims Workflow');
  const [columns, setColumns] = useState([
    { name: 'Patient Age', type: 'Number', condition: 'Greater Than' },
    { name: 'Claim Amount', type: 'Number', condition: 'Greater Than' },
    { name: 'Diagnosis Code', type: 'String', condition: 'Equals' },
    { name: 'Provider Type', type: 'String', condition: 'Equals' },
    { name: 'Approval Status', type: 'String', condition: 'Equals' }
  ]);
  const [rows, setRows] = useState([
    [65, 1200, 'E11.9', 'Hospital', 'Approved'],
    [34, 350, 'J45.909', 'Clinic', 'Denied'],
    [50, 800, 'I10', 'Hospital', 'Pending'],
    [72, 2200, 'E78.5', 'Specialist', 'Approved'],
    [29, 150, 'M54.5', 'Clinic', 'Denied']
  ]);
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const inputRefs = React.useRef([]);

  // Save work in progress to localStorage
  const saveTable = () => {
    const tableData = {
      title,
      columns,
      rows
    };
    localStorage.setItem('decisionTableWIP', JSON.stringify(tableData));
    alert('Work in progress saved!');
  };

  // Add/remove/update logic
  const addColumn = () => {
    setColumns([...columns, { name: `Condition ${columns.length + 1}`, type: 'String', condition: 'Equals' }]);
    setRows(rows.map(row => [...row, '']));
  };
  const removeColumn = (colIdx) => {
    setColumns(columns.filter((_, idx) => idx !== colIdx));
    setRows(rows.map(row => row.filter((_, idx) => idx !== colIdx)));
  };
  const addRow = () => {
    setRows([...rows, columns.map(() => '')]);
  };
  const removeRow = (rowIdx) => {
    setRows(rows.filter((_, idx) => idx !== rowIdx));
  };
  const updateCell = (rowIdx, colIdx, value) => {
    const newRows = rows.map((row, r) =>
      r === rowIdx ? row.map((cell, c) => (c === colIdx ? value : cell)) : row
    );
    setRows(newRows);
  };
  const handleCellKeyDown = (e, rowIdx, colIdx) => {
    let nextRow = rowIdx;
    let nextCol = colIdx;
    if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
      nextCol = colIdx + 1 < columns.length ? colIdx + 1 : colIdx;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
      nextCol = colIdx - 1 >= 0 ? colIdx - 1 : colIdx;
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      nextRow = rowIdx + 1 < rows.length ? rowIdx + 1 : rowIdx;
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      nextRow = rowIdx - 1 >= 0 ? rowIdx - 1 : rowIdx;
      e.preventDefault();
    }
    setSelectedCell({ row: nextRow, col: nextCol });
    setTimeout(() => {
      if (inputRefs.current[nextRow] && inputRefs.current[nextRow][nextCol]) {
        inputRefs.current[nextRow][nextCol].focus();
      }
    }, 0);
  };
  const updateColumn = (colIdx, field, value) => {
    const newCols = columns.map((col, idx) =>
      idx === colIdx ? { ...col, [field]: value } : col
    );
    setColumns(newCols);
  };

  // Enhanced test suite state
  // Identify input columns and output column
  const inputColumns = columns.slice(0, columns.length - 1);
  const outputColumn = columns[columns.length - 1]?.name || 'Approval Status';

  // Test cases: each has values for each input column and expected output
  const [testCases, setTestCases] = useState([
    { inputs: inputColumns.map(() => ''), expected: '', result: null, status: null }
  ]);
  const [suiteRun, setSuiteRun] = useState(false);

  // Run all test cases
  const runTestSuite = () => {
    const updated = testCases.map(tc => {
      // Find row that matches all input columns
      const matchRow = rows.find(row =>
        inputColumns.every((col, idx) => String(row[idx]) === tc.inputs[idx])
      );
      const actualOutput = matchRow ? matchRow[columns.length - 1] : 'No match found';
      const pass = tc.expected !== '' ? actualOutput === tc.expected : null;
      return { ...tc, result: actualOutput, status: pass === null ? null : pass ? 'pass' : 'fail' };
    });
    setTestCases(updated);
    setSuiteRun(true);
  };

  // Add new test case
  const addTestCase = () => {
    setTestCases([...testCases, { inputs: inputColumns.map(() => ''), expected: '', result: null, status: null }]);
  };

  // Update test case
  const updateTestCase = (idx, field, value, inputIdx) => {
    setTestCases(testCases.map((tc, i) => {
      if (i !== idx) return tc;
      if (field === 'inputs') {
        const newInputs = [...tc.inputs];
        newInputs[inputIdx] = value;
        return { ...tc, inputs: newInputs };
      }
      return { ...tc, [field]: value };
    }));
  };

  // Remove test case
  const removeTestCase = (idx) => {
    setTestCases(testCases.filter((_, i) => i !== idx));
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Decision Table IDE</h2>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded font-medium shadow hover:bg-green-700"
                onClick={saveTable}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded font-medium shadow hover:bg-purple-700 flex items-center gap-2"
                // TODO: Add submit handler
              >
                <GitPullRequest className="w-5 h-5 text-white" />
                Submit for Peer Review
              </button>
            </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Decision Table Title</label>
          <input
            className="w-full border rounded px-2 py-1 text-md"
            type="text"
            placeholder="Enter table title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <p className="text-gray-600 mb-4">Create and edit workflows for models using a decision table interface.</p>
        <div className="mb-2 flex gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={addRow}>Add Row</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={addColumn}>Add Column</button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100 w-10 text-center">#</th>
                {columns.map((col, colIdx) => (
                  <th key={colIdx} className="border p-2 bg-gray-100">
                    <input
                      className="w-24 border rounded px-1 mb-1"
                      value={col.name}
                      onChange={e => updateColumn(colIdx, 'name', e.target.value)}
                    />
                    <div className="flex gap-1 mt-1">
                      <select
                        className="border rounded px-1"
                        value={col.type}
                        onChange={e => updateColumn(colIdx, 'type', e.target.value)}
                      >
                        {DATATYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                      <select
                        className="border rounded px-1"
                        value={col.condition}
                        onChange={e => updateColumn(colIdx, 'condition', e.target.value)}
                      >
                        {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                      </select>
                    </div>
                    <button className="mt-1 text-xs text-red-500" onClick={() => removeColumn(colIdx)}>Remove</button>
                  </th>
                ))}
                <th className="border p-2 bg-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="border p-2 text-center bg-gray-50 font-semibold">{rowIdx + 1}</td>
                  {row.map((cell, colIdx) => (
                    <td key={colIdx} className={`border p-2 ${selectedCell.row === rowIdx && selectedCell.col === colIdx ? 'bg-blue-100 ring-2 ring-blue-400' : ''}`}
                        onClick={() => {
                          setSelectedCell({ row: rowIdx, col: colIdx });
                          setTimeout(() => {
                            if (inputRefs.current[rowIdx] && inputRefs.current[rowIdx][colIdx]) {
                              inputRefs.current[rowIdx][colIdx].focus();
                            }
                          }, 0);
                        }}>
                      <input
                        ref={el => {
                          if (!inputRefs.current[rowIdx]) inputRefs.current[rowIdx] = [];
                          inputRefs.current[rowIdx][colIdx] = el;
                        }}
                        className="w-full border rounded px-1 bg-transparent focus:bg-white"
                        value={cell}
                        onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
                        onKeyDown={e => handleCellKeyDown(e, rowIdx, colIdx)}
                        onFocus={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                      />
                    </td>
                  ))}
                  <td className="border p-2">
                    <button className="text-xs text-red-500" onClick={() => removeRow(rowIdx)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Enhanced Testing Area */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-md font-semibold mb-2">Decision Table Test Suite</h3>
          <div className="mb-4">
            <button className="px-3 py-1 bg-green-600 text-white rounded mr-2" onClick={addTestCase}>Add Test Case</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={runTestSuite}>Run All Tests</button>
          </div>
          <table className="min-w-full border text-sm mb-4">
            <thead>
              <tr>
                {inputColumns.map((col, i) => (
                  <th key={col.name} className="border p-2 bg-gray-100">{col.name}</th>
                ))}
                <th className="border p-2 bg-gray-100">Expected {outputColumn}</th>
                <th className="border p-2 bg-gray-100">Actual {outputColumn}</th>
                <th className="border p-2 bg-gray-100">Status</th>
                <th className="border p-2 bg-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc, idx) => (
                <tr key={idx}>
                  {inputColumns.map((col, inputIdx) => (
                    <td key={col.name} className="border p-2">
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-full"
                        value={tc.inputs[inputIdx]}
                        onChange={e => updateTestCase(idx, 'inputs', e.target.value, inputIdx)}
                        placeholder={col.name}
                      />
                    </td>
                  ))}
                  <td className="border p-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-full"
                      value={tc.expected}
                      onChange={e => updateTestCase(idx, 'expected', e.target.value)}
                      placeholder={`Expected ${outputColumn}`}
                    />
                  </td>
                  <td className="border p-2">
                    {suiteRun ? tc.result : <span className="text-gray-400">(run to see)</span>}
                  </td>
                  <td className="border p-2">
                    {suiteRun && tc.status === 'pass' && <span className="text-green-600 font-semibold">Pass</span>}
                    {suiteRun && tc.status === 'fail' && <span className="text-red-600 font-semibold">Fail</span>}
                    {suiteRun && tc.status === null && <span className="text-gray-400">N/A</span>}
                  </td>
                  <td className="border p-2">
                    <button className="text-xs text-red-500" onClick={() => removeTestCase(idx)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {suiteRun && (
            <div className="bg-gray-100 p-2 rounded text-sm">
              <strong>Summary:</strong> {testCases.filter(tc => tc.status === 'pass').length} passed, {testCases.filter(tc => tc.status === 'fail').length} failed, {testCases.length} total
            </div>
          )}
        </div>
      </div>
    );
};

// Stub DMN IDE
const DMNIDE = () => (
  <div className="border rounded-lg p-6 bg-gray-50">
    <h2 className="text-lg font-semibold mb-2">Decision Model Notation (DMN) IDE</h2>
    <p className="text-gray-600 mb-4">Edit workflows using DMN notation for advanced modeling.</p>
    {/* Add your DMN editor UI here */}
    <div className="h-40 flex items-center justify-center text-gray-400">[DMN Editor Placeholder]</div>
  </div>
);
import InfinityIcon from '../assets/infinity.svg';
import { 
  ChevronDown, Plus, RefreshCw, GitBranch, GitCommit, Clock, 
  FileText, FolderOpen, Settings, User, Search, X, AlertCircle, 
  GitPullRequest, Download, Upload 
} from 'lucide-react';

const InfinityReactUI = () => {
  const [activeTab, setActiveTab] = useState('changes');
  const [selectedRepo, setSelectedRepo] = useState('Likely-To-Pay-Model');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  // Editor mode: 'table' for Decision Table IDE, 'dmn' for DMN IDE
  const [editorMode, setEditorMode] = useState('table');

  const changedFiles = [
    { name: 'Claims Processing Automation Model', status: 'modified', additions: 12, deletions: 3 },
    { name: 'Value-Based Reimbursement Model', status: 'modified', additions: 8, deletions: 2 },
    { name: 'FWA Detection Model', status: 'modified', additions: 1, deletions: 0 },
    { name: 'Provider Markets Optimizer Model', status: 'added', additions: 45, deletions: 0 }
  ];

  const commitHistory = [
    { hash: 'a1b2c3d', message: 'Add authentication system', author: 'Tom Tran', time: '2 hours ago', branch: 'main' },
    { hash: 'e4f5g6h', message: 'Update header styling and responsive design', author: 'Jane Smith', time: '5 hours ago', branch: 'main' },
    { hash: 'i7j8k9l', message: 'Fix API endpoint URLs', author: 'John Doe', time: '1 day ago', branch: 'main' },
    { hash: 'm0n1o2p', message: 'Initial project setup', author: 'Jane Smith', time: '3 days ago', branch: 'main' }
  ];
  const commitEditor = [
    { hash: 'a1b2c3d', message: 'Add authentication system', author: 'Test 1', time: '2 hours ago', branch: 'main' },
    { hash: 'e4f5g6h', message: 'Update header styling and responsive design', author: 'Test 2', time: '5 hours ago', branch: 'main' },
    { hash: 'i7j8k9l', message: 'Fix API endpoint URLs', author: 'Test 3', time: '1 day ago', branch: 'main' },
    { hash: 'm0n1o2p', message: 'Initial project setup', author: 'Test 4', time: '3 days ago', branch: 'main' }
  ];

  const getStatusIcon = (status) => {
    const iconClass = 'w-3 h-3';
    switch(status) {
      case 'modified': return <AlertCircle className={`${iconClass} text-yellow-500`} />;
      case 'added': return <Plus className={`${iconClass} text-green-500`} />;
      case 'deleted': return <X className={`${iconClass} text-red-500`} />;
      default: return <FileText className={`${iconClass} text-gray-400`} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans">
      {/* Title Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
        {/* Removed window control dots */}
          </div>
          <span className="flex items-center space-x-2">
            <img src={InfinityIcon} alt="Infinity Icon" className="w-5 h-5" />
            <h1 className="text-sm font-medium text-gray-800">Infinity Business Rule Editor</h1>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-600 hover:text-gray-800 cursor-pointer" />
          <User className="w-4 h-4 text-gray-600 hover:text-gray-800 cursor-pointer" />
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
          {/* Repository Selector */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Current Repository
              </span>
              <Plus className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
            <button className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-800 truncate">{selectedRepo}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Branch Selector */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Current Branch
              </span>
              <GitBranch className="w-4 h-4 text-gray-400" />
            </div>
            <button className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-800">{currentBranch}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Actions */}
          <div className="p-3 space-y-2">
            <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-200 rounded-md">
              <Download className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Fetch origin</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-200 rounded-md">
              <GitPullRequest className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Create pull request</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-200 rounded-md">
              <RefreshCw className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">View on Bitbucket</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('changes')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  activeTab === 'changes' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Changes ({changedFiles.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                History
              </button>
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    activeTab === 'editor' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Editor
                </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter files"
                className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {activeTab === 'changes' && (
            <div className="flex-1 flex">
              {/* File List */}
              <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col">
                <div className="p-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">Changed rules</h3>
                  <div className="space-y-1">
                    {changedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                        {getStatusIcon(file.status)}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{file.name}</div>
                          <div className="text-xs text-gray-500">+{file.additions} -{file.deletions}</div>
                        </div>
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commit Section */}
                <div className="border-t border-gray-200 p-4">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Summary (required)"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Description"
                      value={commitDescription}
                      onChange={(e) => setCommitDescription(e.target.value)}
                      rows="3"
                      className="w-full mt-2 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>
                  <button
                    disabled={!commitMessage.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md text-sm font-medium"
                  >
                    Commit to {currentBranch}
                  </button>
                  <div className="flex justify-between mt-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">Push origin</button>
                    <button className="text-sm text-gray-600 hover:text-gray-800">Undo</button>
                  </div>
                </div>
              </div>

              {/* Diff View */}
              <div className="flex-1 bg-gray-50 p-4">
                <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-800">Claims Processing Automation Model</h4>
                  </div>
                  <div className="p-4 font-mono text-sm flex-1 overflow-auto">
                    <div className="space-y-1">
                      <div className="flex">
                        <div className="w-8 text-gray-400 text-right pr-2">1</div>
                        <div className="text-gray-700">import React from 'react';</div>
                      </div>
                      <div className="flex">
                        <div className="w-8 text-gray-400 text-right pr-2">2</div>
                        <div className="text-gray-700">import {"{ useState }"} from 'react';</div>
                      </div>
                      <div className="flex bg-red-50">
                        <div className="w-8 text-red-600 text-right pr-2">-</div>
                        <div className="text-red-800">const Header = () =&gt; {"{"}</div>
                      </div>
                      <div className="flex bg-green-50">
                        <div className="w-8 text-green-600 text-right pr-2">+</div>
                        <div className="text-green-800">const Header = ({"{ user, onLogout }"}) =&gt; {"{"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'history' && (
            // History View
            <div className="flex-1 bg-white overflow-auto">
              <div className="p-4">
                <div className="space-y-3">
                  {commitHistory.map((commit, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <GitCommit className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">{commit.message}</span>
                          <span className="text-xs text-gray-500 font-mono">{commit.hash}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{commit.author}</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{commit.time}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <GitBranch className="w-3 h-3" />
                            <span>{commit.branch}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'editor' && (
            <div className="flex-1 bg-white overflow-auto">
              <div className="p-4">
                {/* Toggle between Decision Table and DMN IDE */}
                <div className="mb-4 flex gap-2 justify-end">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium border ${editorMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
                    onClick={() => setEditorMode('table')}
                  >
                    Decision Table IDE
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium border ${editorMode === 'dmn' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
                    onClick={() => setEditorMode('dmn')}
                  >
                    DMN IDE
                  </button>
                </div>
                {/* Render selected IDE */}
                {editorMode === 'table' ? <DecisionTableIDE /> : <DMNIDE />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-blue-600 text-white px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Upload className="w-3 h-3" />
            <span>Push 2 commits to origin/main</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Last fetch: 2 minutes ago</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfinityReactUI;