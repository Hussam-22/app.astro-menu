import { useContext } from 'react';

import SystemContext from 'src/context/state-context';

export const useSystemContext = () => {
  const context = useContext(SystemContext);

  if (!context) throw new Error('useSystemContext context must be use inside SystemProvider');

  return context;
};
