import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import menu from './slices/menu';
import meal from './slices/meal';
import staff from './slices/staff';
import waiter from './slices/waiter';
import qrMenu from './slices/qrMenu';
import branch from './slices/branch';
import orders from './slices/orders';
import metaTag from './slices/metaTag';
import checkoutReducer from './slices/checkout';

// ----------------------------------------------------------------------

const checkoutPersistConfig = {
  key: 'checkout',
  storage,
  keyPrefix: 'redux-',
};

export const rootReducer = combineReducers({
  checkout: persistReducer(checkoutPersistConfig, checkoutReducer),
  meal,
  menu,
  branch,
  metaTag,
  orders,
  qrMenu,
  staff,
  waiter,
});
