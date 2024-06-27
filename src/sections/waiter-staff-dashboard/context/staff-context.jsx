import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect, useContext, createContext } from 'react';

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
    fsGetBranchTablesSnapshot,
    fsGetBranchSnapshot,
    fsGetActiveOrdersSnapshot,
    staff: staffInfo,
    branchSnapshot: branchInfo,
    branchTables,
  } = useAuthContext();
  const [selectedTable, setSelectedTable] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [waiterUnsubscribe, setWaiterUnsubscribe] = useState();

  useEffect(() => {
    if (selectedTable.docID) {
      const table = branchTables.find((branchTable) => branchTable.docID === selectedTable.docID);
      if (!table.isActive) setSelectedTable({});
      if (table.isActive) setSelectedTable(table);

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [branchTables, selectedTable.docID]);

  const { data: businessProfile = {} } = useQuery({
    queryKey: ['businessProfile', businessProfileID],
    queryFn: () => fsGetBusinessProfile(businessProfileID),
    enabled: businessProfileID !== undefined && staffInfo.isLoggedIn,
  });

  const branchID = staffInfo?.branchID || '';

  const { data: branchUnsubscribe = {} } = useQuery({
    queryKey: ['branch', businessProfileID, branchID],
    queryFn: () => fsGetBranchSnapshot(branchID, businessProfileID),
    enabled: staffInfo?.branchID !== undefined,
  });

  const { data: branchTablesUnsubscribe = [] } = useQuery({
    queryKey: ['branch-tables', branchID, businessProfileID],
    queryFn: () => fsGetBranchTablesSnapshot(branchID, businessProfileID),
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
      branchTablesUnsubscribe,
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
      branchTablesUnsubscribe,
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
