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
  const { businessProfileID, branchID, tableID } = useParams();
  const {
    fsGetBusinessProfile,
    fsGetMealLabels,
    fsGetBranchSnapshot,
    fsGetTableInfo,
    fsGetSections,
    orderSnapShot,
    fsGetMenu,
    fsOrderSnapshot,
    branchSnapshot: branchInfo,
  } = useAuthContext();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState({
    text: 'Taking Order...',
    icon: 'solar:pen-new-square-bold',
    color: 'secondary',
  });

  const { data: businessProfile = {}, error: bpError } = useQuery({
    queryKey: ['businessProfile', businessProfileID],
    queryFn: () => fsGetBusinessProfile(businessProfileID),
    enabled: businessProfileID !== undefined,
  });

  const {
    data: tableInfo = {},
    isSuccess: isTableInfoSuccess,
    error: tableError,
  } = useQuery({
    queryKey: ['table', businessProfileID, branchID, tableID],
    queryFn: () => fsGetTableInfo(businessProfileID, branchID, tableID),
  });

  const { data: menuInfo = {} } = useQuery({
    queryKey: ['menu', businessProfileID, tableInfo.menuID],
    queryFn: () => fsGetMenu(tableInfo.menuID, businessProfileID),
    enabled: isTableInfoSuccess && tableInfo?.menuID !== undefined,
  });

  const { data: branchUnsubscribe = {} } = useQuery({
    queryKey: ['branch', businessProfileID, branchID],
    queryFn: () => fsGetBranchSnapshot(branchID, businessProfileID),
    enabled: tableInfo?.docID !== undefined,
  });

  const { data: mealsLabel = [] } = useQuery({
    queryKey: ['mealsLabel', businessProfileID],
    queryFn: () => fsGetMealLabels(businessProfileID),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive,
  });

  const { data: sectionsUnsubscribe = () => {}, error: sectionsError } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tableInfo.menuID ? ['sections', businessProfileID, tableInfo.menuID] : [],
    queryFn: () => fsGetSections(tableInfo.menuID, businessProfileID),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive && tableInfo.menuID !== null,
  });

  const { data: orderInfo = {}, error: orderError } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tableInfo.menuID
      ? ['order', businessProfileID, branchID, tableID, tableInfo.menuID]
      : [],
    queryFn: () =>
      fsOrderSnapshot({ businessProfileID, branchID, tableID, menuID: tableInfo.menuID }),
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

  console.log(branchInfo.defaultLanguage);

  // Default language is always English, regardless of user input
  const [selectedLanguage, setLanguage] = useState('en');

  useEffect(() => {
    if (branchInfo?.defaultLanguage) setLanguage(branchInfo.defaultLanguage);
  }, [branchInfo]);

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
      businessProfile,
      selectedLanguage,
      setLanguage,
      sectionsUnsubscribe,
      orderStatus,
      menuInfo,
      branchUnsubscribe,
      branchInfo,
    }),
    [
      mealsLabel,
      labels,
      loading,
      reset,
      selectedLanguage,
      setLabel,
      tableInfo,
      businessProfile,
      sectionsUnsubscribe,
      orderStatus,
      menuInfo,
      branchUnsubscribe,
      branchInfo,
    ]
  );
  return <QrMenuContext.Provider value={memoizedValue}>{children}</QrMenuContext.Provider>;
}

QrMenuContextProvider.propTypes = { children: PropTypes.node };
