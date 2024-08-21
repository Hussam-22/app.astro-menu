import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------------
const THIS_MONTH = new Date().getMonth();
const THIS_YEAR = new Date().getFullYear();

export function useGetBranchInfo(branchID, year = THIS_YEAR, month = THIS_MONTH) {
  const { businessProfile, fsGetBranch } = useAuthContext();

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', branchID],
    queryFn: () => fsGetBranch(branchID),
  });

  const scanData = businessProfile?.statisticsSummary?.branches[branchID]?.scans || {};
  const totalOrders =
    businessProfile.statisticsSummary.branches[branchID]?.orders[year][month] || 0;
  const totalTurnover =
    businessProfile.statisticsSummary.branches[branchID]?.turnover[year][month] || 0;
  const averageTurnover = totalTurnover / totalOrders || 0;
  const totalScans = businessProfile.statisticsSummary.branches[branchID]?.scans[year][month] || 0;
  const avgScanPerOrder = (totalScans / totalOrders).toFixed(0) || 0;
  const totalIncome =
    businessProfile?.statisticsSummary.branches[branchID]?.income[year][month] || 0;
  const allIncome = businessProfile.statisticsSummary.branches[branchID]?.income || {};
  const avgIncomePerOrder = totalIncome / totalOrders || 0;

  const mealsStats =
    businessProfile?.statisticsSummary?.branches[branchID]?.meals?.[year]?.[month] || {};

  const convertMinToHours = (minutes) => {
    if (minutes < 60) return `${minutes.toFixed(0)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toFixed(0)}min`;
  };

  console.log(totalTurnover);

  return {
    scanData,
    totalOrders,
    totalTurnover,
    totalTurnoverStr: convertMinToHours(totalTurnover),
    averageTurnover,
    averageTurnoverStr: convertMinToHours(averageTurnover),
    totalScans,
    avgScanPerOrder,
    totalIncome: +totalIncome.toFixed(2),
    allIncome,
    avgIncomePerOrder: +avgIncomePerOrder.toFixed(2),
    currency: branchInfo.currency,
    branchInfo,
    mealsStats,
  };
}
