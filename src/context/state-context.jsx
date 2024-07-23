import PropTypes from 'prop-types';
import React, { useMemo, useState, createContext } from 'react';

const SystemContext = createContext();

export const SystemContextProvider = ({ children }) => {
  const [state, setState] = useState('system-context');

  const contextValue = useMemo(() => ({ state, setState }), [state, setState]);

  return <SystemContext.Provider value={contextValue}>{children}</SystemContext.Provider>;
};

export default SystemContext;

SystemContextProvider.propTypes = {
  children: PropTypes.node,
};
