import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useContext, useCallback, createContext } from 'react';

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
  const { fsGetUser, fsGetWaiterLogin, fsGetBranchTables } = useAuthContext();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: user = {} } = useQuery({
    queryKey: ['user', userID],
    queryFn: () => fsGetUser(userID),
    enabled: userID !== undefined,
  });

  const {
    data: waiterInfo = {},
    isSuccess: isWaiterInfoSuccess,
    error: waiterError,
  } = useQuery({
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

  console.log(tables);

  const [selectedLanguage, setLanguage] = useState(user?.defaultLanguage || 'en');

  const setLabel = useCallback(
    (labelID) => {
      setLoading(true);
      // Remove labelID if it exists in the array
      setLabels((state) => state.filter((label) => label !== labelID));
      // Add labelID if it doesn't exist in the array
      if (!labels.includes(labelID)) {
        setLabels((state) => [...new Set([...state, labelID])]);
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    },
    [labels]
  );

  const reset = useCallback(() => setLabels([]), []);

  const memoizedValue = useMemo(
    () => ({
      setLabel,
      labels,
      reset,
      loading,
      user,
      selectedLanguage,
      setLanguage,
      waiterInfo,
      tables,
    }),
    [labels, setLabel, reset, loading, user, selectedLanguage, setLanguage, waiterInfo, tables]
  );
  return <WaiterContext.Provider value={memoizedValue}>{children}</WaiterContext.Provider>;
}

WaiterContextProvider.propTypes = {
  children: PropTypes.node,
  // defaultSettings: PropTypes.object,
};
