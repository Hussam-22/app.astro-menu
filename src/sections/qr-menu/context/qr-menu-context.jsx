import PropTypes from 'prop-types';
import { useMemo, useState, useContext, useCallback, createContext } from 'react';

export const QrMenuContext = createContext();

export const useQrMenuContext = () => {
  const qrMenu = useContext(QrMenuContext);
  if (!qrMenu) throw Error('This is not a QR Menu Context');

  return qrMenu;
};

export function QrMenuContextProvider({ children }) {
  const [labels, setLabels] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

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
      setUser,
      user,
    }),
    [labels, setLabel, reset, loading, setUser, user]
  );
  return <QrMenuContext.Provider value={memoizedValue}>{children}</QrMenuContext.Provider>;
}

QrMenuContextProvider.propTypes = {
  children: PropTypes.node,
  // defaultSettings: PropTypes.object,
};
