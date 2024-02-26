import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useContext, createContext } from 'react';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';

export const WaiterContext = createContext();

export const useWaiterContext = () => {
  const waiter = useContext(WaiterContext);
  if (!waiter) throw Error('This is not a QR Menu Context');

  return waiter;
};

export function WaiterContextProvider({ children }) {
  const { userID, waiterID } = useParams();
  const {
    fsGetUser,
    fsGetWaiterLogin,
    fsGetBranchTables,
    fsGetMealLabels,
    fsGetBranch,
    fsGetActiveOrdersSnapshot,
    activeOrders,
  } = useAuthContext();
  const [selectedTable, setSelectedTable] = useState({});

  const { data: user = {} } = useQuery({
    queryKey: ['user', userID],
    queryFn: () => fsGetUser(userID),
    enabled: userID !== undefined,
  });

  const { data: waiterInfo = {} } = useQuery({
    queryKey: ['waiter', userID, waiterID],
    queryFn: () => fsGetWaiterLogin(userID, waiterID),
    enabled: userID !== undefined && waiterID !== undefined,
  });

  const branchID = waiterInfo?.branchID || '';

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', userID, branchID],
    queryFn: () => fsGetBranch(branchID, userID),
    enabled: waiterInfo?.branchID !== undefined,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['branch-tables', branchID, userID],
    queryFn: () => fsGetBranchTables(branchID, userID),
    enabled: waiterInfo.docID !== undefined,
  });

  useQuery({
    queryKey: ['active-orders', branchID, userID],
    queryFn: () => fsGetActiveOrdersSnapshot(userID, branchID),
    enabled: waiterInfo.docID !== undefined,
  });

  const memoizedValue = useMemo(
    () => ({
      user,
      tables,
      branchInfo,
      waiterInfo,
      selectedTable,
      setSelectedTable,
    }),
    [user, tables, branchInfo, waiterInfo, selectedTable, setSelectedTable]
  );
  return <WaiterContext.Provider value={memoizedValue}>{children}</WaiterContext.Provider>;
}

WaiterContextProvider.propTypes = {
  children: PropTypes.node,
  // defaultSettings: PropTypes.object,
};
