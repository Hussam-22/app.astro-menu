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
  const { userID } = useParams();
  const {
    fsGetUser,
    fsGetBranchTables,
    fsGetBranch,
    fsGetActiveOrdersSnapshot,
    staff: staffInfo,
  } = useAuthContext();
  const [selectedTable, setSelectedTable] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [waiterUnsubscribe, setWaiterUnsubscribe] = useState();

  const { data: user = {} } = useQuery({
    queryKey: ['user', userID],
    queryFn: () => fsGetUser(userID),
    enabled: userID !== undefined && staffInfo.isLoggedIn,
  });

  const branchID = staffInfo?.branchID || '';

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', userID, branchID],
    queryFn: () => fsGetBranch(branchID, userID),
    enabled: staffInfo?.branchID !== undefined,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['branch-tables', branchID, userID],
    queryFn: () => fsGetBranchTables(branchID, userID),
    enabled: staffInfo.docID !== undefined,
  });

  // Get Orders Snapshot
  useQuery({
    queryKey: ['active-orders', branchID, userID],
    queryFn: () => fsGetActiveOrdersSnapshot(userID, branchID),
    enabled: staffInfo.docID !== undefined,
  });

  const memoizedValue = useMemo(
    () => ({
      user,
      tables,
      branchInfo,
      selectedTable,
      setSelectedTable,
      isLoading,
      setIsLoading,
      waiterUnsubscribe,
      setWaiterUnsubscribe,
    }),
    [branchInfo, isLoading, selectedTable, tables, user, waiterUnsubscribe]
  );
  return <StaffContext.Provider value={memoizedValue}>{children}</StaffContext.Provider>;
}

StaffContextProvider.propTypes = {
  children: PropTypes.node,
};
