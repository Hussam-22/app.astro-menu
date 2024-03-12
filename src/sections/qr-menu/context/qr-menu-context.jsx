import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';

export const QrMenuContext = createContext();

export const useQrMenuContext = () => {
  const qrMenu = useContext(QrMenuContext);
  if (!qrMenu) throw Error('This is not a QR Menu Context');

  return qrMenu;
};

export function QrMenuContextProvider({ children }) {
  const { userID, branchID, tableID } = useParams();
  const {
    fsGetUser,
    fsGetMealLabels,
    fsGetBranch,
    fsGetTableInfo,
    fsGetSections,
    fsOrderSnapshot,
    orderSnapShot,
    fsGetMenu,
  } = useAuthContext();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState({
    text: 'Taking Order...',
    icon: 'solar:pen-new-square-bold',
    color: 'secondary',
  });

  const { data: user = {} } = useQuery({
    queryKey: ['user', userID],
    queryFn: () => fsGetUser(userID),
    enabled: userID !== undefined,
  });

  const {
    data: tableInfo = {},
    isSuccess: isTableInfoSuccess,
    error: tableError,
  } = useQuery({
    queryKey: ['table', userID, branchID, tableID],
    queryFn: () => fsGetTableInfo(userID, branchID, tableID),
  });

  const { data: menuInfo = {} } = useQuery({
    queryKey: ['menu', userID, tableInfo.menuID],
    queryFn: () => fsGetMenu(tableInfo.menuID, userID),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive,
  });

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', userID, branchID],
    queryFn: () => fsGetBranch(branchID, userID),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive,
  });

  const { data: mealsLabel = [] } = useQuery({
    queryKey: ['mealsLabel', userID],
    queryFn: () => fsGetMealLabels(userID),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive,
  });

  const { data: sectionsUnsubscribe = () => {} } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tableInfo.menuID ? ['sections', userID, tableInfo.menuID] : null,
    queryFn: () => fsGetSections(tableInfo.menuID, userID),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive && tableInfo.menuID !== null,
  });

  const { data: orderInfo = {}, error } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tableInfo.menuID ? ['order', userID, branchID, tableID, tableInfo.menuID] : null,
    queryFn: () => fsOrderSnapshot({ userID, branchID, tableID, menuID: tableInfo.menuID }),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive && tableInfo.menuID !== null,
  });

  useEffect(() => {
    if (orderSnapShot?.docID) {
      if (orderSnapShot?.isReadyToServe?.length !== 0) {
        // unsubscribe from menu meal updates
        if (typeof sectionsUnsubscribe === 'function') sectionsUnsubscribe();
        setOrderStatus({
          text: 'Ready to Serve...',
          icon: 'dashicons:food',
          color: 'info',
        });
      }

      if (orderSnapShot?.isInKitchen?.length !== 0 && orderSnapShot?.isReadyToServe?.length === 0) {
        // unsubscribe from menu meal updates
        if (typeof sectionsUnsubscribe === 'function') sectionsUnsubscribe();
        setOrderStatus({
          text: 'Preparing Order...',
          icon: 'ph:cooking-pot-light',
          color: 'warning',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderSnapShot]);

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
      tableInfo,
      mealsLabel,
      setLabel,
      labels,
      reset,
      loading,
      user,
      selectedLanguage,
      setLanguage,
      sectionsUnsubscribe,
      orderStatus,
      menuInfo,
    }),
    [
      mealsLabel,
      labels,
      loading,
      reset,
      selectedLanguage,
      setLabel,
      tableInfo,
      user,
      sectionsUnsubscribe,
      orderStatus,
      menuInfo,
    ]
  );
  return <QrMenuContext.Provider value={memoizedValue}>{children}</QrMenuContext.Provider>;
}

QrMenuContextProvider.propTypes = { children: PropTypes.node };
