/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-shadow */
import PropTypes from 'prop-types';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ref, getStorage, deleteObject, getDownloadURL } from 'firebase/storage';
import { useMemo, useState, useEffect, useReducer, useCallback, createContext } from 'react';
import {
  getAuth,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  doc,
  where,
  query,
  setDoc,
  getDoc,
  getDocs,
  Timestamp,
  increment,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  arrayUnion,
  collection,
  deleteField,
  arrayRemove,
  getFirestore,
  collectionGroup,
  getCountFromServer,
} from 'firebase/firestore';

// config
import { FIREBASE_API } from 'src/config-global';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const THIS_MONTH = new Date().getMonth();
const THIS_YEAR = new Date().getFullYear();

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }

  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext(null);

// ----------------------------------------------------------------------

const firebaseApp = initializeApp(FIREBASE_API);
const AUTH = getAuth(firebaseApp);
const DB = getFirestore(firebaseApp);
const STORAGE = getStorage(firebaseApp);
const FUNCTIONS = getFunctions(firebaseApp);
const GOOGLE_PROVIDER = new GoogleAuthProvider();
const GITHUB_PROVIDER = new GithubAuthProvider();
const TWITTER_PROVIDER = new TwitterAuthProvider();

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dataSnapshotListener, setDataSnapshotListener] = useState([]);
  const [docSnapshot, setDocSnapshot] = useState([]);

  const initialize = useCallback(() => {
    try {
      onAuthStateChanged(AUTH, async (user) => {
        if (user) {
          const userRef = doc(DB, 'users', user.uid);

          const docSnap = await getDoc(userRef);

          const profile = docSnap.data();

          dispatch({
            type: 'INITIAL',
            payload: {
              isAuthenticated: true,
              user: {
                ...user,
                ...profile,
                role: 'admin',
              },
            },
          });
        } else {
          dispatch({
            type: 'INITIAL',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(AUTH, email, password);
  }, []);

  const loginWithGoogle = useCallback(() => {
    signInWithPopup(AUTH, GOOGLE_PROVIDER);
  }, []);

  const loginWithGithub = useCallback(() => {
    signInWithPopup(AUTH, GITHUB_PROVIDER);
  }, []);

  const loginWithTwitter = useCallback(() => {
    signInWithPopup(AUTH, TWITTER_PROVIDER);
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
    await createUserWithEmailAndPassword(AUTH, email, password).then(async (res) => {
      const userRef = doc(collection(DB, 'users'), res.user?.uid);

      await setDoc(userRef, {
        uid: res.user?.uid,
        email,
        displayName: `${firstName} ${lastName}`,
      });
    });
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    signOut(AUTH);
  }, []);

  // ?----------------------------------- Firebase Functions --------------------------------------
  const fbTranslate = httpsCallable(FUNCTIONS, 'fbTranslateSectionTitle');
  const fbTranslateMeal = httpsCallable(FUNCTIONS, 'fbTranslateMeal');
  const fbTranslateBranchDesc = httpsCallable(FUNCTIONS, 'fbTranslateBranchDesc');
  // ---------------------------------------------------------
  const fsUpdateTable = useCallback(async (docPath, value) => {
    const docRef = doc(DB, docPath);
    await updateDoc(docRef, value);
  }, []);

  const fsQueryDoc = useCallback(async (docPath) => {
    const docRef = doc(DB, docPath);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  }, []);

  const fsGetUserData = useCallback(async () => {
    const docRef = doc(DB, `/users/${state.user.id}`);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  }, [state]);

  // ?--------------------------------------------------------------------------------------------------------------------
  // Add Tables to Branch ------------------------------------------------------
  const fsAddBatchTablesToBranch = useCallback(
    async (tablesCount, branchID, CurrentCount) => {
      const docRef = doc(DB, `/users/${state.user.id}/branches/${branchID}/`);
      const docSnap = await getDoc(docRef);
      const { activeMenuID = '' } = docSnap.data();

      const totalTables = +tablesCount + +CurrentCount;
      const startIndex = 1 + +CurrentCount;

      // eslint-disable-next-line no-plusplus
      for (let index = startIndex; index <= totalTables; index++) {
        const newDocRef = doc(
          collection(DB, `/users/${state.user.id}/branches/${branchID}/tables`)
        );
        // eslint-disable-next-line no-await-in-loop
        await setDoc(newDocRef, {
          id: newDocRef.id,
          userID: state.user.id,
          activeMenuID,
          branchID,
          isActive: true,
          title: `Table ${index}`,
          note: '',
          index,
        });
      }
    },
    [state]
  );

  const fsDeleteTable = useCallback(
    async (branchID, tableID) => {
      const docRef = doc(DB, `/users/${state.user.id}/branches/${branchID}/tables/${tableID}`);
      await deleteDoc(docRef);
    },
    [state]
  );

  const fsGetTableInfo = useCallback(async (userID, tableID) => {
    const docRef = query(
      collectionGroup(DB, 'tables'),
      where('userID', '==', userID),
      where('id', '==', tableID)
    );
    const querySnapshot = await getDocs(docRef);
    const dataArr = [];
    querySnapshot.forEach((doc) => dataArr.push(doc.data()));
    return dataArr[0];
  }, []);

  const fsChangeMenuForAllTables = useCallback(async (branchID, menuID) => {
    const docsRef = query(
      collectionGroup(DB, 'tables'),
      where('userID', '==', state.user.id),
      where('branchID', '==', branchID)
    );
    const snapshot = await getDocs(docsRef);

    const batch = writeBatch(DB);
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { activeMenuID: menuID });
    });

    await batch.commit();
  }, []);

  // ?-------------------------------------------------------------------------------------------------------------------
  // Branch Tables Count
  const fsGetBranchTablesCount = useCallback(
    async (branchID) => {
      const query_ = query(
        collectionGroup(DB, 'tables'),
        where('userID', '==', state.user.id),
        where('branchID', '==', branchID)
      );
      const snapshot = await getCountFromServer(query_);
      return snapshot.data().count;
    },
    [state]
  );

  // Get all Branch Tables -----------------------------------------------------
  const fsGetBranchTables = useCallback(
    async (branchID, userID = state.user.id) => {
      const docRef = query(
        collectionGroup(DB, 'tables'),
        where('userID', '==', userID),
        where('branchID', '==', branchID)
      );
      const querySnapshot = await getDocs(docRef);
      const dataArr = [];
      querySnapshot.forEach((doc) => dataArr.push(doc.data()));
      return dataArr;
    },
    [state]
  );

  // Get Single Branch ---------------------------------------------------------
  const fsGetBranch = useCallback(
    async (branchID, userID = state.user.id) => {
      const docRef = doc(DB, `/users/${userID}/branches/${branchID}/`);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    },
    [state]
  );

  // Get All "Non-Deleted" Branches --------------------------------------------
  const fsGetAllBranches = useCallback(async () => {
    const docRef = query(
      collectionGroup(DB, 'branches'),
      where('userID', '==', state.user.id),
      where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(docRef);
    const dataArr = [];
    querySnapshot.forEach((doc) => dataArr.push(doc.data()));
    return dataArr;
  }, [state]);

  // Add New Branch -----------------------------------------------------------
  const fsAddNewBranch = useCallback(
    async (payload) => {
      const newDocRef = doc(collection(DB, `/users/${state.user.id}/branches/`));
      const date = new Date();
      const dateTime = date.toDateString();
      setDoc(newDocRef, {
        ...payload,
        id: newDocRef.id,
        createdAt: dateTime,
        userID: state.user.id,
        // scanLimits: profile.planeInfo.scansLimit,
        cover: {
          id: payload.cover.id,
          url: `https://firebasestorage.googleapis.com/v0/b/menu-app-b268b.appspot.com/o/${state.user.id}%2Fbranches%2F${payload.cover.id}_800x800?alt=media&token=1f5f8bad-4baf-4d37-b6ef-779fbf79a770`,
        },
        menuVisual: { wifiPassword: true, cart: true, homePage: true },
        mealVisual: { fullMeal: true, price: true, keywords: true, description: true },
      });
      return newDocRef.id;
    },
    [state]
  );

  const fsUpdateBranchTable = useCallback(
    async (branchID, tableID, value) => {
      const docRef = doc(DB, `/users/${state.user.id}/branches/${branchID}/tables/${tableID}`);
      await updateDoc(docRef, value);
    },
    [state]
  );

  const fsDeleteBranch = useCallback(
    async (branchID, imageID) => {
      const docRef = doc(DB, `/users/${state.user.id}/branches/${branchID}`);
      await deleteDoc(docRef);

      // only attempt to delete branch image if there is one in the first place
      if (imageID) {
        // Create a reference to the file to delete
        const desertRef = ref(STORAGE, `/${state.user.id}/branches/${imageID}_800x800`);

        // Delete the file
        deleteObject(desertRef)
          .then(() => {
            console.log('FILE DELETED');
          })
          .catch((error) => {
            console.log('OH ERROR DELETING FILE');
          });
      }
    },
    [state]
  );

  // ?------------------------------------------------ ORDERS -------------------------------------------------------------------
  const fsGetAllOrders = useCallback(async (year) => {
    const start = new Date(`01/01/${year}`);
    const end = new Date(`12/01/${year}`);

    const docRef = query(
      collectionGroup(DB, 'orders'),
      where('userID', '==', state.user.id),
      where('confirmTime', '>=', start),
      where('confirmTime', '<=', end)
    );
    const querySnapshot = await getDocs(docRef);
    const dataArr = [];
    querySnapshot.forEach((doc) => dataArr.push(doc.data()));
    return dataArr;
  }, []);

  const fsGetAllTableOrders = useCallback(
    async (tableID) => {
      const docRef = query(
        collectionGroup(DB, 'orders'),
        where('userID', '==', state.user.id),
        where('tableID', '==', tableID)
      );
      const querySnapshot = await getDocs(docRef);
      const dataArr = [];
      querySnapshot.forEach((doc) => dataArr.push(doc.data()));
      return dataArr;
    },
    [state]
  );

  // ?------------------------------------------------- MEALS ------------------------------------------------------------------

  // -------------------------------- get all meals ----------------------------------------
  const fsGetAllMeals = useCallback(async () => {
    const dataArr = [];
    const docRef = query(
      collectionGroup(DB, 'meals'),
      where('userID', '==', state.user.id),
      where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(docRef);
    querySnapshot.forEach((doc) => {
      dataArr.push({ id: doc.id, qty: 0, ...doc.data() });
    });
    return dataArr;
  }, [state]);

  const fsGetAllMealsOFF = useCallback(async (userID) => {
    const dataArr = [];
    const docRef = query(collectionGroup(DB, 'meals'), where('userID', '==', userID));
    const querySnapshot = await getDocs(docRef);
    querySnapshot.forEach((doc) => {
      dataArr.push({ id: doc.id, qty: 0, ...doc.data() });
    });
    return dataArr;
  }, []);

  // ------------------ | GET MEAL | ------------------
  const fsGetMeal = useCallback(
    async (mealID) => {
      const docRef = doc(DB, `/users/${state.user.id}/meals/${mealID}/`);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    },
    [state]
  );

  // ---------------------------------- Get All "Non-Deleted" Menus ------------------------------------------
  const fsGetMenu = useCallback(
    async (menuID) => {
      // const docRef = query(
      //   collectionGroup(DB, 'menus'),
      //   where('userID', '==', state.user.id),
      //   where('id', '==', menuID),
      //   where('isDeleted', '==', false)
      // );
      // const querySnapshot = await getDocs(docRef);
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/`);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    },
    [state]
  );

  // ---------------------------------- Get All "Non-Deleted" Menus ------------------------------------------
  const fsGetAllMenus = useCallback(async () => {
    const docRef = query(
      collectionGroup(DB, 'menus'),
      where('userID', '==', state.user.id),
      where('isDeleted', '==', false)
    );
    const dataArr = [];
    const querySnapshot = await getDocs(docRef);
    querySnapshot.forEach((doc) => dataArr.push(doc.data()));
    return dataArr;
  }, [state]);

  // ------------------ | Get image Download URL | ------------------
  const fsGetImgDownloadUrl = useCallback(
    (imgID, type) => {
      // // getDownloadURL(ref(STORAGE, `${state.user.id}/menusCover/${dataObj.cover.id}_800x800.webp`))
      // const url = getDownloadURL(ref(STORAGE, `${state.user.id}/branches/${imgID}_800x800`))
      //   .then((response) => response)
      //   .catch((error) => console.log(error));
      // console.log(url);
      // return url;
    },
    [state]
  );

  // ------------------ | Add New Menu | ------------------
  const fsAddNewMenu = useCallback(
    async (dataObj) => {
      const newDocRef = doc(collection(DB, `/users/${state.user.id}/menus/`));
      setDoc(newDocRef, {
        ...dataObj,
        id: newDocRef.id,
        userID: state.user.id,
        meals: [],
      });
      return newDocRef.id;
    },
    [state]
  );
  // ------------------ | Update Menu | ------------------
  const fsUpdateMenu = useCallback(
    async (menuID, value) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}`);
      await updateDoc(docRef, {
        ...value,
      });
    },
    [state]
  );
  // ----------------------------------- add Doc to DB ----------------------------------
  const fsAddToDB = useCallback(
    async (table, dataObj) => {
      const newDocRef = doc(collection(DB, table));
      await setDoc(newDocRef, {
        ...dataObj,
        id: newDocRef.id,
        userID: state.user.id,
      });

      return newDocRef.id;
    },
    [state]
  );

  const fsRemoveFromDB = useCallback(async (table, id) => {
    const docRef = doc(DB, table + id);
    await deleteDoc(docRef);
  }, []);

  // ---------------------------------- MENU SECTIONS ----------------------------------------
  const fsAddSection = useCallback(
    async (menuID, title, order) => {
      const userID = state.user.id;
      const newDocRef = doc(collection(DB, `/users/${userID}/menus/${menuID}/sections`));
      await setDoc(newDocRef, {
        id: newDocRef.id,
        menuID,
        userID,
        title,
        meals: [],
        order,
        isVisible: true,
        activeTimeRange: { isActive: false, from: '', to: '' },
        activeDateRange: { isActive: false, from: '', to: '' },
      });

      return newDocRef.id;
    },
    [state]
  );
  // ----------------------------------------
  const fsGetSections = useCallback(
    async (menuID, userID = state.user.id) => {
      const dataArr = [];
      const docRef = query(
        collectionGroup(DB, 'sections'),
        where('userID', '==', userID),
        where('menuID', '==', menuID)
      );
      const querySnapshot = await getDocs(docRef);
      querySnapshot.forEach((doc) => {
        dataArr.push({ id: doc.id, ...doc.data() });
      });
      return dataArr;
    },
    [state]
  );

  const fsGetSection = useCallback(
    async (menuID, sectionID) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}`);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    },
    [state]
  );
  // ----------------------------------------
  const fsUpdateSection = useCallback(
    async (menuID, sectionID, meals) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}/`);
      await updateDoc(docRef, { meals });
    },
    [state]
  );

  const fsUpdateSectionVisibility = useCallback(
    async (menuID, sectionID, value) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}/`);
      await updateDoc(docRef, value);
    },
    [state]
  );

  const fsUpdateSectionVisibilityDateTimeRange = useCallback(
    async (menuID, sectionID, value) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}/`);
      await updateDoc(docRef, {
        // activeDateRange: { from: Timestamp.fromDate(value.date.from), to: Timestamp.fromDate(value.date.to) },
        activeTimeRange: {
          isActive: value.isActive,
          from: Timestamp.fromDate(value.from),
          to: Timestamp.fromDate(value.to),
        },
      });
    },
    [state]
  );

  const fsUpdateSectionTitle = useCallback(
    async (menuID, sectionID, title) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}/`);
      await updateDoc(docRef, { title });
    },
    [state]
  );

  const fsUpdateSectionOrder = useCallback(
    async (menuID, sectionID, order) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}/`);
      await updateDoc(docRef, { order });
    },
    [state]
  );

  const fsUpdateSectionTranslation = useCallback(
    async (menuID, sectionID, value) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}/`);
      await updateDoc(docRef, value);
    },
    [state]
  );

  const fsAddMealToMenuSelectedMeals = useCallback(
    async (menuID, mealID) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/`);
      await updateDoc(docRef, { meals: arrayUnion(mealID) });
    },
    [state]
  );

  const fsRemoveMealFromMenuSelectedMeals = useCallback(
    async (menuID, mealID) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/`);
      await updateDoc(docRef, { meals: arrayRemove(mealID) });
    },
    [state]
  );

  const fsRemoveSectionMealsFromMenuSelectedMeals = useCallback(
    async (menuID, meals) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/`);
      await updateDoc(docRef, { meals });
    },
    [state]
  );

  const fsEmptyMenuSelectedMeals = useCallback(
    async (menuID) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/`);
      await updateDoc(docRef, { meals: [] });
    },
    [state]
  );

  const fsDeleteSection = useCallback(
    async (menuID, sectionID, orderValue) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}`);
      await deleteDoc(docRef);

      // get all sections that order index is above the one is being deleted and reduce it
      const docsRef = query(
        collectionGroup(DB, 'sections'),
        where('userID', '==', state.user.id),
        where('menuID', '==', menuID),
        where('order', '>', orderValue)
      );
      const snapshot = await getDocs(docsRef);

      // Update sections order
      const batch = writeBatch(DB);
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { order: increment(-1) });
      });

      await batch.commit();
    },
    [state]
  );

  const fsDeleteAllSections = useCallback(
    async (menuID) => {
      const docRef = query(
        collectionGroup(DB, 'sections'),
        where('userID', '==', state.user.id),
        where('menuID', '==', menuID)
      );
      const snapshot = await getDocs(docRef);

      const batch = writeBatch(DB);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    },
    [state]
  );
  // ------------------------------------- Delete menu ---------------------------------------

  const deleteMenu = useCallback(
    async (menuID) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/`, menuID);
      await deleteDoc(docRef);
    },
    [state]
  );

  // ------------------ | MEALS | ------------------

  const fsDocSnapshot = useCallback(
    async (type, id) => {
      const docRef = query(
        collectionGroup(DB, type),
        where('userID', '==', state.user.id),
        where('id', '==', id)
      );

      const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          setDocSnapshot(doc.data());
        });
      });

      // TODO unsubscribe()
      return unsubscribe;
    },
    [state]
  );

  const fsAddNewMeal = useCallback(
    async (dataObj) => {
      const newDocRef = doc(collection(DB, `/users/${state.user.id}/meals/`));
      const date = new Date();
      const dateTime = date.toDateString();
      setDoc(newDocRef, {
        ...dataObj,
        id: newDocRef.id,
        createdAt: dateTime,
        userID: state.user.id,
        isDeleted: false,
        cover: {
          id: dataObj.cover.id,
          url: `https://firebasestorage.googleapis.com/v0/b/menu-app-b268b.appspot.com/o/${state.user.id}%2Fmeals%2F${dataObj.cover.id}_800x800?alt=media&token=1f5f8bad-4baf-4d37-b6ef-779fbf79a770`,
        },
      });
      return newDocRef.id;
    },
    [state]
  );

  const fsUpdateMeal = useCallback(
    async (payload) => {
      const docRef = doc(DB, `/users/${state.user.id}/meals/${payload.mealID}/`);
      await updateDoc(docRef, { ...payload.data });
    },
    [state]
  );

  const fsDeleteMeal = useCallback(
    async (mealID, imageID) => {
      // delete meal
      const docRef = doc(DB, `/users/${state.user.id}/meals/`, mealID);
      await updateDoc(docRef, { isDeleted: true });

      // TODO: KEEP IMAGES FOR 1 MONTH THEN DELETE
      // only attempt to delete branch image if there is one in the first place
      /* if (imageID) {
        // Create a reference to the file to delete
        const desertRef = ref(STORAGE, `/${state.user.id}/meals/${imageID}_800x800`);

        // Delete the file
        deleteObject(desertRef)
          .then(() => {
            console.log('FILE DELETED');
          })
          .catch((error) => {
            console.log('OH ERROR DELETING FILE');
          });
      }
      */
    },
    [state]
  );

  // ?----------------------------------------------------------------------------
  // -------------------------- QR Menu - Cart -----------------------------------
  const fsConfirmCartOrder = useCallback(async (dataObj) => {
    const { userID, branchID, cart } = dataObj;
    const totalBill = cart.reduce((sum, item) => sum + item.price, 0);
    const userRef = doc(DB, `/users/${userID}`);

    await updateDoc(userRef, {
      [`statisticsSummary.branches.${branchID}.income.${THIS_YEAR}.${THIS_MONTH}`]:
        increment(totalBill),
      [`statisticsSummary.branches.${branchID}.orders.${THIS_YEAR}.${THIS_MONTH}`]: increment(1),
    });

    const branchMealsOrderUsage = cart.map((cartItem) =>
      updateDoc(userRef, {
        [`statisticsSummary.branches.${branchID}.meals.${THIS_YEAR}.${THIS_MONTH}.${cartItem.mealID}`]:
          increment(1),
      })
    );

    const toResolveUser = cart.map((cartItem) =>
      updateDoc(userRef, {
        [`statisticsSummary.meals.${THIS_YEAR}.${THIS_MONTH}.${cartItem.mealID}`]: increment(1),
      })
    );

    await Promise.all([...toResolveUser, ...branchMealsOrderUsage]);
  }, []);
  // ------------------------------------------------------------------------------------------------------------------
  const fsInitiateNewOrder = useCallback(async (payload) => {
    const { initiatedBy, tableID, menuID, waiterID, userID, branchID, cart } = payload;
    const docRef = doc(collection(DB, `/users/${userID}/branches/${branchID}/orders`));
    await setDoc(docRef, {
      id: docRef.id,
      userID,
      branchID,
      tableID,
      menuID,
      waiterID,
      initiatedBy,
      totalBill: 0,
      paymentMethod: '',
      sessionExpiryTime: new Date().getTime() + 45 * 60000,
      cart,
      isClosed: false,
      isCanceled: false,
      isPaid: false,
      lastUpdate: new Date(),
    });
    return docRef.id;
  }, []);

  const fsAddMealToCart = useCallback(async (payload) => {
    const { orderID, userID, branchID, cart } = payload;
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/orders/${orderID}`);

    updateDoc(docRef, { cart });
    // if (resetStatus) updateDoc(docRef, { status: { ...status, ready: '', collected: '', kitchen: '' } });
  }, []);

  const fsRemoveMealFromCart = useCallback(async (payload) => {
    const { orderID, userID, branchID, cart } = payload;
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/orders/${orderID}`);
    await updateDoc(docRef, { cart });
  }, []);

  const fsUpdateOrderStatus = useCallback(async (payload) => {
    const { orderID, status, userID, branchID } = payload;
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/orders/${orderID}`);
    updateDoc(docRef, { status });
  }, []);

  const fsCancelOrder = useCallback(async (payload) => {
    const { orderID, userID, branchID } = payload;
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/orders/${orderID}`);

    await updateDoc(docRef, { isCanceled: true, lastUpdate: new Date() });
    await updateDoc(docRef, { isClosed: true });
  }, []);

  const fsOrderIsPaid = useCallback(async (payload) => {
    const { orderID, userID, branchID } = payload;
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/orders/${orderID}`);

    await updateDoc(docRef, { isPaid: true, lastUpdate: new Date() });
    await updateDoc(docRef, { isClosed: true });

    // update
  }, []);

  const fsOrdersSnapshot = useCallback(async (payload) => {
    const { userID, branchID, tableID } = payload;
    const docRef = query(
      collectionGroup(DB, 'orders'),
      where('userID', '==', userID),
      where('branchID', '==', branchID),
      where('tableID', '==', tableID),
      where('isClosed', '==', false)
    );

    const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setDataSnapshotListener(doc.data());
      });
    });

    // TODO unsubscribe()
    return [unsubscribe];
  }, []);
  // ------------------------------------------------------------------------------------------------------------------

  const fsUpdateScanLog = useCallback(async (payload) => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const { userID, branchID } = payload;

    // TODO: SPAM Prevention : allow max # of scans coming from the same table every 5 mins
    // like maximum 20 scans can be preformed for the same table QR every 5 mins
    // allow viewing menu but dont charge scan count on restaurant

    // UPDATE statisticsSummary (User Account Level)
    const userDocRef = doc(DB, `/users/${userID}`);
    await updateDoc(userDocRef, {
      [`statisticsSummary.branches.${branchID}.scans.${year}.${month}`]: increment(1),
    });
  }, []);
  // ------------------------------------------------------------------------------------------------------------------

  // ? ---------------------------- WAITER --------------------------------

  const fsGetWaiterLogin = useCallback(async (userCode, password, userID, branchID) => {
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/waiters/${userCode}`);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  }, []);

  const fsGetWaitersList = useCallback(async () => {
    const dataArr = [];
    const docRef = query(collectionGroup(DB, 'waiters'), where('userID', '==', state.user.id));
    const querySnapshot = await getDocs(docRef);
    querySnapshot.forEach((doc) => {
      dataArr.push(doc.data());
    });
    return dataArr;
  }, [state]);

  const fsAddNewWaiter = useCallback(
    async (newStaffInfo) => {
      const newDocRef = doc(collection(DB, `/users/${state.user.id}/waiters`));
      const userDocRef = doc(DB, `/users/${state.user.id}/`);
      await setDoc(newDocRef, {
        ...newStaffInfo,
        id: newDocRef.id,
        userID: state.user.id,
        passCode: newStaffInfo.accessCode,
      });
      await updateDoc(userDocRef, { lastStaffAccessCodeID: increment(1) });
      return newDocRef.id;
    },
    [state]
  );

  const fsUpdateWaiterInfo = useCallback(
    async (payload) => {
      const waiterDocRef = doc(DB, `/users/${state.user.id}/waiters/${payload.id}`);
      await updateDoc(waiterDocRef, payload);
    },
    [state]
  );

  const fsDeleteWaiter = useCallback(
    async (payload) => {
      const waiterDocRef = doc(DB, `/users/${state.user.id}/waiters/${payload}`);
      await deleteDoc(waiterDocRef);
    },
    [state]
  );

  const fsWaiterTablesSnapshot = useCallback(async (payload) => {
    const { userID, branchID } = payload;
    const docRef = query(
      collectionGroup(DB, 'orders'),
      where('userID', '==', userID),
      where('branchID', '==', branchID),
      where('isClosed', '==', false)
    );

    const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setDataSnapshotListener((state) => {
          const ordersArr = state;
          const orderIndex = ordersArr.findIndex((order) => order.id === doc.data().id);
          // if order is new, add it to state
          if (orderIndex === -1) return [...state, doc.data()];

          // if order not new, remove it from array and replace it with updated version
          ordersArr.splice(orderIndex, 1);
          return [...ordersArr, doc.data()];
        });
      });
    });

    // TODO unsubscribe()
    return [unsubscribe];
  }, []);

  /* 
  // ----------------------------------------------------------------------

  const fsGetScanCountTable = useCallback( async (branchID, tableID) => {
    const query_ = query(
      collectionGroup(DB, 'scanLogs'),
      where('branchID', '==', branchID),
      where('tableID', '==', tableID)
    );
    const snapshot = await getCountFromServer(query_);
    return snapshot.data().count;
  },[]);

  const fsGetScanCountBranch = useCallback( async (branchID, year, month) => {
    const start = new Date(`${month}/01/${year}`);
    const end = new Date(`${month === 12 ? 1 : month + 1}/01/${year + (month === 12 ? 1 : 0)}`);

    const query_ = query(
      collectionGroup(DB, 'scanLogs'),
      where('branchID', '==', branchID),
      where('scanTime', '>=', start),
      where('scanTime', '<', end)
    );
    const snapshot = await getCountFromServer(query_);
    return snapshot.data().count;
  },[]); 
  */
  // -----------------------------------------------------------------------------
  // ! -------------------------------------------- Meta Tags -------------------------------------------------------------

  const fsGetAllMetaTags = useCallback(async () => {
    const dataArr = [];
    const docRef = query(
      collectionGroup(DB, 'metaTags'),
      where('userID', '==', state.user.id),
      where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(docRef);
    querySnapshot.forEach((doc) => {
      dataArr.push(doc.data());
    });
    return dataArr;
  }, [state]);

  const fsUpdateAllMetaTags = useCallback(
    async (tagsIDs, mealID) => {
      console.log(tagsIDs);
      const batchAdd = writeBatch(DB);
      const batchRemove = writeBatch(DB);
      const batch = writeBatch(DB);

      if (tagsIDs.length !== 0) {
        const docsRefAdd = query(
          collectionGroup(DB, 'metaTags'),
          where('userID', '==', state.user.id),
          where('id', 'in', tagsIDs)
        );
        const snapshotAdd = await getDocs(docsRefAdd);
        snapshotAdd.docs.forEach((doc) => {
          batch.update(doc.ref, { mealIDs: arrayUnion(mealID) });
        });
      }

      // if (tagsIDs.length !== 0) {
      //   await updateDoc(waiterDocRef, { metaKeywords: arrayRemove(tagID) });
      // }
      const docsRefRemove = query(
        collectionGroup(DB, 'metaTags'),
        where('userID', '==', state.user.id),
        where('id', 'not-in', tagsIDs)
      );
      const snapshotRemove = await getDocs(docsRefRemove);

      snapshotRemove.docs.forEach((doc) => {
        batch.update(doc.ref, { mealIDs: arrayRemove(mealID) });
      });

      // await batchAdd.commit();
      // await batchRemove.commit();
      await batch.commit();
    },
    [state]
  );

  const fsRemoveTagFromAllMeals = useCallback(
    async (tagID) => {
      const batch = writeBatch(DB);

      const docsRef = query(
        collectionGroup(DB, 'meals'),
        where('userID', '==', state.user.id),
        where('metaKeywords', 'array-contains', tagID)
      );
      const snapshotAdd = await getDocs(docsRef);
      snapshotAdd.docs.forEach((doc) => {
        batch.update(doc.ref, { metaKeywords: arrayRemove(tagID) });
      });

      await batch.commit();
    },
    [state]
  );

  const fsUpdateMealMetaTags = useCallback(
    async (tagID, mealID, Type) => {
      const waiterDocRef = doc(DB, `/users/${state.user.id}/meals/${mealID}`);
      if (Type === 'REMOVE') await updateDoc(waiterDocRef, { metaKeywords: arrayRemove(tagID) });
      if (Type === 'ADD') await updateDoc(waiterDocRef, { metaKeywords: arrayUnion(tagID) });
    },
    [state]
  );

  // ! ------------------------------------------ Extension ---------------------------------------------------------------
  const fsSendEmail = useCallback(async () => {
    const newDocRef = doc(collection(DB, `/users/${state.user.id}/mail/`));
    setDoc(newDocRef, {
      to: 'hussam@hotmail.co.uk',
      message: {
        subject: 'Hello from firebase',
        text: 'this is some random text',
        html: `<img src='https://cdn.dribbble.com/userupload/3158902/file/original-7c71bfa677e61dea61bc2acd59158d32.jpg?resize=400x300' alt='logo' /> <h4>Thank you for your purchase</h4>`,
      },
    });
    return newDocRef.id;
  }, [state]);

  const fsSendSMS = useCallback(async () => {
    const newDocRef = doc(collection(DB, `/users/${state.user.id}/sms/`));
    setDoc(newDocRef, {
      flowId: '64ae5102d6fc056cc029fa84',
      mobile: '009717440031',
      vars: {
        name: 'Nour Sallora',
      },
    });
    return newDocRef.id;
  }, [state]);
  // ! ---------------------------------------------------------------------------------------------------------

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      method: 'firebase',
      login,
      loginWithGoogle,
      loginWithGithub,
      loginWithTwitter,
      register,
      logout,
      // ---- GENERIC ----
      fsUpdateTable,
      fsQueryDoc,
      fsAddToDB,
      fsRemoveFromDB,
      Timestamp,
      fsGetUserData,
      // ---- FUNCTIONS ----
      fbTranslate,
      fbTranslateMeal,
      fbTranslateBranchDesc,
      // ---- STORAGE ----
      STORAGE,
      fsGetImgDownloadUrl,
      // ---- BRANCHES ----
      fsGetBranch,
      fsGetAllBranches,
      fsAddNewBranch,
      fsDeleteBranch,
      // ---- TABLES ----
      fsAddBatchTablesToBranch,
      fsDeleteTable,
      fsGetBranchTablesCount,
      fsGetBranchTables,
      fsUpdateBranchTable,
      fsGetTableInfo,
      fsChangeMenuForAllTables,
      // ---- ORDERS ----
      fsGetAllOrders,
      fsGetAllTableOrders,
      // ---- MENU SECTIONS ----
      fsAddSection,
      fsUpdateSection,
      fsGetSections,
      fsGetSection,
      fsAddMealToMenuSelectedMeals,
      fsRemoveMealFromMenuSelectedMeals,
      fsDeleteAllSections,
      fsDeleteSection,
      fsRemoveSectionMealsFromMenuSelectedMeals,
      fsUpdateSectionTitle,
      fsUpdateSectionOrder,
      fsUpdateSectionTranslation,
      fsUpdateSectionVisibility,
      fsUpdateSectionVisibilityDateTimeRange,
      deleteMenu,
      // ---- MENU ----
      fsGetAllMenus,
      fsGetMenu,
      fsAddNewMenu,
      fsUpdateMenu,
      fsEmptyMenuSelectedMeals,
      // ---- MEALS ----
      fsGetAllMeals,
      fsGetMeal,
      fsDeleteMeal,
      fsAddNewMeal,
      fsUpdateMeal,
      fsDocSnapshot,
      fsGetAllMetaTags,
      fsUpdateAllMetaTags,
      fsUpdateMealMetaTags,
      fsRemoveTagFromAllMeals,
      // ---- QR Menu ----
      fsConfirmCartOrder,
      fsUpdateScanLog,
      fsAddMealToCart,
      fsRemoveMealFromCart,
      fsOrdersSnapshot,
      fsInitiateNewOrder,
      // ---- Waiter ----
      fsGetWaiterLogin,
      fsWaiterTablesSnapshot,
      fsUpdateOrderStatus,
      fsCancelOrder,
      fsOrderIsPaid,
      fsAddNewWaiter,
      fsGetWaitersList,
      fsUpdateWaiterInfo,
      fsDeleteWaiter,
      // ---- RTD ----
      dataSnapshotListener,
      docSnapshot,
      // ---- NO SIGNED IN ----
      fsGetAllMealsOFF,
      fsSendEmail,
      fsSendSMS,
    }),
    [
      state.isAuthenticated,
      state.isInitialized,
      state.user,
      login,
      loginWithGithub,
      loginWithGoogle,
      loginWithTwitter,
      register,
      logout,
      // ---- GENERIC ----
      fsUpdateTable,
      fsQueryDoc,
      fsAddToDB,
      fsRemoveFromDB,
      fsGetUserData,
      // ---- FUNCTIONS ----
      fbTranslate,
      fbTranslateMeal,
      fbTranslateBranchDesc,
      // ---- STORAGE ----
      fsGetImgDownloadUrl,
      // ---- BRANCHES ----
      fsGetBranch,
      fsGetAllBranches,
      fsAddNewBranch,
      fsDeleteBranch,
      // ---- TABLES ----
      fsAddBatchTablesToBranch,
      fsDeleteTable,
      fsGetBranchTablesCount,
      fsGetBranchTables,
      fsUpdateBranchTable,
      fsGetTableInfo,
      fsChangeMenuForAllTables,
      // ---- ORDERS ----
      fsGetAllOrders,
      fsGetAllTableOrders,
      // ---- MENU SECTIONS ----
      fsAddSection,
      fsUpdateSection,
      fsGetSections,
      fsGetSection,
      fsAddMealToMenuSelectedMeals,
      fsRemoveMealFromMenuSelectedMeals,
      fsDeleteAllSections,
      fsDeleteSection,
      fsRemoveSectionMealsFromMenuSelectedMeals,
      fsUpdateSectionTitle,
      fsUpdateSectionOrder,
      fsUpdateSectionTranslation,
      fsUpdateSectionVisibility,
      fsUpdateSectionVisibilityDateTimeRange,
      deleteMenu,
      // ---- MENU ----
      fsGetAllMenus,
      fsGetMenu,
      fsAddNewMenu,
      fsUpdateMenu,
      fsEmptyMenuSelectedMeals,
      fsDocSnapshot,
      // ---- MEALS ----
      fsGetAllMeals,
      fsGetMeal,
      fsDeleteMeal,
      fsAddNewMeal,
      fsUpdateMeal,
      fsGetAllMetaTags,
      fsUpdateAllMetaTags,
      fsUpdateMealMetaTags,
      fsRemoveTagFromAllMeals,
      // ---- QR Menu ----
      fsConfirmCartOrder,
      fsUpdateScanLog,
      fsAddMealToCart,
      fsRemoveMealFromCart,
      fsOrdersSnapshot,
      fsInitiateNewOrder,
      // ---- Waiter ----
      fsGetWaiterLogin,
      fsWaiterTablesSnapshot,
      fsUpdateOrderStatus,
      fsCancelOrder,
      fsOrderIsPaid,
      fsGetWaitersList,
      fsUpdateWaiterInfo,
      fsDeleteWaiter,
      // ---- RTD ----
      dataSnapshotListener,
      docSnapshot,
      // ---- NO SIGNED IN ----
      fsGetAllMealsOFF,
      fsSendEmail,
      fsSendSMS,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
