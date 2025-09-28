import React from "react";
import { GitPullRequest, Users, Clock } from "lucide-react";

const peerReviewData = [
  { reviewer: "alice", prsReviewed: 12, avgReviewTime: "6h", lastReview: "2h ago" },
  { reviewer: "bob", prsReviewed: 9, avgReviewTime: "8h", lastReview: "5h ago" },
  { reviewer: "carol", prsReviewed: 15, avgReviewTime: "5h", lastReview: "1d ago" },
  { reviewer: "dave", prsReviewed: 7, avgReviewTime: "10h", lastReview: "2d ago" },
  { reviewer: "eve", prsReviewed: 11, avgReviewTime: "7h", lastReview: "3d ago" },
];

export default function PeerReviewActivityTracker() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Peer Review Activity Tracker</h1>
        </div>
        <p className="text-sm text-slate-600 mt-1">Monitor PR review activity, reviewer throughput, and review times.</p>
      </header>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-indigo-600" /> Reviewer Stats
        </h2>
        <table className="min-w-full border text-sm mb-4">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">Reviewer</th>
              <th className="border p-2 bg-gray-100">PRs Reviewed</th>
              <th className="border p-2 bg-gray-100">Avg Review Time</th>
              <th className="border p-2 bg-gray-100">Last Review</th>
            </tr>
          </thead>
          <tbody>
            {peerReviewData.map((row) => (
              <tr key={row.reviewer}>
                <td className="border p-2 font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" /> {row.reviewer}
                </td>
                <td className="border p-2">{row.prsReviewed}</td>
                <td className="border p-2 flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> {row.avgReviewTime}</td>
                <td className="border p-2">{row.lastReview}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 text-sm text-slate-500">Mock data — for demo purposes only.</div>
      </div>
    </div>
  );
}
