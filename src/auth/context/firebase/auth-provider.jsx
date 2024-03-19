/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-shadow */
import PropTypes from 'prop-types';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useMemo, useState, useEffect, useReducer, useCallback } from 'react';
import {
  ref,
  listAll,
  getStorage,
  deleteObject,
  getDownloadURL,
  uploadBytesResumable,
} from 'firebase/storage';
import {
  getAuth,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
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
  increment,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  collection,
  getFirestore,
  collectionGroup,
  getCountFromServer,
} from 'firebase/firestore';

import { FIREBASE_API } from 'src/config-global';

import { AuthContext } from './auth-context';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const THIS_MONTH = new Date().getMonth();
const THIS_YEAR = new Date().getFullYear();

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  return state;
};

const firebaseApp = initializeApp(FIREBASE_API);
const AUTH = getAuth(firebaseApp);
const DB = getFirestore(firebaseApp);
const STORAGE = getStorage(firebaseApp);
const FUNCTIONS = getFunctions(firebaseApp);

AuthProvider.propTypes = {
  children: PropTypes.node,
};

const BUCKET = 'menu-app-b268b';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [orderSnapShot, setOrderSnapShot] = useState({});
  const [activeOrders, setActiveOrders] = useState([]);
  const [menuSections, setMenuSections] = useState([]);
  const [staff, setStaff] = useState({});

  const checkAuthenticated = state.user?.emailVerified ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const initialize = useCallback(() => {
    try {
      onAuthStateChanged(AUTH, async (user) => {
        if (user) {
          if (user.emailVerified) {
            const userProfile = doc(DB, 'users', user.uid);
            const docSnap = await getDoc(userProfile);
            const profile = docSnap.data();

            if (!profile) {
              await setDoc(userProfile, { uid: user.uid, email: user.email, role: 'user' });
            }

            await updateDoc(userProfile, { lastLogin: new Date() });

            dispatch({
              type: 'INITIAL',
              payload: {
                user: {
                  ...user,
                  ...profile,
                  id: user.uid,
                },
              },
            });
          } else {
            dispatch({
              type: 'INITIAL',
              payload: {
                user: null,
              },
            });
          }
        } else {
          dispatch({
            type: 'INITIAL',
            payload: {
              user: null,
            },
          });
        }
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, []);
  useEffect(() => {
    initialize();
  }, [initialize]);
  // LOGIN
  const login = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(AUTH, email, password);
  }, []);
  // UPDATE USER PROFILE
  const updateUserProfile = useCallback(async (displayName) => {
    const userProfile = await updateProfile(AUTH.currentUser, { displayName });
    return userProfile;
  }, []);
  // REGISTER
  const register = useCallback(async (email, password, displayName) => {
    // ONLY ALLOW KOJAK DOMAIN TO REGISTER
    const newUser = await createUserWithEmailAndPassword(AUTH, email, password);
    await sendEmailVerification(newUser.user);

    const userProfile = doc(collection(DB, 'users'), newUser.user?.uid);

    await setDoc(userProfile, {
      uid: newUser.user?.uid,
      displayName,
      email,
      allowedPaths: ['/dashboard/analytics'],
      role: 'user',
      password,
    });
  }, []);
  // LOGOUT
  const logout = useCallback(async () => {
    await signOut(AUTH);
  }, []);
  // FORGOT PASSWORD
  const forgotPassword = useCallback(async (email) => {
    if (!email.endsWith('@kojak-group.com')) throw new Error('Email Domain Not Allowed !!');
    await sendPasswordResetEmail(AUTH, email);
  }, []);
  const updateUserAccessPaths = useCallback(async (userID, allowedPaths) => {
    const docRef = doc(DB, `/users/${userID}`);
    await updateDoc(docRef, { allowedPaths });
  }, []);
  const fsGetUser = useCallback(async (userID) => {
    try {
      const docRef = doc(DB, `/users/${userID}`);
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.data()) throw Error('No User Was Returned !!');
      return docSnapshot.data();
    } catch (error) {
      throw error;
    }
  }, []);
  const fsGetUsers = useCallback(async () => {
    const docRef = collection(DB, '/users');
    const queryRef = query(docRef);
    const querySnapshot = await getDocs(queryRef);
    const documents = [];
    querySnapshot.forEach((element) => {
      documents.push(element.data());
    });

    return documents.filter((user) => user.email !== 'hussam@hotmail.co.uk');
  }, []);
  // ------------------------- Firebase Functions -----------------
  const fbTranslate = httpsCallable(FUNCTIONS, 'fbTranslateSectionTitle');
  const fbTranslateMeal = httpsCallable(FUNCTIONS, 'fbTranslateMeal');
  const fbTranslateBranchDesc = httpsCallable(FUNCTIONS, 'fbTranslateBranchDesc');
  // ------------------------ Image Handiling ----------------------
  const fsGetImgDownloadUrl = useCallback(async (bucketPath, imgID) => {
    // eslint-disable-next-line no-useless-catch
    try {
      return await getDownloadURL(ref(STORAGE, `gs://${bucketPath}${imgID}`));
    } catch (error) {
      throw error;
    }
  }, []);
  const fsGetFolderImages = useCallback(async (bucket, folderID) => {
    const listRef = ref(STORAGE, `gs://${bucket}/${folderID}`);
    const imagesList = await listAll(listRef);
    const imagesUrl = await Promise.all(
      imagesList.items.map(async (imageRef) => getDownloadURL(ref(STORAGE, imageRef)))
    );
    const thumbnail = imagesUrl.filter((url) => url.includes('200x200'));
    const largeImage = imagesUrl.filter((url) => url.includes('1920x1080'));
    return [thumbnail, largeImage];
  }, []);
  const fsDeleteImage = useCallback(async (bucketPath, imgID) => {
    const storageRef = ref(STORAGE, `gs://${bucketPath}${imgID}`);
    deleteObject(storageRef)
      .then(() => {
        console.log('Image deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting image:', error);
      });
  }, []);
  const fsUploadMultipleImages = useCallback(async (bucketPath, image) => {
    const storageRef = ref(STORAGE, `gs://${bucketPath}`);

    const uploadPromises = new Promise((resolve, reject) => {
      const imageRef = ref(storageRef, image.path);
      const uploadTask = uploadBytesResumable(imageRef, image);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log(`${percent}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          resolve();
        }
      );
    });

    try {
      // await Promise.all(uploadPromises);
      return uploadPromises;
    } catch (error) {
      // Handle errors during uploads
      console.error('Upload error:', error);
      throw error;
    }
  }, []);
  // ----------------------- Tables -----------------------------
  const fsUpdateTable = useCallback(async (docPath, payload) => {
    const docRef = doc(DB, docPath);
    await updateDoc(docRef, payload);
  }, []);
  const fsAddBatchTablesToBranch = useCallback(
    async (branchID, menuID) => {
      const MAX_ALLOWED_USER_TABLES = 5;
      const batch = writeBatch(DB);

      for (let index = 1; index <= MAX_ALLOWED_USER_TABLES; index += 1) {
        const newDocRef = doc(
          collection(DB, `/users/${state.user.id}/branches/${branchID}/tables`)
        );
        batch.set(newDocRef, {
          docID: newDocRef.id,
          userID: state.user.id,
          menuID,
          branchID,
          isActive: true,
          title: `Table ${index}`,
          note: '',
          index,
        });
      }

      await batch.commit();
    },
    [state]
  );
  const fsGetTableInfo = useCallback(async (userID, branchID, tableID) => {
    try {
      const docRef = query(
        collectionGroup(DB, 'tables'),
        where('userID', '==', userID),
        where('branchID', '==', branchID),
        where('docID', '==', tableID)
      );
      const querySnapshot = await getDocs(docRef);
      const dataArr = [];
      querySnapshot.forEach((doc) => dataArr.push(doc.data()));
      return dataArr[0];
    } catch (error) {
      throw error;
    }
  }, []);
  const fsChangeMenuForAllTables = useCallback(
    async (branchID, menuID) => {
      const docsRef = query(
        collectionGroup(DB, 'tables'),
        where('userID', '==', state.user.id),
        where('branchID', '==', branchID)
      );
      const snapshot = await getDocs(docsRef);

      const batch = writeBatch(DB);
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { menuID });
      });

      await batch.commit();
    },
    [state]
  );
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
  const fsUpdateBranchTable = useCallback(
    async (branchID, tableID, value) => {
      const docRef = doc(DB, `/users/${state.user.id}/branches/${branchID}/tables/${tableID}`);
      await updateDoc(docRef, value);
    },
    [state]
  );
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
  // ------------------------ Orders -----------------------------
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
  // ----------------------- Branches ----------------------------
  const fsGetAllBranches = useCallback(async () => {
    const docRef = query(
      collectionGroup(DB, 'branches'),
      where('userID', '==', state.user.id)
      // where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(docRef);
    const dataArr = [];
    const asyncOperations = [];

    querySnapshot.forEach((element) => {
      const asyncOperation = async () => {
        const bucket = `menu-app-b268b/${state.user.id}/branches/${element.data().docID}/`;
        const imgUrl = await fsGetImgDownloadUrl(bucket, `cover_200x200.webp`);

        dataArr.push({ ...element.data(), imgUrl });
      };
      asyncOperations.push(asyncOperation());
    });

    await Promise.all(asyncOperations);

    return dataArr;
  }, [state]);
  const fsGetBranch = useCallback(
    async (branchID, userID = state.user.id) => {
      try {
        const docRef = doc(DB, `/users/${userID}/branches/${branchID}/`);
        const docSnap = await getDoc(docRef);

        if (docSnap.data().translation === '') throw new Error('No Translation Found !!');

        const bucketPath = `${BUCKET}/${userID}/branches/${branchID}/`;
        const imgUrl = await fsGetImgDownloadUrl(bucketPath, 'cover_800x800.webp');

        return {
          ...docSnap.data(),
          lastUpdatedAt: new Date(docSnap.data().lastUpdatedAt.seconds * 1000).toDateString(),
          cover: `${imgUrl}?${Date.now()}`,
        };
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsAddNewBranch = useCallback(
    async (branchData) => {
      const newDocRef = doc(collection(DB, `users/${state.user.id}/branches/`));
      const { cover: imageFile, ...documentData } = branchData;
      await setDoc(newDocRef, {
        ...documentData,
        docID: newDocRef.id,
        userID: state.user.id,
        lastUpdatedBy: state.user.id,
        lastUpdatedAt: new Date(),
      });

      fbTranslateBranchDesc({
        branchRef: newDocRef.path,
        text: { description: documentData.description },
        userID: state.user.id,
      });

      const storageRef = ref(
        STORAGE,
        `gs://menu-app-b268b/${state.user.id}/branches/${newDocRef.id}/`
      );

      if (imageFile) {
        console.log(imageFile);
        const imageRef = ref(storageRef, 'cover.jpg');
        const uploadTask = uploadBytesResumable(imageRef, imageFile);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            console.log(snapshot);
          },
          (error) => {
            console.log(error);
          },
          () => {
            console.log('UPLOADED');
          }
        );
      }
    },
    [state]
  );
  const fsUpdateBranch = useCallback(
    async (branchData, shouldUpdateCover = false) => {
      const docRef = doc(DB, `/users/${state.user.id}/branches/${branchData.docID}`);
      const { cover: imageFile, ...documentData } = branchData;
      await updateDoc(docRef, {
        ...documentData,
        lastUpdatedBy: state.user.id,
        lastUpdatedAt: new Date(),
      });

      if (branchData.translation === '')
        fbTranslateBranchDesc({
          branchRef: docRef.path,
          text: { description: documentData.description },
          userID: state.user.id,
        });

      if (shouldUpdateCover) {
        const storageRef = ref(
          STORAGE,
          `gs://menu-app-b268b/${state.user.id}/branches/${branchData.docID}/`
        );

        const imageRef = ref(storageRef, 'cover.jpg');
        const uploadTask = uploadBytesResumable(imageRef, imageFile);
        uploadTask.on(
          'state_changed',
          (snapshot) => {},
          (error) => {},
          () => {}
        );
      }
    },
    [state]
  );
  const fsDeleteBranch = useCallback(
    async (branchID) => {
      const docRef = doc(DB, `/users/${state.user.id}/branches/${branchID}`);
      await deleteDoc(docRef);

      const storageRef = ref(STORAGE, `gs://menu-app-b268b/${state.user.id}/branches/${branchID}/`);
      const files = await listAll(storageRef);
      files.items.forEach((file) => {
        deleteObject(file);
      });
    },
    [state]
  );
  // ------------------------- Menu --------------------------------
  const fsGetMenu = useCallback(
    async (menuID, userID = state.user.id) => {
      const docRef = doc(DB, `/users/${userID}/menus/${menuID}/`);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    },
    [state]
  );
  const fsGetAllMenus = useCallback(async () => {
    const docRef = query(
      collectionGroup(DB, 'menus'),
      where('userID', '==', state.user.id),
      where('isDeleted', '==', false)
    );

    const dataArr = [];
    const querySnapshot = await getDocs(docRef);
    querySnapshot.forEach((doc) =>
      dataArr.push({
        ...doc.data(),
        lastUpdatedAt: `${new Date(
          doc.data().lastUpdatedAt.seconds * 1000
        ).toDateString()} | ${new Date(
          doc.data().lastUpdatedAt.seconds * 1000
        ).toLocaleTimeString()}`,
      })
    );
    return dataArr;
  }, [state]);
  const fsAddNewMenu = useCallback(
    async (data) => {
      const newDocRef = doc(collection(DB, `/users/${state.user.id}/menus/`));
      setDoc(newDocRef, {
        ...data,
        docID: newDocRef.id,
        userID: state.user.id,
        isActive: true,
        isDeleted: false,
        lastUpdatedAt: new Date(),
        lastUpdateBy: state.user.id,
      });
      return newDocRef.id;
    },
    [state]
  );
  const fsUpdateMenu = useCallback(
    async (data) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${data.docID}`);
      await updateDoc(docRef, {
        ...data,
        lastUpdatedAt: new Date(),
        lastUpdateBy: state.user.id,
      });
    },
    [state]
  );
  const fsDeleteMenu = useCallback(
    async (docID) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${docID}`);
      await deleteDoc(docRef);
    },
    [state]
  );
  // --------------------- Menu Sections --------------------------
  const fsAddSection = useCallback(
    async (menuID, title, order) => {
      const userID = state.user.id;
      const newDocRef = doc(collection(DB, `/users/${userID}/menus/${menuID}/sections`));
      await setDoc(newDocRef, {
        docID: newDocRef.id,
        menuID,
        userID,
        title,
        meals: [],
        order,
        isActive: false,
      });

      fbTranslate({
        sectionRef: `/users/${userID}/menus/${menuID}/sections/${newDocRef.id}`,
        text: title,
      });

      return newDocRef.id;
    },
    [state]
  );
  const fsGetSections = useCallback(
    async (menuID, userID = state.user.id) => {
      const docRef = query(
        collectionGroup(DB, 'sections'),
        where('userID', '==', userID),
        where('menuID', '==', menuID)
      );

      console.log(menuSections);

      const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
        const sectionsArray = [];
        querySnapshot.forEach((doc) => sectionsArray.push(doc.data()));
        setMenuSections(sectionsArray);
      });

      return unsubscribe;
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
  const fsUpdateSection = useCallback(
    async (menuID, sectionID, payload) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}/`);
      await updateDoc(docRef, payload);
    },
    [state]
  );
  const fsUpdateSectionTitle = useCallback(
    async (menuID, sectionID, payload) => {
      console.log({ menuID, sectionID, payload });
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}/`);
      await updateDoc(docRef, payload);

      fbTranslate({
        sectionRef: `/users/${state.user.id}/menus/${menuID}/sections/${docRef.id}`,
        text: payload.title,
      });
    },
    [state]
  );
  const fsGetSection = useCallback(
    async (menuID, sectionID) => {
      try {
        const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/sections/${sectionID}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.data().translation === '') throw Error('No Translation Available !!');

        return docSnap.data();
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsUpdateSectionsOrder = useCallback(
    async (
      menuID,
      clickedSectionID,
      clickedSectionOrder,
      affectedSectionID,
      affectedSectionNewOrder
    ) => {
      try {
        const batch = writeBatch(DB);
        const docRef = doc(
          DB,
          `/users/${state.user.id}/menus/${menuID}/sections/${clickedSectionID}/`
        );
        batch.update(docRef, { order: clickedSectionOrder });

        const affectedSectionDocRef = doc(
          DB,
          `/users/${state.user.id}/menus/${menuID}/sections/${affectedSectionID}/`
        );
        batch.update(affectedSectionDocRef, { order: affectedSectionNewOrder });

        await batch.commit();
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsGetSectionMeals = useCallback(async (userID, sectionMeals, size = '800x800') => {
    const docRef = query(
      collectionGroup(DB, 'meals'),
      where('userID', '==', userID),
      where('docID', 'in', sectionMeals)
      // where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(docRef);
    const dataArr = [];
    const asyncOperations = [];

    querySnapshot.forEach((element) => {
      const asyncOperation = async () => {
        const bucket = `menu-app-b268b/${userID}/meals/${element.data().docID}/`;
        const cover = await fsGetImgDownloadUrl(bucket, `${element.data().docID}_${size}.webp`);

        dataArr.push({ ...element.data(), cover });
      };
      asyncOperations.push(asyncOperation());
    });

    await Promise.all(asyncOperations);

    return dataArr;
  }, []);
  const fsEmptyMenuSelectedMeals = useCallback(
    async (menuID) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/${menuID}/`);
      await updateDoc(docRef, { meals: [] });
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
  const deleteMenu = useCallback(
    async (menuID) => {
      const docRef = doc(DB, `/users/${state.user.id}/menus/`, menuID);
      await deleteDoc(docRef);
    },
    [state]
  );
  // ------------------------- Meals --------------------------------
  const fsAddNewMeal = useCallback(
    async (mealInfo) => {
      const newDocRef = doc(collection(DB, `/users/${state.user.id}/meals/`));
      const date = new Date();
      const dateTime = date.toDateString();
      const { imageFile, cover, ...mealData } = mealInfo;
      setDoc(newDocRef, {
        ...mealData,
        docID: newDocRef.id,
        lastUpdatedAt: dateTime,
        userID: state.user.id,
        isDeleted: false,
      });

      fbTranslateMeal({
        mealRef: `/users/${state.user.id}/meals/${newDocRef.id}`,
        text: { title: mealInfo.title, desc: mealInfo.description },
        userID: state.user.id,
      });

      const storageRef = ref(
        STORAGE,
        `gs://menu-app-b268b/${state.user.id}/meals/${newDocRef.id}/`
      );

      const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.') + 1);

      if (imageFile) {
        const imageRef = ref(storageRef, `${newDocRef.id}.${fileExtension}`);
        const uploadTask = uploadBytesResumable(imageRef, imageFile);
        uploadTask.on(
          'state_changed',
          (snapshot) => {},
          (error) => {},
          () => {}
        );
      }
      return newDocRef.id;
    },
    [state]
  );
  const fsUpdateMeal = useCallback(
    async (payload, imageIsDirty) => {
      try {
        const { imageFile, cover, ...mealData } = payload;
        const docRef = doc(DB, `/users/${state.user.id}/meals/${payload.docID}/`);
        await updateDoc(docRef, mealData);

        const storageRef = ref(
          STORAGE,
          `gs://menu-app-b268b/${state.user.id}/meals/${payload.docID}/`
        );

        if (imageFile && imageIsDirty) {
          const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.') + 1);
          const imageRef = ref(storageRef, `${payload.docID}.${fileExtension}`);

          const uploadTask = uploadBytesResumable(imageRef, imageFile);
          uploadTask.on(
            'state_changed',
            (snapshot) => {},
            (error) => {},
            () => {}
          );
        }

        if (payload.translation === '' && payload.translationEdited === '')
          console.log('TRANSLATE');
        fbTranslateMeal({
          mealRef: `/users/${state.user.id}/meals/${payload.docID}`,
          text: { title: payload.title, desc: payload.description },
          userID: state.user.id,
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    [state]
  );
  const fsGetAllMeals = useCallback(async () => {
    const docRef = query(
      collectionGroup(DB, 'meals'),
      where('userID', '==', state.user.id)
      // where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(docRef);
    const dataArr = [];
    const asyncOperations = [];

    querySnapshot.forEach((element) => {
      const asyncOperation = async () => {
        const bucket = `menu-app-b268b/${state.user.id}/meals/${element.data().docID}/`;
        const cover = await fsGetImgDownloadUrl(bucket, `${element.data().docID}_200x200.webp`);

        dataArr.push({ ...element.data(), cover });
      };
      asyncOperations.push(asyncOperation());
    });

    await Promise.all(asyncOperations);

    return dataArr;
  }, [state]);
  const fsGetMeal = useCallback(
    async (mealID, size = '800x800') => {
      try {
        const docRef = doc(DB, `/users/${state.user.id}/meals/${mealID}/`);
        const docSnap = await getDoc(docRef);

        const bucketPath = `${BUCKET}/${state.user.id}/meals/${mealID}/`;
        const imgUrl = await fsGetImgDownloadUrl(bucketPath, `${mealID}_${size}.webp`);

        if (docSnap.data().translation === '' || docSnap?.data()?.translation === undefined)
          throw new Error('NO Translation Found!!');

        return {
          ...docSnap.data(),
          cover: `${imgUrl}?${Date.now()}`,
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    [state]
  );
  const fsDeleteMeal = useCallback(
    async (mealID) => {
      try {
        const docRef = doc(DB, `/users/${state.user.id}/meals/`, mealID);
        await deleteDoc(docRef);

        const bucketPath = `${BUCKET}/${state.user.id}/meals/${mealID}/`;
        await fsDeleteImage(bucketPath, `${mealID}_200x200.webp`);
        await fsDeleteImage(bucketPath, `${mealID}_800x800.webp`);
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsGetMealLabels = useCallback(
    async (userID = state?.user?.id) => {
      try {
        const dataArr = [];
        const docRef = query(collectionGroup(DB, 'meal-labels'), where('userID', '==', userID));
        const querySnapshot = await getDocs(docRef);
        querySnapshot.forEach((doc) => {
          dataArr.push(doc.data());
        });
        return dataArr;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    [state]
  );
  const fsAddNewMealLabel = useCallback(
    async (title) => {
      const docRef = doc(collection(DB, `/users/${state.user.id}/meal-labels/`));
      await setDoc(docRef, { title, isActive: true, userID: state.user.id, docID: docRef.id });
    },
    [state]
  );
  const updatedAffectedMeals = useCallback(
    async (mealLabelID) => {
      const mealRef = query(
        collectionGroup(DB, 'meals'),
        where('userID', '==', state.user.id),
        where('mealLabels', 'array-contains', mealLabelID)
      );
      const querySnapshot = await getDocs(mealRef);
      const asyncOperations = [];
      const affectedMealsIDs = [];

      querySnapshot.forEach((mealDoc) => {
        const asyncOperation = async () => {
          const { mealLabels } = mealDoc.data();
          const updatedMealLabels = mealLabels.filter((mealID) => mealID !== mealLabelID);
          await updateDoc(mealDoc.ref, { mealLabels: [...updatedMealLabels] });
          affectedMealsIDs.push(mealDoc.data().docID);
        };
        asyncOperations.push(asyncOperation());
      });

      await Promise.all(asyncOperations);
      return affectedMealsIDs;
    },
    [state]
  );
  const fsUpdateMealLabel = useCallback(
    async (payload) => {
      try {
        const docRef = doc(DB, `/users/${state.user.id}/meal-labels/${payload.docID}/`);
        await updateDoc(docRef, payload);

        return updatedAffectedMeals(payload.docID);
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsDeleteMealLabel = useCallback(
    async (mealLabelID) => {
      try {
        const labelRef = doc(DB, `/users/${state.user.id}/meal-labels/${mealLabelID}/`);
        await deleteDoc(labelRef);

        return updatedAffectedMeals(mealLabelID);
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    [state]
  );
  // -------------------------- QR Menu - Cart -----------------------------------
  const fsInitiateNewOrder = useCallback(async (payload) => {
    const { tableID, menuID, staffID, userID, branchID } = payload;

    const existingDocRef = query(
      collectionGroup(DB, 'orders'),
      where('userID', '==', userID),
      where('branchID', '==', branchID),
      where('tableID', '==', tableID),
      where('isPaid', '==', false),
      where('isCanceled', '==', false)
    );
    const querySnapshot = await getDocs(existingDocRef);
    // Check if the query snapshot is empty
    if (querySnapshot.empty) {
      const docRef = doc(collection(DB, `/users/${userID}/branches/${branchID}/orders`));
      await setDoc(docRef, {
        docID: docRef.id,
        userID,
        branchID,
        tableID,
        menuID,
        staffID,
        cart: [],
        status: [],
        isInKitchen: [],
        isReadyToServe: [],
        isCanceled: false,
        isPaid: false,
        updateCount: 0,
        initiationTime: new Date(),
        lastUpdate: new Date(),
        sessionExpiryTime: new Date().getTime() + 45 * 60000,
      });
      return docRef.id;
    }
    return null;
  }, []);
  const fsOrderSnapshot = useCallback(async (payload) => {
    const { userID, branchID, tableID, menuID } = payload;

    await fsInitiateNewOrder({
      initiatedBy: 'customer',
      tableID,
      menuID,
      staffID: '',
      userID,
      branchID,
    });

    const docRef = query(
      collectionGroup(DB, 'orders'),
      where('userID', '==', userID),
      where('branchID', '==', branchID),
      where('tableID', '==', tableID),
      where('isPaid', '==', false),
      where('isCanceled', '==', false)
    );

    const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setOrderSnapShot(doc.data());
      });
    });

    return unsubscribe;
  }, []);
  const fsGetActiveOrdersSnapshot = useCallback(async (userID, branchID) => {
    const docRef = query(
      collectionGroup(DB, 'orders'),
      where('userID', '==', userID),
      where('branchID', '==', branchID),
      where('isPaid', '==', false),
      where('isCanceled', '==', false)
    );

    const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
      const tablesArray = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists()) {
          tablesArray.push(doc.data());
        }
      });
      setActiveOrders(tablesArray);
    });

    return unsubscribe;
  }, []);
  const fsUpdateCart = useCallback(async (payload) => {
    const { orderID, userID, branchID, cart } = payload;
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/orders/${orderID}`);

    updateDoc(docRef, { cart });
    // if (resetStatus) updateDoc(docRef, { status: { ...status, ready: '', collected: '', kitchen: '' } });
  }, []);
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
  const fsRemoveMealFromCart = useCallback(async (payload) => {
    const { orderID, userID, branchID, cart } = payload;
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/orders/${orderID}`);
    await updateDoc(docRef, { cart });
  }, []);
  const fsUpdateOrderStatus = useCallback(async (payload) => {
    const { orderID, toUpdateFields, userID, branchID } = payload;
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/orders/${orderID}`);
    updateDoc(docRef, toUpdateFields);
  }, []);
  const fsOrderIsPaid = useCallback(async (payload) => {
    const { orderID, userID, branchID, status } = payload;
    const docRef = doc(DB, `/users/${userID}/branches/${branchID}/orders/${orderID}`);

    await updateDoc(docRef, { isPaid: true, status });
  }, []);
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
  // ------------------ STAFF ----------------------------------
  const fsGetStaffInfo = useCallback(async (userID, staffID) => {
    try {
      const docRef = doc(DB, `/users/${userID}/staff/${staffID}/`);
      const docSnap = await getDoc(docRef);

      return docSnap.data();
    } catch (error) {
      throw error;
    }
  }, []);
  const fsGetStaffLogin = useCallback(async (userID, staffID, passCode) => {
    try {
      const docRef = query(
        collectionGroup(DB, 'staff'),
        where('userID', '==', userID),
        where('docID', '==', staffID),
        where('passCode', '==', passCode),
        where('isActive', '==', true)
      );

      const length = await getCountFromServer(docRef);

      if (length.data().count === 0) throw Error('Nothing was returned!');

      const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          setStaff(doc.data());
        });
      });

      return unsubscribe;
    } catch (error) {
      throw error;
    }
  }, []);
  const fsUpdateStaffInfo = useCallback(
    async (userID, staffID, payload) => {
      const waiterDocRef = doc(DB, `/users/${userID}/staff/${staffID}`);
      await updateDoc(waiterDocRef, payload);
    },
    [state]
  );
  const fsGetStaffList = useCallback(
    async (branchID) => {
      const docRef = query(
        collectionGroup(DB, 'staff'),
        where('userID', '==', state.user.id),
        where('branchID', '==', branchID)
      );

      const dataArr = [];
      const querySnapshot = await getDocs(docRef);
      querySnapshot.forEach((doc) => {
        dataArr.push(doc.data());
      });
      return dataArr;
    },
    [state]
  );
  const fsAddNewStaff = useCallback(
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
  const fsDeleteStaff = useCallback(
    async (payload) => {
      const waiterDocRef = doc(DB, `/users/${state.user.id}/staff/${payload}`);
      await deleteDoc(waiterDocRef);
    },
    [state]
  );
  // ------------------------------------------------------------

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'firebase',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      login,
      register,
      logout,
      fsGetUser,
      staff,
      setStaff,
      // ---- GENERIC ----
      fsUpdateTable,
      // fsQueryDoc,
      // fsAddToDB,
      // fsRemoveFromDB,
      // Timestamp,
      // fsGetUserData,
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
      fsUpdateBranch,
      fsDeleteBranch,
      // ---- TABLES ----
      fsAddBatchTablesToBranch,
      fsGetBranchTablesCount,
      fsGetBranchTables,
      fsUpdateBranchTable,
      fsChangeMenuForAllTables,
      fsGetAllTableOrders,
      // fsDeleteTable,
      fsGetTableInfo,
      // // ---- ORDERS ----
      fsInitiateNewOrder,
      fsOrderSnapshot,
      fsGetActiveOrdersSnapshot,
      orderSnapShot,
      activeOrders,
      // fsGetAllOrders,
      // // ---- MENU SECTIONS ----
      menuSections,
      setMenuSections,
      fsAddSection,
      fsUpdateSection,
      fsGetSections,
      fsGetSection,
      fsUpdateSectionsOrder,
      fsGetSectionMeals,
      fsDeleteSection,
      fsUpdateSectionTitle,
      // fsAddMealToMenuSelectedMeals,
      // fsRemoveMealFromMenuSelectedMeals,
      // fsDeleteAllSections,
      // fsRemoveSectionMealsFromMenuSelectedMeals,
      // fsUpdateSectionOrder,
      // fsUpdateSectionTranslation,
      // fsUpdateSectionVisibility,
      // fsUpdateSectionVisibilityDateTimeRange,
      // deleteMenu,
      // // ---- MENU ----
      fsGetAllMenus,
      fsGetMenu,
      fsAddNewMenu,
      fsUpdateMenu,
      fsDeleteMenu,
      // fsEmptyMenuSelectedMeals,
      // // ---- MEALS ----
      fsGetAllMeals,
      fsGetMeal,
      fsDeleteMeal,
      fsAddNewMeal,
      fsUpdateMeal,
      // fsDocSnapshot,
      fsGetMealLabels,
      fsAddNewMealLabel,
      fsUpdateMealLabel,
      fsDeleteMealLabel,
      // fsUpdateAllMetaTags,
      // fsUpdateMealMetaTags,
      // fsRemoveTagFromAllMeals,
      // // ---- QR Menu ----
      // fsConfirmCartOrder,
      // fsUpdateScanLog,
      fsUpdateCart,
      fsRemoveMealFromCart,
      // fsOrdersSnapshot,
      // fsInitiateNewOrder,
      // // ---- Waiter ----
      fsGetStaffLogin,
      fsGetStaffInfo,
      // fsWaiterTablesSnapshot,
      fsUpdateOrderStatus,
      // fsCancelOrder,
      fsOrderIsPaid,
      // fsAddNewStaff,
      fsGetStaffList,
      fsUpdateStaffInfo,
      // fsDeleteStaff,
      // // ---- RTD ----
      // dataSnapshotListener,
      // docSnapshot,
      // // ---- NO SIGNED IN ----
      // fsGetAllMealsOFF,
      // fsSendEmail,
      // fsSendSMS,
    }),
    [
      state.isAuthenticated,
      state.isInitialized,
      state.user,
      login,
      register,
      logout,
      fsGetUser,
      staff,
      setStaff,
      // ---- GENERIC ----
      fsUpdateTable,
      // fsQueryDoc,
      // fsAddToDB,
      // fsRemoveFromDB,
      // fsGetUserData,
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
      fsUpdateBranch,
      fsDeleteBranch,
      // ---- TABLES ----
      fsAddBatchTablesToBranch,
      // fsDeleteTable,
      fsGetBranchTablesCount,
      fsGetBranchTables,
      fsUpdateBranchTable,
      fsGetTableInfo,
      fsChangeMenuForAllTables,
      // // ---- ORDERS ----
      fsInitiateNewOrder,
      fsOrderSnapshot,
      fsGetActiveOrdersSnapshot,
      orderSnapShot,
      activeOrders,
      // fsGetAllOrders,
      fsGetAllTableOrders,
      // // ---- MENU SECTIONS ----
      fsAddSection,
      fsUpdateSection,
      fsGetSections,
      fsGetSection,
      fsUpdateSectionsOrder,
      fsGetSectionMeals,
      // fsAddMealToMenuSelectedMeals,
      // fsRemoveMealFromMenuSelectedMeals,
      // fsDeleteAllSections,
      fsDeleteSection,
      // fsRemoveSectionMealsFromMenuSelectedMeals,
      fsUpdateSectionTitle,
      // fsUpdateSectionOrder,
      // fsUpdateSectionTranslation,
      // fsUpdateSectionVisibility,
      // fsUpdateSectionVisibilityDateTimeRange,
      // deleteMenu,
      // // ---- MENU ----
      fsGetAllMenus,
      fsGetMenu,
      fsAddNewMenu,
      fsUpdateMenu,
      fsDeleteMenu,
      // fsEmptyMenuSelectedMeals,
      // fsDocSnapshot,
      // // ---- MEALS ----
      fsGetAllMeals,
      fsGetMeal,
      fsDeleteMeal,
      fsAddNewMeal,
      fsUpdateMeal,
      fsGetMealLabels,
      fsAddNewMealLabel,
      fsUpdateMealLabel,
      fsDeleteMealLabel,
      // fsUpdateAllMetaTags,
      // fsUpdateMealMetaTags,
      // fsRemoveTagFromAllMeals,
      // // ---- QR Menu ----
      // fsConfirmCartOrder,
      // fsUpdateScanLog,
      fsUpdateCart,
      fsRemoveMealFromCart,
      // fsOrdersSnapshot,
      // fsInitiateNewOrder,
      // // ---- Waiter ----
      fsGetStaffLogin,
      fsGetStaffInfo,
      // fsWaiterTablesSnapshot,
      fsUpdateOrderStatus,
      // fsCancelOrder,
      fsOrderIsPaid,
      fsGetStaffList,
      fsUpdateStaffInfo,
      // fsDeleteStaff,
      // // ---- RTD ----
      // dataSnapshotListener,
      // docSnapshot,
      // // ---- NO SIGNED IN ----
      // fsGetAllMealsOFF,
      // fsSendEmail,
      // fsSendSMS,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
