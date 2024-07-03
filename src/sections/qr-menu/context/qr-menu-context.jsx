import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import { titleCase } from 'src/utils/change-case';

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
    fsGetMostOrderedMeals,
    branchSnapshot: branchInfo,
    fsGetSystemTranslations,
  } = useAuthContext();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderUnsubscribe, setOrderUnsubscribe] = useState(false);

  const [orderStatus, setOrderStatus] = useState({
    text: 'Taking Order...',
    icon: 'solar:pen-new-square-bold',
    color: 'secondary',
  });

  const {
    data: businessProfile = {},
    error: bpError,
    isPending: businessProfileIsPending,
    status,
  } = useQuery({
    queryKey: ['businessProfile', businessProfileID],
    queryFn: () => fsGetBusinessProfile(businessProfileID),
    enabled: businessProfileID !== undefined,
  });

  const {
    data: tableInfo = {},
    isSuccess: isTableInfoSuccess,
    error: tableError,
    isPending: tableIsPending,
  } = useQuery({
    queryKey: ['table', businessProfileID, branchID, tableID],
    queryFn: () => fsGetTableInfo(businessProfileID, branchID, tableID),
  });

  const {
    data: systemTranslations,
    error: translationError,
    isPending: systemTranslationIsPending,
  } = useQuery({
    queryKey: ['systemTranslations', businessProfile.languages],
    queryFn: () => fsGetSystemTranslations(businessProfile.languages),
    enabled: businessProfile.docID !== undefined && tableInfo?.menuID !== undefined,
  });

  const { data: menuInfo = {}, isPending: menuInfoIsPending } = useQuery({
    queryKey: ['menu', businessProfileID, tableInfo.menuID],
    queryFn: () => fsGetMenu(tableInfo.menuID, businessProfileID),
    enabled: isTableInfoSuccess && tableInfo?.menuID !== undefined,
  });

  const { data: branchUnsubscribe = {}, isPending: branchIsPending } = useQuery({
    queryKey: ['branch', businessProfileID, branchID],
    queryFn: () => fsGetBranchSnapshot(branchID, businessProfileID),
    enabled: tableInfo?.docID !== undefined,
  });

  const { data: mealsLabel = [], isPending: mealsLabelIsPending } = useQuery({
    queryKey: ['mealsLabel', businessProfileID],
    queryFn: () => fsGetMealLabels(businessProfileID),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive,
  });

  const {
    data: sectionsUnsubscribe = () => {},
    error: sectionsError,
    isPending: sectionsIsPending,
  } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tableInfo.menuID ? ['sections', businessProfileID, tableInfo.menuID] : [],
    queryFn: () => fsGetSections(tableInfo.menuID, businessProfileID),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive && tableInfo.menuID !== null,
  });

  const {
    data: orderSnapShotUnsubscribeFn = {},
    error: orderError,
    isPending: orderIsPending,
  } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tableInfo.menuID
      ? ['order', businessProfileID, branchID, tableID, tableInfo.menuID]
      : [],
    queryFn: () =>
      fsOrderSnapshot({ businessProfileID, branchID, tableID, menuID: tableInfo.menuID }),
    enabled: tableInfo?.docID !== undefined && tableInfo.isActive && tableInfo.menuID !== null,
  });

  useEffect(() => {
    if (orderUnsubscribe) orderSnapShotUnsubscribeFn();
  }, [orderSnapShotUnsubscribeFn, orderUnsubscribe]);

  const {
    data: mostOrderedMeals,
    error: mostOrderedMealsError,
    isPending: mostOrderedMealsIsPending,
  } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['most-ordered-meals', businessProfileID, menuInfo.docID],
    queryFn: () =>
      fsGetMostOrderedMeals(menuInfo.meals, menuInfo.mostOrderedMeals, businessProfileID),
    enabled: menuInfo?.docID !== undefined && tableInfo.isActive,
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

  // Default language is always English, regardless of user input
  const [selectedLanguage, setLanguage] = useState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setLanguage(branchInfo?.defaultLanguage || 'en'), []);

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
  const getTranslation = useCallback(
    (text) => {
      if (!systemTranslations || selectedLanguage === 'en') return titleCase(text);

      const languageIndex = systemTranslations.findIndex(
        (translation) => translation.lang === selectedLanguage
      );
      const keywordIndex = systemTranslations[languageIndex]?.keywords?.findIndex(
        (keywordText) => keywordText === text.toLowerCase()
      );

      return titleCase(systemTranslations?.[languageIndex]?.translations[keywordIndex] || text);
    },
    [selectedLanguage, systemTranslations]
  );
  const reset = useCallback(() => setLabels([]), []);

  const memoizedValue = useMemo(
    () => ({
      tableInfo,
      mealsLabel,
      setLabel,
      labels,
      loading,
      businessProfile,
      selectedLanguage,
      setLanguage,
      sectionsUnsubscribe,
      orderStatus,
      menuInfo,
      branchUnsubscribe,
      branchInfo,
      mostOrderedMeals,
      getTranslation,
      reset,
      setOrderUnsubscribe,
    }),
    [
      mealsLabel,
      labels,
      loading,
      selectedLanguage,
      setLabel,
      tableInfo,
      businessProfile,
      sectionsUnsubscribe,
      orderStatus,
      menuInfo,
      branchUnsubscribe,
      branchInfo,
      mostOrderedMeals,
      getTranslation,
      reset,
      setOrderUnsubscribe,
    ]
  );
  return <QrMenuContext.Provider value={memoizedValue}>{children}</QrMenuContext.Provider>;
}

QrMenuContextProvider.propTypes = { children: PropTypes.node };
