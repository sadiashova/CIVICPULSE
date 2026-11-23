'use client';

import React from 'react';
import { Department, Issue } from '../types';
import { Trophy, Award, Medal, TrendingUp, AlertCircle, CheckCircle2, Star, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DepartmentRankingLeaderboardProps {
  departments: Department[];
  issues: Issue[];
}

export interface DepartmentRankMetric {
  department: Department;
  rank: number;
  totalIssues: number;
  resolvedIssues: number;
  resolutionRate: number;
  avgResolutionHours: number;
  slaComplianceRate: number;
  csatScore: number;
  compositeScore: number;
  trend: 'UP' | 'STABLE' | 'DOWN';
}

export const DepartmentRankingLeaderboard: React.FC<DepartmentRankingLeaderboardProps> = ({
  departments,
  issues,
}) => {
  // Calculate dynamic metrics for each department
  const rankingMetrics: DepartmentRankMetric[] = departments.map((dept) => {
    const deptIssues = issues.filter((i) => i.departmentId === dept.id);
    const totalIssues = deptIssues.length;
    const resolvedIssues = deptIssues.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;

    // SLA compliance
    const breachedIssues = deptIssues.filter((i) => {
      if (i.status === 'RESOLVED' || i.status === 'CLOSED') {
        const resolvedTime = new Date(i.resolvedAt || i.updatedAt).getTime();
        const deadlineTime = new Date(i.slaDeadline).getTime();
        return resolvedTime > deadlineTime;
      }
      return new Date().getTime() > new Date(i.slaDeadline).getTime();
    }).length;

    const slaComplianceRate = totalIssues > 0 ? Math.max(65, Math.round(((totalIssues - breachedIssues) / totalIssues) * 100)) : 95;

    // CSAT Score
    const feedbackItems = deptIssues.filter((i) => i.feedback).map((i) => i.feedback!.rating);
    const avgCsat = feedbackItems.length > 0
      ? Number((feedbackItems.reduce((a, b) => a + b, 0) / feedbackItems.length).toFixed(1))
      : 4.5;

    // Composite Score: 40% Resolution Rate + 35% SLA Compliance + 25% CSAT (normalized to 100)
    const compositeScore = Math.round(
      resolutionRate * 0.4 +
      slaComplianceRate * 0.35 +
      (avgCsat / 5) * 100 * 0.25
    );

    const trend: 'UP' | 'STABLE' | 'DOWN' =
      compositeScore >= 88 ? 'UP' : compositeScore >= 75 ? 'STABLE' : 'DOWN';

    return {
      department: dept,
      rank: 0,
      totalIssues,
      resolvedIssues,
      resolutionRate,
      avgResolutionHours: dept.avgResolutionHours,
      slaComplianceRate,
      csatScore: avgCsat,
      compositeScore,
      trend,
    };
  });

  // Sort descending by compositeScore
  rankingMetrics.sort((a, b) => b.compositeScore - a.compositeScore);
  rankingMetrics.forEach((m, idx) => {
    m.rank = idx + 1;
  });

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-extrabold text-sm shadow-md shadow-amber-500/30 ring-2 ring-amber-300">
            <Trophy className="w-4 h-4 fill-amber-950" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-extrabold text-sm shadow-md ring-2 ring-slate-200">
            <Award className="w-4 h-4" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-extrabold text-sm shadow-md ring-2 ring-amber-600">
            <Medal className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Department Performance Ranking
            </h3>
            <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              Citywide Leaderboard
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked by composite efficiency: SLA turnaround, resolution velocity, and verified citizen CSAT.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3 text-center">Score</th>
              <th className="py-2.5 px-3 text-center">SLA Compliance</th>
              <th className="py-2.5 px-3 text-center">Avg Time</th>
              <th className="py-2.5 px-3 text-center">Citizen CSAT</th>
              <th className="py-2.5 px-3 text-right">Velocity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rankingMetrics.map((item) => (
              <tr
                key={item.department.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    {getRankBadge(item.rank)}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">
                      {item.department.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Mgr. {item.department.headManagerName} • Code: {item.department.code}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="inline-flex items-center gap-1 font-extrabold text-sm text-sky-600 dark:text-sky-400">
                    <span>{item.compositeScore}</span>
                    <span className="text-[10px] text-slate-400 font-normal">/100</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                    item.slaComplianceRate >= 90
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : item.slaComplianceRate >= 80
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {item.slaComplianceRate}%
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                  {item.avgResolutionHours}h
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.csatScore}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                    item.trend === 'UP'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : item.trend === 'STABLE'
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {item.trend === 'UP' && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {item.trend === 'DOWN' && <ArrowDownRight className="w-3.5 h-3.5" />}
                    {item.resolvedIssues}/{item.totalIssues}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
