import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  Plus,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Star,
  Eye,
  GitFork,
  FileText,
  FolderOpen,
  Circle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Settings,
  Home,
  Code2,
  Activity
} from 'lucide-react';

// Mock data for different repositories
const repositories = {
  'web-application': {
    name: 'web-application',
    description: 'Modern React web application with TypeScript',
    language: 'TypeScript',
    stars: 245,
    forks: 89,
    watching: 12,
    isPrivate: false,
    lastCommit: '2 hours ago',
    commits: [
      {
        id: '1a2b3c4',
        message: 'Add user authentication system',
        author: 'john-doe',
        time: '2 hours ago',
        branch: 'main'
      },
      {
        id: '5d6e7f8',
        message: 'Update styling for responsive design',
        author: 'jane-smith',
        time: '5 hours ago',
        branch: 'main'
      },
      {
        id: '9g0h1i2',
        message: 'Fix API endpoint configuration',
        author: 'bob-wilson',
        time: '1 day ago',
        branch: 'develop'
      }
    ],
    pullRequests: [
      {
        id: 1,
        title: 'Feature: Add dark mode toggle',
        author: 'alice-cooper',
        status: 'open',
        branch: 'feature/dark-mode',
        created: '3 hours ago',
        comments: 5
      },
      {
        id: 2,
        title: 'Fix: Resolve mobile navigation issues',
        author: 'charlie-brown',
        status: 'merged',
        branch: 'fix/mobile-nav',
        created: '1 day ago',
        comments: 8
      }
    ],
    files: [
      { name: 'src/components/Auth.tsx', type: 'file', modified: true },
      { name: 'src/styles/globals.css', type: 'file', modified: true },
      { name: 'public', type: 'folder', modified: false },
      { name: 'README.md', type: 'file', modified: false }
    ]
  },
  'api-server': {
    name: 'api-server',
    description: 'RESTful API server built with Node.js and Express',
    language: 'JavaScript',
    stars: 156,
    forks: 34,
    watching: 8,
    isPrivate: true,
    lastCommit: '6 hours ago',
    commits: [
      {
        id: '3c4d5e6',
        message: 'Implement rate limiting middleware',
        author: 'sarah-jones',
        time: '6 hours ago',
        branch: 'main'
      },
      {
        id: '7f8g9h0',
        message: 'Add database connection pooling',
        author: 'mike-davis',
        time: '12 hours ago',
        branch: 'main'
      },
      {
        id: '1i2j3k4',
        message: 'Update API documentation',
        author: 'lisa-white',
        time: '2 days ago',
        branch: 'docs'
      }
    ],
    pullRequests: [
      {
        id: 3,
        title: 'Add GraphQL endpoint support',
        author: 'tom-garcia',
        status: 'open',
        branch: 'feature/graphql',
        created: '5 hours ago',
        comments: 12
      },
      {
        id: 4,
        title: 'Security: Update dependencies',
        author: 'emma-taylor',
        status: 'review',
        branch: 'security/deps-update',
        created: '8 hours ago',
        comments: 3
      }
    ],
    files: [
      { name: 'src/middleware/rateLimiter.js', type: 'file', modified: true },
      { name: 'src/config/database.js', type: 'file', modified: true },
      { name: 'docs/api.md', type: 'file', modified: true },
      { name: 'package.json', type: 'file', modified: false }
    ]
  },
  'mobile-app': {
    name: 'mobile-app',
    description: 'Cross-platform mobile application using React Native',
    language: 'JavaScript',
    stars: 89,
    forks: 23,
    watching: 15,
    isPrivate: false,
    lastCommit: '1 day ago',
    commits: [
      {
        id: '5l6m7n8',
        message: 'Add push notification support',
        author: 'david-lee',
        time: '1 day ago',
        branch: 'main'
      },
      {
        id: '9o0p1q2',
        message: 'Optimize image loading performance',
        author: 'rachel-green',
        time: '2 days ago',
        branch: 'main'
      },
      {
        id: '3r4s5t6',
        message: 'Update navigation library',
        author: 'kevin-brown',
        time: '3 days ago',
        branch: 'update/navigation'
      }
    ],
    pullRequests: [
      {
        id: 5,
        title: 'Feature: Offline data synchronization',
        author: 'monica-clark',
        status: 'draft',
        branch: 'feature/offline-sync',
        created: '2 days ago',
        comments: 2
      }
    ],
    files: [
      { name: 'src/services/notifications.js', type: 'file', modified: true },
      { name: 'src/components/ImageLoader.js', type: 'file', modified: true },
      { name: 'android', type: 'folder', modified: false },
      { name: 'ios', type: 'folder', modified: false }
    ]
  },
  'data-analytics': {
    name: 'data-analytics',
    description: 'Python-based data analytics and visualization platform',
    language: 'Python',
    stars: 312,
    forks: 67,
    watching: 25,
    isPrivate: true,
    lastCommit: '4 hours ago',
    commits: [
      {
        id: '7u8v9w0',
        message: 'Add machine learning model training pipeline',
        author: 'alan-turing',
        time: '4 hours ago',
        branch: 'main'
      },
      {
        id: '1x2y3z4',
        message: 'Implement data preprocessing utilities',
        author: 'ada-lovelace',
        time: '8 hours ago',
        branch: 'main'
      },
      {
        id: '5a6b7c8',
        message: 'Create interactive dashboard components',
        author: 'grace-hopper',
        time: '1 day ago',
        branch: 'feature/dashboard'
      }
    ],
    pullRequests: [
      {
        id: 6,
        title: 'Enhancement: Real-time data streaming',
        author: 'marie-curie',
        status: 'open',
        branch: 'feature/real-time',
        created: '6 hours ago',
        comments: 15
      },
      {
        id: 7,
        title: 'Fix: Memory optimization for large datasets',
        author: 'katherine-johnson',
        status: 'review',
        branch: 'fix/memory-optimization',
        created: '10 hours ago',
        comments: 7
      }
    ],
    files: [
      { name: 'src/ml/training_pipeline.py', type: 'file', modified: true },
      { name: 'src/preprocessing/utils.py', type: 'file', modified: true },
      { name: 'dashboard/components', type: 'folder', modified: true },
      { name: 'requirements.txt', type: 'file', modified: false }
    ]
  }
};

const GitHubUI = () => {
  const [selectedRepo, setSelectedRepo] = useState('web-application');
  const [activeTab, setActiveTab] = useState('code');
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentRepo = repositories[selectedRepo];
  const repoNames = Object.keys(repositories);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (repoDropdownOpen && !event.target.closest('.repo-dropdown')) {
        setRepoDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [repoDropdownOpen]);

  const handleRepoChange = (repoName) => {
    setSelectedRepo(repoName);
    setRepoDropdownOpen(false);
    setActiveTab('code'); // Reset to code tab when switching repos
  };

  const getLanguageColor = (language) => {
    const colors = {
      TypeScript: 'bg-blue-500',
      JavaScript: 'bg-yellow-500',
      Python: 'bg-green-500',
      Java: 'bg-red-500',
      Go: 'bg-cyan-500'
    };
    return colors[language] || 'bg-gray-500';
  };

  const getPullRequestStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Circle className="w-4 h-4 text-green-500" />;
      case 'merged':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'draft':
        return <Circle className="w-4 h-4 text-gray-400" />;
      case 'review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredRepos = repoNames.filter(repo =>
    repo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-black rounded-full flex
items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor"
viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0
10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483
0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608
1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088
2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951
0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27
2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337
1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7
1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566
4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0
.268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10
0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-lg">GitHub Clone</h1>
              <p className="text-sm text-gray-600">Repository Manager</p>
            </div>
          </div>

          {/* Repository Selector */}
          <div className="repo-dropdown relative">
            <label className="block text-xs font-medium text-gray-500
uppercase tracking-wide mb-2">
              Repository
            </label>
            <button
              onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
              className="w-full flex items-center justify-between p-3
bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100
transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FolderOpen className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="font-medium
text-gray-900">{currentRepo.name}</div>
                  <div className="text-xs text-gray-500
truncate">{currentRepo.description}</div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400
transition-transform ${repoDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {repoDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1
bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80
overflow-auto">
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute
left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border
border-gray-200 rounded-md focus:outline-none focus:ring-2
focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="py-1">
                  {filteredRepos.map((repoName) => {
                    const repo = repositories[repoName];
                    return (
                      <button
                        key={repoName}
                        onClick={() => handleRepoChange(repoName)}
                        className={`w-full text-left px-4 py-3
hover:bg-gray-50 flex items-center space-x-3 ${
                          repoName === selectedRepo ? 'bg-blue-50
border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <FolderOpen className="w-4 h-4 text-gray-500
flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium
text-gray-900">{repo.name}</span>
                            {repo.isPrivate && (
                              <span className="text-xs bg-gray-100
text-gray-600 px-2 py-0.5 rounded">Private</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500
truncate">{repo.description}</div>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full
${getLanguageColor(repo.language)}`}></div>
                              <span className="text-xs
text-gray-600">{repo.language}</span>
                            </span>
                            <span className="flex items-center
space-x-1 text-xs text-gray-500">
                              <Star className="w-3 h-3" />
                              <span>{repo.stars}</span>
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Repository Stats */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Repository Stats</h3>
            {currentRepo.isPrivate && (
              <span className="text-xs bg-yellow-100 text-yellow-800
px-2 py-1 rounded-full">Private</span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Stars</span>
              </div>
              <span className="text-sm font-medium">{currentRepo.stars}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitFork className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Forks</span>
              </div>
              <span className="text-sm font-medium">{currentRepo.forks}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Watching</span>
              </div>
              <span className="text-sm
font-medium">{currentRepo.watching}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full
${getLanguageColor(currentRepo.language)}`}></div>
              <span className="text-sm
text-gray-700">{currentRepo.language}</span>
              <span className="text-xs text-gray-500">• Last commit
{currentRepo.lastCommit}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('code')}
              className={`w-full flex items-center space-x-3 px-3 py-2
rounded-md text-sm font-medium ${
                activeTab === 'code'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Code</span>
            </button>

            <button
              onClick={() => setActiveTab('commits')}
              className={`w-full flex items-center space-x-3 px-3 py-2
rounded-md text-sm font-medium ${
                activeTab === 'commits'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>Commits</span>
              <span className="ml-auto text-xs bg-gray-200
text-gray-700 px-2 py-1 rounded-full">
                {currentRepo.commits.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pulls')}
              className={`w-full flex items-center space-x-3 px-3 py-2
rounded-md text-sm font-medium ${
                activeTab === 'pulls'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <GitPullRequest className="w-4 h-4" />
              <span>Pull Requests</span>
              <span className="ml-auto text-xs bg-gray-200
text-gray-700 px-2 py-1 rounded-full">
                {currentRepo.pullRequests.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-gray-500" />
                <h1 className="text-xl font-semibold
text-gray-900">{currentRepo.name}</h1>
                {currentRepo.isPrivate && (
                  <span className="text-xs bg-yellow-100
text-yellow-800 px-2 py-1 rounded-full">Private</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 py-2
text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                <Eye className="w-4 h-4" />
                <span>Watch</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2
text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                <Star className="w-4 h-4" />
                <span>Star</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2
text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                <GitFork className="w-4 h-4" />
                <span>Fork</span>
              </button>
            </div>
          </div>

          <p className="mt-2 text-gray-600">{currentRepo.description}</p>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white">
          {activeTab === 'code' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Files</h2>
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">main</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg
overflow-hidden">
                {currentRepo.files.map((file, index) => (
                  <div key={index} className={`flex items-center
justify-between px-4 py-3 hover:bg-gray-50 ${index !==
currentRepo.files.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex items-center space-x-3">
                      {file.type === 'folder' ? (
                        <FolderOpen className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-500" />
                      )}
                      <span className={`text-sm ${file.modified ?
'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {file.name}
                      </span>
                      {file.modified && (
                        <span className="text-xs bg-yellow-100
text-yellow-800 px-2 py-1 rounded-full">Modified</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">Last
commit 2 hours ago</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'commits' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900
mb-4">Recent Commits</h2>

              <div className="space-y-4">
                {currentRepo.commits.map((commit, index) => (
                  <div key={commit.id} className="flex items-start
space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-gray-100 rounded-full
flex items-center justify-center flex-shrink-0">
                      <GitCommit className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium
text-gray-900">{commit.message}</span>
                        <span className="text-xs text-gray-500
font-mono">{commit.id}</span>
                      </div>
                      <div className="flex items-center space-x-4
text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{commit.author}</span>
                        </span>
                        <span>{commit.time}</span>
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
          )}

          {activeTab === 'pulls' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Pull
Requests</h2>
                <button className="flex items-center space-x-2 px-4
py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                  <Plus className="w-4 h-4" />
                  <span>New Pull Request</span>
                </button>
              </div>

              <div className="space-y-3">
                {currentRepo.pullRequests.map((pr) => (
                  <div key={pr.id} className="flex items-center
space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    {getPullRequestStatusIcon(pr.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium
text-gray-900">{pr.title}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          pr.status === 'open' ? 'bg-green-100 text-green-800' :
                          pr.status === 'merged' ? 'bg-purple-100
text-purple-800' :
                          pr.status === 'review' ? 'bg-yellow-100
text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pr.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4
text-sm text-gray-600">
                        <span>#{pr.id}</span>
                        <span>by {pr.author}</span>
                        <span>{pr.created}</span>
                        <span>{pr.comments} comments</span>
                        <span className="flex items-center space-x-1">
                          <GitBranch className="w-3 h-3" />
                          <span>{pr.branch}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubUI;