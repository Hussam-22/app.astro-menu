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
  const { fsGetUser, fsGetWaiterLogin, fsGetBranchTables, fsGetMealLabels } = useAuthContext();
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

  const { data: tables = [] } = useQuery({
    queryKey: ['branch-tables', branchID],
    queryFn: () => fsGetBranchTables(branchID),
    enabled: waiterInfo.docID !== undefined,
  });

  const { data: labels = [] } = useQuery({
    queryKey: ['mealsLabel', userID],
    queryFn: () => fsGetMealLabels(userID),
    enabled: tables?.isActive,
  });

  const [selectedLanguage, setLanguage] = useState(user?.defaultLanguage || 'en');

  // const setLabel = useCallback(
  //   (labelID) => {
  //     setLoading(true);
  //     // Remove labelID if it exists in the array
  //     setLabels((state) => state.filter((label) => label !== labelID));
  //     // Add labelID if it doesn't exist in the array
  //     if (!labels.includes(labelID)) {
  //       setLabels((state) => [...new Set([...state, labelID])]);
  //     }
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 1000);
  //   },
  //   [labels]
  // );

  // const reset = useCallback(() => setLabels([]), []);

  const memoizedValue = useMemo(
    () => ({
      labels,
      user,
      selectedLanguage,
      setLanguage,
      waiterInfo,
      tables,
      selectedTable,
      setSelectedTable,
    }),
    [
      labels,
      user,
      selectedLanguage,
      setLanguage,
      waiterInfo,
      tables,
      selectedTable,
      setSelectedTable,
    ]
  );
  return <WaiterContext.Provider value={memoizedValue}>{children}</WaiterContext.Provider>;
}

WaiterContextProvider.propTypes = {
  children: PropTypes.node,
  // defaultSettings: PropTypes.object,
};
