import { configureStore } from '@reduxjs/toolkit';
import { useDispatch as useAppDispatch, useSelector as useAppSelector } from 'react-redux';
import { PURGE, PAUSE, FLUSH, PERSIST, REGISTER, REHYDRATE, persistStore } from 'redux-persist';

import { rootReducer } from './root-reducer';

// ----------------------------------------------------------------------

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export const useSelector = useAppSelector;

export const useDispatch = () => useAppDispatch();
