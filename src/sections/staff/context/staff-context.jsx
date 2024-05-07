import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useContext, createContext } from 'react';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';

export const StaffContext = createContext();

export const useStaffContext = () => {
  const staff = useContext(StaffContext);
  if (!staff) throw Error('This is not a Staff Context');

  return staff;
};

export function StaffContextProvider({ children }) {
  const { businessProfileID } = useParams();
  const {
    fsGetBusinessProfile,
    fsGetBranchTables,
    fsGetBranchSnapshot,
    fsGetActiveOrdersSnapshot,
    staff: staffInfo,
    branchSnapshot: branchInfo,
  } = useAuthContext();
  const [selectedTable, setSelectedTable] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [waiterUnsubscribe, setWaiterUnsubscribe] = useState();

  const { data: businessProfile = {} } = useQuery({
    queryKey: ['businessProfile', businessProfileID],
    queryFn: () => fsGetBusinessProfile(businessProfileID),
    enabled: businessProfileID !== undefined && staffInfo.isLoggedIn,
  });

  const branchID = staffInfo?.branchID || '';

  // const { data: branchInfo = {} } = useQuery({
  //   queryKey: ['branch', businessProfileID, branchID],
  //   queryFn: () => fsGetBranch(branchID, businessProfileID),
  //   enabled: staffInfo?.branchID !== undefined,
  // });

  const { data: branchUnsubscribe = {} } = useQuery({
    queryKey: ['branch', businessProfileID, branchID],
    queryFn: () => fsGetBranchSnapshot(branchID, businessProfileID),
    enabled: staffInfo?.branchID !== undefined,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['branch-tables', branchID, businessProfileID],
    queryFn: () => fsGetBranchTables(branchID, businessProfileID),
    enabled: staffInfo.docID !== undefined,
  });

  // Get Orders Snapshot
  const { error } = useQuery({
    queryKey: ['active-orders', branchID, businessProfileID],
    queryFn: () => fsGetActiveOrdersSnapshot(businessProfileID, branchID),
    enabled: staffInfo.docID !== undefined,
  });

  const memoizedValue = useMemo(
    () => ({
      businessProfile,
      tables,
      branchInfo,
      selectedTable,
      setSelectedTable,
      isLoading,
      setIsLoading,
      waiterUnsubscribe,
      setWaiterUnsubscribe,
      branchUnsubscribe,
    }),
    [
      branchInfo,
      isLoading,
      selectedTable,
      tables,
      businessProfile,
      waiterUnsubscribe,
      branchUnsubscribe,
    ]
  );
  return <StaffContext.Provider value={memoizedValue}>{children}</StaffContext.Provider>;
}

StaffContextProvider.propTypes = {
  children: PropTypes.node,
};
