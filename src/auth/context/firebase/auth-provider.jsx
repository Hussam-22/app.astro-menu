/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-shadow */
import PropTypes from 'prop-types';
import { initializeApp } from 'firebase/app';
import { useQuery } from '@tanstack/react-query';
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
import {
  DEFAULT_STAFF,
  DEFAULT_MENUS,
  DEFAULT_MEALS,
  DEFAULT_LABELS,
  DEFAULT_BRANCHES,
  DEFAULT_MENU_SECTIONS,
} from 'src/_mock/business-profile-default-values';

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
  businessProfile: null,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
      businessProfile: action.payload.businessProfile,
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
  const [branchSnapshot, setBranchSnapshot] = useState({});
  const [staff, setStaff] = useState({});

  const checkAuthenticated = state.user?.emailVerified ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const { error } = useQuery({
    queryKey: ['businessProfile', state.user?.businessProfileID],
    queryFn: () => fsGetBusinessProfile(state.user?.businessProfileID),
  });

  const initialize = useCallback(() => {
    try {
      onAuthStateChanged(AUTH, async (user) => {
        if (user) {
          if (user.emailVerified) {
            const userProfile = doc(DB, 'users', user.uid);
            const docSnap = await getDoc(userProfile);
            const profile = docSnap.data();

            // create user profile (first time)
            if (!profile) {
              await setDoc(userProfile, { uid: user.uid, email: user.email, role: 'user' });
            }

            // update user last login time.
            await updateDoc(userProfile, { lastLogin: new Date() });

            dispatch({
              type: 'INITIAL',
              payload: {
                user: {
                  ...user,
                  ...profile,
                  id: user.uid,
                },
                businessProfile: state?.businessProfile || {},
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
    const newUser = await createUserWithEmailAndPassword(AUTH, email, password);
    await sendEmailVerification(newUser.user);

    const userProfile = doc(collection(DB, 'users'), newUser.user?.uid);

    await setDoc(userProfile, {
      uid: newUser.user?.uid,
      displayName,
      email,
      role: 'owner',
      password,
      isActive: true,
      lastLogin: new Date(),
    });

    return newUser.user?.uid;
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
    const docRef = collection(DB, 'users');
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
  const fbTranslateMealLabelTitle = httpsCallable(FUNCTIONS, 'fbTranslateMealLabelTitle');
  // ------------------------ Image Handling ----------------------
  const fsGetImgDownloadUrl = useCallback(async (bucketPath, imgID) => {
    // eslint-disable-next-line no-useless-catch
    try {
      return await getDownloadURL(ref(STORAGE, `gs://${BUCKET}/${bucketPath}/${imgID}`));
    } catch (error) {
      throw error;
    }
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
  // ----------------------- Business Profile -------------------
  const fsGetBusinessProfile = useCallback(
    async (businessProfileID) => {
      try {
        const docRef = doc(DB, `/businessProfiles/${businessProfileID}`);
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.data()) throw Error('No Business Profile Was Returned !!');
        const businessOwnerInfo = await fsGetUser(docSnapshot.data().ownerID);

        let logo = docSnapshot.data().logo || null;

        if (!logo) {
          const storageRef = ref(STORAGE, `gs://${BUCKET}/${businessProfileID}/business-profile/`);
          const files = await listAll(storageRef);
          if (files.items.length > 0) {
            const businessLogo = files.items.filter((file) => file.name.includes('800x800'));
            logo = await getDownloadURL(businessLogo[0]);
          }
        }

        dispatch({
          type: 'INITIAL',
          payload: {
            ...state,
            businessProfile: {
              ...docSnapshot.data(),
              logo,
              ownerInfo: businessOwnerInfo,
              role: docSnapshot.data().planInfo.at(-1).isMenuOnly ? 'menuOnly' : 'full',
            },
          },
        });

        return docSnapshot.data();
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsCreateBusinessProfile = useCallback(
    async (data) => {
      try {
        // 1- REGISTER OWNER
        const { email, password, firstName, lastName, ...businessProfileInfo } = data;
        const ownerID = await register?.(email, password, firstName, lastName);

        // 2- CREATE BUSINESS PROFILE
        const newDocRef = doc(collection(DB, `businessProfiles`));
        await setDoc(newDocRef, {
          ...businessProfileInfo,
          defaultLanguage: businessProfileInfo?.defaultLanguage || 'en',
          docID: newDocRef.id,
          ownerID,
          users: [],
          isActive: true,
          createdOn: new Date(),
          logo: await fsGetImgDownloadUrl('_mock', `business_logo_800x800.webp`),
        });

        const businessProfileID = newDocRef.id;

        await fbTranslateBranchDesc({
          title: businessProfileInfo.businessName,
          desc: 'Established in 1950 by Tuscan chef Antonio Rossi, this restaurant has been a beloved downtown landmark, renowned for its authentic Italian cuisine and warm, inviting atmosphere. Now a multi-generational family business, it blends traditional recipes with modern flair, continuing to delight patrons with exceptional dishes sourced from local ingredients.',
          businessProfileID,
        });

        // 3- Update Assign Business-Profile to User
        const userProfile = doc(collection(DB, 'users'), ownerID);
        await updateDoc(userProfile, { businessProfileID });

        // 4- Create Default Data
        await createDefaults(businessProfileID, businessProfileInfo.planInfo);
      } catch (error) {
        console.log(error);
      }
    },
    [state]
  );
  const fsUpdateBusinessProfile = useCallback(
    async (
      payload,
      shouldUpdateTranslation = false,
      isLogoDirty,
      businessProfileID = state?.businessProfile.docID
    ) => {
      try {
        const { languages, logo, ...data } = payload;

        const docRef = doc(DB, `/businessProfiles/${businessProfileID}`);
        await updateDoc(docRef, { ...data, logo: isLogoDirty ? '' : logo });

        const isLanguagesEqual =
          JSON.stringify(payload.languages.sort()) ===
          JSON.stringify(state?.businessProfile.languages.sort());

        if (!isLanguagesEqual) {
          await fsBatchUpdateBusinessProfileLanguages(languages);
        }

        if (isLogoDirty) {
          const storageRef = ref(STORAGE, `gs://${BUCKET}/${businessProfileID}/business-profile/`);
          const imageRef = ref(storageRef, 'logo.jpg');

          if (!logo) {
            const files = await listAll(storageRef);
            files.items.forEach((file) => {
              deleteObject(file);
            });
            return;
          }

          const uploadTask = uploadBytesResumable(imageRef, logo);
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

        if (shouldUpdateTranslation && isLanguagesEqual)
          await fbTranslateBranchDesc({
            title: payload.businessName,
            desc: payload.description,
            businessProfileID,
          });

        dispatch({
          type: 'INITIAL',
          payload: {
            ...state,
            businessProfile: {
              ...state.businessProfile,
              ...payload,
              ownerInfo: state.businessProfile.ownerInfo,
            },
          },
        });
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const createDefaults = useCallback(async (businessProfileID, planInfo) => {
    console.log(businessProfileID);
    const {
      isMenuOnly,
      limits: { branch: branchesCount },
    } = planInfo.at(-1);

    // 1- ADD MEAL LABELS
    const mealLabels = await Promise.all(
      DEFAULT_LABELS.map(async (label) => ({
        id: await fsAddNewMealLabel(label, businessProfileID),
        label,
      }))
    );

    // 2- ADD MEALS
    const meals = await Promise.all(
      DEFAULT_MEALS(businessProfileID)
        // .splice(0, 3)
        .map(async (meal, index) => {
          const modifiedMeal = {
            ...meal,
            cover: await fsGetImgDownloadUrl('_mock/meals', `meal_${index + 1}_800x800.webp`),
            mealLabels: meal.mealLabels.map(
              (label) => mealLabels.find((mealLabel) => mealLabel.label === label)?.id || ''
            ),
          };
          const mealID = await fsAddNewMeal(modifiedMeal, businessProfileID);
          return {
            id: mealID,
            meal,
          };
        })
    );

    // 3- ADD MENUS
    const menus = await Promise.all(
      DEFAULT_MENUS(businessProfileID).map(async (menu) => ({
        id: await fsAddNewMenu(menu, businessProfileID),
        menu,
      }))
    );

    // 3- ADD MENU SECTIONS
    // eslint-disable-next-line no-unused-expressions
    await Promise.all(
      DEFAULT_MENU_SECTIONS.map(async (section, order) => {
        const sectionMeals = meals
          .filter((item) => item.meal.section === section)
          .map((meal) => meal.id);

        menus.map(async (menu) =>
          fsAddSection(menu.id, section, order + 1, businessProfileID, sectionMeals)
        );
      })
    );

    // 4- ADD BRANCHES
    const branches = await Promise.all(
      DEFAULT_BRANCHES(businessProfileID)
        .splice(0, branchesCount > 3 ? 3 : branchesCount)
        .map(async (branch, index) => {
          const modifiedBranch = {
            ...branch,
            cover: await fsGetImgDownloadUrl('_mock/branches', `branch-${index + 1}_800x800.webp`),
          };
          const branchID = await fsAddNewBranch(modifiedBranch, businessProfileID);
          return branchID;
        })
    );

    // 5- ADD STAFF
    let branchIndex = 0;
    // eslint-disable-next-line no-unused-expressions
    !isMenuOnly &&
      (await Promise.all(
        DEFAULT_STAFF(businessProfileID).map(async (staff, index) => {
          if (index === 1 || index === 0) branchIndex = 0;
          if (index === 2 || index === 3) branchIndex = 1;
          if (index === 4 || index === 5) branchIndex = 2;

          const modifiedStaff = {
            ...staff,
            branchID: branches[branchIndex],
          };
          await fsAddNewStaff(modifiedStaff, businessProfileID);
        })
      ));
  }, []);
  const fsBatchUpdateBusinessProfileLanguages = useCallback(
    async (languages, businessProfileID = state.businessProfile.docID) => {
      try {
        // If limit is exceeded throw an error
        if (state?.businessProfile?.translationEditUsage?.THIS_MONTH >= 3)
          throw new Error('Monthly Translation Limit Exceeded !!');
        const promisesArray = [];
        const businessProfileRef = doc(DB, `/businessProfiles/${businessProfileID}`);

        // 1- Add Languages to Business Profile
        await updateDoc(businessProfileRef, { languages });

        // 2- Translate Business Profile
        const businessProfileSnap = await getDoc(businessProfileRef);
        await fbTranslateBranchDesc({
          title: businessProfileSnap.data().businessName,
          desc: businessProfileSnap.data().description,
          businessProfileID,
        });

        // 3- Translate Sections
        const sectionsRef = query(
          collectionGroup(DB, 'sections'),
          where('businessProfileID', '==', businessProfileID)
        );

        const sectionsSnapshot = await getDocs(sectionsRef);
        sectionsSnapshot.forEach((section) => {
          const syncOperation = async () => {
            const { docID, title, businessProfileID, menuID } = section.data();
            promisesArray.push(
              await fbTranslate({
                sectionRef: `/businessProfiles/${businessProfileID}/menus/${menuID}/sections/${docID}`,
                text: title,
              })
            );
          };
          syncOperation();
        });

        // 4- Translate Meals
        const mealsRef = query(
          collectionGroup(DB, 'meals'),
          where('businessProfileID', '==', businessProfileID)
        );

        const mealsSnapshot = await getDocs(mealsRef);
        mealsSnapshot.forEach((meal) => {
          const syncOperation = async () => {
            const { docID, title, description, businessProfileID } = meal.data();
            promisesArray.push(
              await fbTranslateMeal({
                mealRef: `/businessProfiles/${businessProfileID}/meals/${docID}`,
                text: { title, desc: description },
                businessProfileID,
              })
            );
          };
          syncOperation();
        });

        await Promise.allSettled(promisesArray);

        // 5- Increase translation usage limit for this month
        await updateDoc(businessProfileRef, {
          translationEditUsage: {
            ...(state.businessProfile?.translationEditUsage || {}),
            [THIS_MONTH]: (state.businessProfile?.translationEditUsage?.THIS_MONTH ?? 0) + 1,
          },
        });
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  // ----------------------- Tables -----------------------------
  const fsUpdateTable = useCallback(async (docPath, payload) => {
    const docRef = doc(DB, docPath);
    await updateDoc(docRef, payload);
  }, []);
  const fsAddBatchTablesToBranch = useCallback(
    async (branchID, businessProfileID = state.user.businessProfileID) => {
      // Get Business Profile Plan
      const businessProfileDoc = doc(DB, `/businessProfiles/${businessProfileID}`);
      const businessProfileSnap = await getDoc(businessProfileDoc);
      const plans = businessProfileSnap.data().planInfo;
      const MAX_ALLOWED_USER_TABLES = plans.at(-1).limits.tables;

      // Get menus
      const menus = await fsGetAllMenus(businessProfileID);
      const menuID = menus.find((menu) => menu.title === 'Main Menu')?.docID || menus[0].docID;
      const newDocRef = doc(
        collection(DB, `/businessProfiles/${businessProfileID}/branches/${branchID}/tables`)
      );

      if (MAX_ALLOWED_USER_TABLES === 1) {
        await setDoc(newDocRef, {
          docID: newDocRef.id,
          menuID: menuID || '',
          businessProfileID,
          branchID,
          isActive: true,
          title: `Menu View only`,
          note: `This virtual table offers a QR-Menu that exclusively displays your menu. You can utilize this QR menu by showcasing it on your restaurant's front door, allowing customers to easily view your offerings. `,
          index: 0,
        });
        return;
      }

      const batch = writeBatch(DB);
      for (let index = 0; index <= MAX_ALLOWED_USER_TABLES; index += 1) {
        batch.set(newDocRef, {
          docID: newDocRef.id,
          menuID: menuID || '',
          businessProfileID,
          branchID,
          isActive: true,
          title: index === 0 ? `Menu View only` : `Table ${index}`,
          note:
            index === 0
              ? `This virtual table offers a QR-Menu that exclusively displays your menu. You can utilize this QR menu by showcasing it on your restaurant's front door, allowing customers to easily view your offerings. `
              : '',
          index,
        });
      }

      await batch.commit();
    },
    [state]
  );
  const fsGetTableInfo = useCallback(
    async (businessProfileID = state.user.businessProfileID, branchID, tableID) => {
      try {
        const docRef = query(
          collectionGroup(DB, 'tables'),
          where('businessProfileID', '==', businessProfileID),
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
    },
    []
  );
  const fsChangeMenuForAllTables = useCallback(
    async (branchID, menuID, businessProfileID = state.user.businessProfileID) => {
      const docsRef = query(
        collectionGroup(DB, 'tables'),
        where('businessProfileID', '==', businessProfileID),
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
    async (branchID, businessProfileID = state.user.businessProfileID) => {
      const docRef = query(
        collectionGroup(DB, 'tables'),
        where('businessProfileID', '==', businessProfileID),
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
    async (branchID, tableID, value, businessProfileID = state.user.businessProfileID) => {
      const docRef = doc(
        DB,
        `/businessProfiles/${businessProfileID}/branches/${branchID}/tables/${tableID}`
      );
      await updateDoc(docRef, value);
    },
    [state]
  );
  const fsGetBranchTablesCount = useCallback(
    async (branchID, businessProfileID = state.user.businessProfileID) => {
      const query_ = query(
        collectionGroup(DB, 'tables'),
        where('businessProfileID', '==', businessProfileID),
        where('branchID', '==', branchID)
      );
      const snapshot = await getCountFromServer(query_);
      return snapshot.data().count;
    },
    [state]
  );
  // ------------------------ Orders -----------------------------
  const fsGetTableOrdersByPeriod = useCallback(
    async (
      tableID,
      branchID,
      targetMonth = THIS_MONTH,
      targetYear = THIS_YEAR,
      businessProfileID = state.user.businessProfileID
    ) => {
      const startDate = new Date(Date.UTC(targetYear, targetMonth, 1)); // Start of the month
      const endDate = new Date(Date.UTC(targetYear, targetMonth + 1, 0)); // End of the month

      const docRef = query(
        collectionGroup(DB, 'orders'),
        where('businessProfileID', '==', businessProfileID),
        where('branchID', '==', branchID),
        where('tableID', '==', tableID),
        where('initiationTime', '>=', startDate),
        where('initiationTime', '<=', endDate)
      );
      const querySnapshot = await getDocs(docRef);
      const dataArr = [];
      querySnapshot.forEach((doc) => dataArr.push(doc.data()));
      return dataArr;
    },
    [state]
  );
  // ----------------------- Branches ----------------------------
  const fsGetAllBranches = useCallback(async () => {
    const docRef = query(
      collectionGroup(DB, 'branches'),
      where('businessProfileID', '==', state.user.businessProfileID),
      where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(docRef);
    const dataArr = [];
    const asyncOperations = [];

    querySnapshot.forEach((element) => {
      const asyncOperation = async () => {
        try {
          if (element.data().cover) dataArr.push(element.data());
          if (!element.data().cover) {
            const bucketPath = `${state.user.businessProfileID}/branches/${element.data().docID}`;
            const cover = await fsGetImgDownloadUrl(bucketPath, `cover_200x200.webp`);
            dataArr.push({ ...element.data(), cover });
          }
        } catch (error) {
          // Handle the case where cover is not available
          dataArr.push({ ...element.data(), cover: undefined });
          throw new Error(`Cover not available for meal with ID: ${element.data().docID}`);
        }
      };
      asyncOperations.push(asyncOperation());
    });
    await Promise.allSettled(asyncOperations);

    return dataArr;
  }, [state]);
  const fsGetBranch = useCallback(
    async (branchID, businessProfileID = state.user.businessProfileID) => {
      try {
        const docRef = doc(DB, `/businessProfiles/${businessProfileID}/branches/${branchID}/`);
        const docSnap = await getDoc(docRef);

        if (docSnap.data().translation === '') throw new Error('No Translation Found !!');

        if (docSnap.data().cover)
          return {
            ...docSnap.data(),
            lastUpdatedAt: new Date(docSnap.data().lastUpdatedAt.seconds * 1000).toDateString(),
          };

        const bucketPath = `${businessProfileID}/branches/${branchID}`;
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
  const fsGetBranchSnapshot = useCallback(
    async (branchID, businessProfileID = state?.user?.businessProfileID) => {
      const docRef = query(
        collectionGroup(DB, 'branches'),
        where('businessProfileID', '==', businessProfileID),
        where('docID', '==', branchID)
      );

      const unsubscribe = onSnapshot(docRef, async (querySnapshot) => {
        querySnapshot.forEach((element) => {
          async function processElement() {
            const bucketPath = `${businessProfileID}/branches/${element.data().docID}`;
            setBranchSnapshot({
              ...element.data(),
              cover:
                element.data().cover ||
                (await fsGetImgDownloadUrl(bucketPath, `cover_800x800.webp`)),
            });
          }
          processElement();
        });
      });

      return unsubscribe;
    },
    []
  );
  const fsAddNewBranch = useCallback(
    async (branchData, businessProfileID = state.user.businessProfileID) => {
      const newDocRef = doc(collection(DB, `businessProfiles/${businessProfileID}/branches/`));
      const { imageFile, ...documentData } = branchData;
      await setDoc(newDocRef, {
        ...documentData,
        docID: newDocRef.id,
        businessProfileID,
        isDeleted: false,
        lastUpdatedBy: '',
        lastUpdatedAt: new Date(),
        translationEditUsage: { [THIS_MONTH]: 0 },
      });

      await fsAddBatchTablesToBranch(newDocRef.id, businessProfileID);

      if (imageFile) {
        const storageRef = ref(
          STORAGE,
          `gs://${state.user.businessProfileID}/branches/${newDocRef.id}/`
        );
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

      return newDocRef.id;
    },
    [state]
  );
  const fsUpdateBranch = useCallback(
    async (
      branchData,
      shouldUpdateCover = false,
      businessProfileID = state.user.businessProfileID
    ) => {
      const docRef = doc(DB, `/businessProfiles/${businessProfileID}/branches/${branchData.docID}`);
      const { cover: imageFile, ...documentData } = branchData;

      await updateDoc(docRef, {
        ...documentData,
      });

      const updateMealData =
        imageFile && shouldUpdateCover
          ? {
              ...branchData,
              cover: '',
              lastUpdatedBy: businessProfileID,
              lastUpdatedAt: new Date(),
            }
          : { ...branchData, lastUpdatedBy: businessProfileID, lastUpdatedAt: new Date() };

      await updateDoc(docRef, updateMealData);

      if (shouldUpdateCover) {
        const storageRef = ref(
          STORAGE,
          `gs://${BUCKET}/${businessProfileID}/branches/${branchData.docID}/`
        );

        const files = await listAll(storageRef);
        files.items.forEach((file) => {
          deleteObject(file);
        });

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
      const docRef = doc(
        DB,
        `/businessProfiles/${state.user.businessProfileID}/branches/${branchID}`
      );
      await deleteDoc(docRef);

      const storageRef = ref(STORAGE, `gs://${state.user.businessProfileID}/branches/${branchID}/`);
      const files = await listAll(storageRef);
      files.items.forEach((file) => {
        deleteObject(file);
      });
    },
    [state]
  );
  const fsUpdateDisabledMealsInBranch = useCallback(
    async (disabledMeals, branchID, businessProfileID = state.user.businessProfileID) => {
      const docRef = doc(DB, `/businessProfiles/${businessProfileID}/branches/${branchID}`);
      await updateDoc(docRef, { disabledMeals });
    },
    []
  );
  // ------------------------- Menu --------------------------------
  const fsGetMenu = useCallback(
    async (menuID, businessProfileID = state.user.businessProfileID) => {
      const docRef = doc(DB, `/businessProfiles/${businessProfileID}/menus/${menuID}/`);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    },
    [state]
  );
  const fsGetAllMenus = useCallback(
    async (businessProfileID = state.user.businessProfileID) => {
      const docRef = query(
        collectionGroup(DB, 'menus'),
        where('businessProfileID', '==', businessProfileID),
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
    },
    [state]
  );
  const fsAddNewMenu = useCallback(
    async (data, businessProfileID = state.user.businessProfileID) => {
      const newDocRef = doc(collection(DB, `/businessProfiles/${businessProfileID}/menus/`));
      setDoc(newDocRef, {
        ...data,
        docID: newDocRef.id,
        businessProfileID,
        isActive: true,
        isDeleted: false,
        lastUpdatedAt: new Date(),
      });
      return newDocRef.id;
    },
    [state]
  );
  const fsUpdateMenu = useCallback(
    async (data) => {
      const docRef = doc(
        DB,
        `/businessProfiles/${state.user.businessProfileID}/menus/${data.docID}`
      );
      await updateDoc(docRef, {
        ...data,
        lastUpdatedAt: new Date(),
        lastUpdateBy: state.user.businessProfileID,
      });
    },
    [state]
  );
  const fsDeleteMenu = useCallback(
    async (docID) => {
      const docRef = doc(DB, `/businessProfiles/${state.user.businessProfileID}/menus/${docID}`);
      await deleteDoc(docRef);
    },
    [state]
  );
  // --------------------- Menu Sections --------------------------
  const fsAddSection = useCallback(
    async (menuID, title, order, businessProfileID = state.user.businessProfileID, meals = []) => {
      const newDocRef = doc(
        collection(DB, `/businessProfiles/${businessProfileID}/menus/${menuID}/sections`)
      );
      await setDoc(newDocRef, {
        docID: newDocRef.id,
        menuID,
        businessProfileID,
        title,
        meals,
        order,
        isActive: true,
      });

      fbTranslate({
        text: title,
        sectionRef: `/businessProfiles/${businessProfileID}/menus/${menuID}/sections/${newDocRef.id}`,
      });

      return newDocRef.id;
    },
    [state]
  );
  const fsGetSections = useCallback(
    async (menuID, businessProfileID = state.user.businessProfileID) => {
      const docRef = query(
        collectionGroup(DB, 'sections'),
        where('businessProfileID', '==', businessProfileID),
        where('menuID', '==', menuID)
      );

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
    async (menuID, sectionID, orderValue, businessProfileID = state.user.businessProfileID) => {
      const docRef = doc(
        DB,
        `/businessProfiles/${businessProfileID}/menus/${menuID}/sections/${sectionID}`
      );
      await deleteDoc(docRef);

      // get all sections that order index is above the one is being deleted and reduce it
      const docsRef = query(
        collectionGroup(DB, 'sections'),
        where('businessProfileID', '==', businessProfileID),
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
  const fsRemoveMealFromAllSections = useCallback(
    async (mealID, businessProfileID = state?.user?.businessProfileID) => {
      const docsRef = query(
        collectionGroup(DB, 'sections'),
        where('businessProfileID', '==', businessProfileID),
        where('meals', 'array-contains', mealID)
      );
      const snapshot = await getDocs(docsRef);

      const batch = writeBatch(DB);
      snapshot.docs.forEach((doc) => {
        const meals = doc.data().meals.filter((meal) => meal !== mealID);
        batch.update(doc.ref, { meals });
      });

      await batch.commit();
    },
    [state]
  );
  const fsUpdateSection = useCallback(
    async (menuID, sectionID, payload, businessProfileID = state.user.businessProfileID) => {
      const docRef = doc(
        DB,
        `/businessProfiles/${businessProfileID}/menus/${menuID}/sections/${sectionID}/`
      );
      await updateDoc(docRef, payload);
    },
    [state]
  );
  const fsUpdateSectionTitle = useCallback(
    async (menuID, sectionID, payload) => {
      console.log({ menuID, sectionID, payload });
      const docRef = doc(
        DB,
        `/businessProfiles/${state.user.businessProfileID}/menus/${menuID}/sections/${sectionID}/`
      );
      await updateDoc(docRef, payload);

      fbTranslate({
        sectionRef: `/businessProfiles/${state.user.businessProfileID}/menus/${menuID}/sections/${docRef.id}`,
        text: payload.title,
      });
    },
    [state]
  );
  const fsGetSection = useCallback(
    async (menuID, sectionID) => {
      try {
        const docRef = doc(
          DB,
          `/businessProfiles/${state.user.businessProfileID}/menus/${menuID}/sections/${sectionID}`
        );
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
          `/businessProfiles/${state.user.businessProfileID}/menus/${menuID}/sections/${clickedSectionID}/`
        );
        batch.update(docRef, { order: clickedSectionOrder });

        const affectedSectionDocRef = doc(
          DB,
          `/businessProfiles/${state.user.businessProfileID}/menus/${menuID}/sections/${affectedSectionID}/`
        );
        batch.update(affectedSectionDocRef, { order: affectedSectionNewOrder });

        await batch.commit();
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsGetSectionMeals = useCallback(
    async (businessProfileID = state.user.businessProfileID, sectionMeals, size = '800x800') => {
      const docRef = query(
        collectionGroup(DB, 'meals'),
        where('businessProfileID', '==', businessProfileID),
        where('docID', 'in', sectionMeals)
        // where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(docRef);
      const dataArr = [];
      const asyncOperations = [];

      querySnapshot.forEach((element) => {
        const asyncOperation = async () => {
          const bucket = `${businessProfileID}/meals/${element.data().docID}/`;
          const cover = await fsGetImgDownloadUrl(bucket, `${element.data().docID}_${size}.webp`);

          dataArr.push({ ...element.data(), cover });
        };
        asyncOperations.push(asyncOperation());
      });

      await Promise.all(asyncOperations);

      return dataArr;
    },
    []
  );
  const fsEmptyMenuSelectedMeals = useCallback(
    async (menuID) => {
      const docRef = doc(DB, `/businessProfiles/${state.user.businessProfileID}/menus/${menuID}/`);
      await updateDoc(docRef, { meals: [] });
    },
    [state]
  );
  const fsDeleteAllSections = useCallback(
    async (menuID) => {
      const docRef = query(
        collectionGroup(DB, 'sections'),
        where('userID', '==', state.user.businessProfileID),
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
      const docRef = doc(DB, `/businessProfiles/${state.user.businessProfileID}/menus/`, menuID);
      await deleteDoc(docRef);
    },
    [state]
  );
  // ------------------------- Meals --------------------------------
  const fsAddNewMeal = useCallback(
    async (mealInfo, businessProfileID = state.user.businessProfileID) => {
      const date = new Date();
      const dateTime = date.toDateString();

      const newDocRef = doc(collection(DB, `/businessProfiles/${businessProfileID}/meals/`));

      const { imageFile, ...mealData } = mealInfo;

      await setDoc(newDocRef, {
        ...mealData,
        docID: newDocRef.id,
        lastUpdatedAt: dateTime,
        businessProfileID,
        isDeleted: false,
      });

      await fbTranslateMeal({
        mealRef: `/businessProfiles/${businessProfileID}/meals/${newDocRef.id}`,
        text: { title: mealInfo.title, desc: mealInfo.description },
        businessProfileID,
      });

      if (imageFile) {
        const storageRef = ref(STORAGE, `gs://${businessProfileID}/meals/${newDocRef.id}/`);
        const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.') + 1);
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
        const docRef = doc(
          DB,
          `/businessProfiles/${state.user.businessProfileID}/meals/${payload.docID}/`
        );

        const updateMealData = imageFile && imageIsDirty ? { ...mealData, cover: '' } : mealData;
        await updateDoc(docRef, updateMealData);

        if (imageFile && imageIsDirty) {
          const storageRef = ref(
            STORAGE,
            `gs://${BUCKET}/${state.user.businessProfileID}/meals/${payload.docID}/`
          );

          const files = await listAll(storageRef);
          files.items.forEach((file) => {
            deleteObject(file);
          });

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
          fbTranslateMeal({
            mealRef: `/businessProfiles/${state.user.businessProfileID}/meals/${payload.docID}`,
            text: { title: payload.title, desc: payload.description },
            businessProfileID: state.user.businessProfileID,
          });
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    [state]
  );
  const fsGetAllMeals = useCallback(
    async (businessProfileID = state.user.businessProfileID) => {
      const docRef = query(
        collectionGroup(DB, 'meals'),
        where('businessProfileID', '==', businessProfileID),
        where('isDeleted', '==', false)
      );
      const querySnapshot = await getDocs(docRef);
      const dataArr = [];
      const asyncOperations = [];

      querySnapshot.forEach((element) => {
        const asyncOperation = async () => {
          try {
            if (element.data().cover) dataArr.push(element.data());
            if (!element.data().cover) {
              const bucket = `${businessProfileID}/meals/${element.data().docID}`;
              const cover = await fsGetImgDownloadUrl(
                bucket,
                `${element.data().docID}_200x200.webp`
              );
              dataArr.push({ ...element.data(), cover });
            }
          } catch (error) {
            // Handle the case where cover is not available
            dataArr.push({ ...element.data(), cover: undefined });
            throw new Error(`Cover not available for meal with ID: ${element.data().docID}`);
          }
        };
        asyncOperations.push(asyncOperation());
      });
      await Promise.allSettled(asyncOperations);

      return dataArr;
    },
    [state]
  );
  const fsGetMeal = useCallback(
    async (mealID, size = '800x800', businessProfileID = state?.user?.businessProfileID) => {
      try {
        const docRef = doc(DB, `/businessProfiles/${businessProfileID}/meals/${mealID}/`);
        const docSnap = await getDoc(docRef);

        if (docSnap.data()?.translation === '' || docSnap?.data()?.translation === undefined)
          throw new Error('NO Translation Found!!');

        if (!docSnap.data().cover) {
          const bucketPath = `${businessProfileID}/meals/${mealID}`;
          const imgUrl = await fsGetImgDownloadUrl(bucketPath, `${mealID}_${size}.webp`);
          return {
            ...docSnap.data(),
            cover: `${imgUrl}?${Date.now()}`,
          };
        }

        return docSnap.data();
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
        const docRef = doc(DB, `/businessProfiles/${state.user.businessProfileID}/meals/`, mealID);
        await deleteDoc(docRef);

        const bucketPath = `${BUCKET}/${state.user.businessProfileID}/meals/${mealID}/`;
        await fsDeleteImage(bucketPath, `${mealID}_200x200.webp`);
        await fsDeleteImage(bucketPath, `${mealID}_800x800.webp`);
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsGetMealLabels = useCallback(
    async (businessProfileID = state.user.businessProfileID) => {
      try {
        const dataArr = [];
        const docRef = query(
          collectionGroup(DB, 'meal-labels'),
          where('businessProfileID', '==', businessProfileID)
        );
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
    async (title, businessProfileID = state.user.businessProfileID) => {
      const docRef = doc(collection(DB, `/businessProfiles/${businessProfileID}/meal-labels/`));
      await setDoc(docRef, { title, isActive: true, businessProfileID, docID: docRef.id });

      await fbTranslateMealLabelTitle({
        labelTitle: title,
        businessProfileID,
        labelDocID: docRef.id,
      });

      return docRef.id;
    },
    [state]
  );
  const updatedAffectedMeals = useCallback(
    async (mealLabelID) => {
      const mealRef = query(
        collectionGroup(DB, 'meals'),
        where('businessProfileID', '==', state.user.businessProfileID),
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
        const docRef = doc(
          DB,
          `/businessProfiles/${state.user.businessProfileID}/meal-labels/${payload.docID}/`
        );
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
        const labelRef = doc(
          DB,
          `/businessProfiles/${state.user.businessProfileID}/meal-labels/${mealLabelID}/`
        );
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
    const { tableID, menuID, staffID, businessProfileID, branchID } = payload;

    const existingDocRef = query(
      collectionGroup(DB, 'orders'),
      where('businessProfileID', '==', businessProfileID),
      where('branchID', '==', branchID),
      where('tableID', '==', tableID),
      where('isPaid', '==', false),
      where('isCanceled', '==', false)
    );
    const querySnapshot = await getDocs(existingDocRef);
    // Check if the query snapshot is empty
    if (querySnapshot.empty) {
      const docRef = doc(
        collection(DB, `/businessProfiles/${businessProfileID}/branches/${branchID}/orders`)
      );
      await setDoc(docRef, {
        docID: docRef.id,
        businessProfileID,
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
    const { businessProfileID, branchID, tableID, menuID } = payload;

    await fsInitiateNewOrder({
      initiatedBy: 'customer',
      tableID,
      menuID,
      staffID: '',
      businessProfileID,
      branchID,
    });

    const docRef = query(
      collectionGroup(DB, 'orders'),
      where('businessProfileID', '==', businessProfileID),
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
  const fsGetActiveOrdersSnapshot = useCallback(
    async (businessProfileID = state.user.businessProfileID, branchID) => {
      const docRef = query(
        collectionGroup(DB, 'orders'),
        where('businessProfileID', '==', businessProfileID),
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
    },
    []
  );
  const fsUpdateCart = useCallback(async (payload) => {
    const { orderID, businessProfileID, branchID, cart } = payload;
    const docRef = doc(
      DB,
      `/businessProfiles/${businessProfileID}/branches/${branchID}/orders/${orderID}`
    );

    updateDoc(docRef, { cart });
    // if (resetStatus) updateDoc(docRef, { status: { ...status, ready: '', collected: '', kitchen: '' } });
  }, []);
  const fsConfirmCartOrder = useCallback(
    async (cart, totalBill, branchID, businessProfileID = state.user.businessProfileID) => {
      const userRef = doc(DB, `/businessProfiles/${businessProfileID}`);

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
    },
    []
  );
  const fsRemoveMealFromCart = useCallback(async (payload) => {
    const { orderID, businessProfileID, branchID, cart } = payload;
    const docRef = doc(
      DB,
      `/businessProfiles/${businessProfileID}/branches/${branchID}/orders/${orderID}`
    );
    await updateDoc(docRef, { cart });
  }, []);
  const fsUpdateOrderStatus = useCallback(async (payload) => {
    const { orderID, toUpdateFields, businessProfileID, branchID } = payload;
    const docRef = doc(
      DB,
      `/businessProfiles/${businessProfileID}/branches/${branchID}/orders/${orderID}`
    );
    updateDoc(docRef, toUpdateFields);
  }, []);
  const fsOrderIsPaid = useCallback(async (payload) => {
    const { orderID, businessProfileID, branchID, status } = payload;
    const docRef = doc(
      DB,
      `/businessProfiles/${businessProfileID}/branches/${branchID}/orders/${orderID}`
    );

    await updateDoc(docRef, { isPaid: true, status });
  }, []);
  const fsUpdateScanLog = useCallback(
    async (branchID, businessProfileID = state.user.businessProfileID, tableID = undefined) => {
      const month = new Date().getMonth();
      const year = new Date().getFullYear();

      // TODO: SPAM Prevention : allow max # of scans coming from the same table every 5 mins
      // like maximum 20 scans can be preformed for the same table QR every 5 mins
      // allow viewing menu but dont charge scan count on restaurant

      // UPDATE statisticsSummary (User Account Level)
      const userDocRef = doc(DB, `/businessProfiles/${businessProfileID}`);
      await updateDoc(userDocRef, {
        [`statisticsSummary.branches.${branchID}.scans.${year}.${month}`]: increment(1),
      });

      if (tableID) {
        const tableRef = doc(
          DB,
          `/businessProfiles/${businessProfileID}/branches/${branchID}/tables/${tableID}/`
        );
        await updateDoc(tableRef, {
          [`statisticsSummary.scans.${year}.${month}`]: increment(1),
        });
      }
    },
    []
  );
  // ------------------ STAFF ----------------------------------
  const fsGetStaffInfo = useCallback(
    async (staffID, businessProfileID = state.user.businessProfileID) => {
      try {
        const docRef = doc(DB, `/businessProfiles/${businessProfileID}/staff/${staffID}/`);
        const docSnap = await getDoc(docRef);

        return docSnap.data();
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsGetStaffLogin = useCallback(async (businessProfileID, staffID, passCode) => {
    try {
      const docRef = query(
        collectionGroup(DB, 'staff'),
        where('businessProfileID', '==', businessProfileID),
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
    async (payload, staffID, businessProfileID = state.user.businessProfileID) => {
      const waiterDocRef = doc(DB, `/businessProfiles/${businessProfileID}/staff/${staffID}`);
      await updateDoc(waiterDocRef, payload);
    },
    [state]
  );
  const fsGetStaffList = useCallback(
    async (branchID = '', businessProfileID = state.user.businessProfileID) => {
      let docRef = query(
        collectionGroup(DB, 'staff'),
        where('businessProfileID', '==', businessProfileID)
      );

      // Conditionally add branchID to where clause if provided
      if (branchID !== '') {
        docRef = query(docRef, where('branchID', '==', branchID));
      }

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
    async (payload, businessProfileID = state.user.businessProfileID) => {
      const newDocRef = doc(collection(DB, `/businessProfiles/${businessProfileID}/staff`));
      await setDoc(newDocRef, {
        ...payload,
        docID: newDocRef.id,
        businessProfileID,
      });
      return newDocRef.id;
    },
    [state]
  );
  const fsDeleteStaff = useCallback(
    async (staffID) => {
      const docRef = doc(DB, `/businessProfiles/${state.user.businessProfileID}/staff/${staffID}`);
      await updateDoc(docRef, { isLoggedIn: false });
      await deleteDoc(docRef);
    },
    [state]
  );
  // ------------------------------------------------------------

  const memoizedValue = useMemo(
    () => ({
      dispatch,
      user: state.user,
      businessProfile: state.businessProfile,
      method: 'firebase',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      login,
      register,
      logout,
      fsGetUser,
      fsGetBusinessProfile,
      staff,
      setStaff,
      // ---- GENERIC ----
      fsUpdateTable,
      // --- BUSINESS PROFILE ----
      fsCreateBusinessProfile,
      fsUpdateBusinessProfile,
      createDefaults,
      // ---- FUNCTIONS ----
      fbTranslate,
      fbTranslateMeal,
      // ---- STORAGE ----
      STORAGE,
      fsGetImgDownloadUrl,
      // ---- BRANCHES ----
      branchSnapshot,
      fsGetBranch,
      fsGetBranchSnapshot,
      fsGetAllBranches,
      fsAddNewBranch,
      fsUpdateBranch,
      fsDeleteBranch,
      fsUpdateDisabledMealsInBranch,
      // ---- TABLES ----
      fsGetBranchTablesCount,
      fsGetBranchTables,
      fsUpdateBranchTable,
      fsChangeMenuForAllTables,
      fsGetTableOrdersByPeriod,
      fsGetTableInfo,
      // ---- ORDERS ----
      fsInitiateNewOrder,
      fsOrderSnapshot,
      fsGetActiveOrdersSnapshot,
      orderSnapShot,
      activeOrders,
      // ---- MENU SECTIONS ----
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
      fsRemoveMealFromAllSections,
      // ---- MENU ----
      fsGetAllMenus,
      fsGetMenu,
      fsAddNewMenu,
      fsUpdateMenu,
      fsDeleteMenu,
      // ---- MEALS ----
      fsGetAllMeals,
      fsGetMeal,
      fsDeleteMeal,
      fsAddNewMeal,
      fsUpdateMeal,
      fsGetMealLabels,
      fsAddNewMealLabel,
      fsUpdateMealLabel,
      fsDeleteMealLabel,
      // ---- QR Menu ----
      fsConfirmCartOrder,
      fsUpdateScanLog,
      fsUpdateCart,
      fsRemoveMealFromCart,
      // ---- Waiter ----
      fsGetStaffLogin,
      fsGetStaffInfo,
      fsUpdateOrderStatus,
      fsOrderIsPaid,
      fsAddNewStaff,
      fsGetStaffList,
      fsUpdateStaffInfo,
      fsDeleteStaff,
    }),
    [
      state.isAuthenticated,
      state.isInitialized,
      state.user,
      login,
      register,
      logout,
      fsGetUser,
      fsGetBusinessProfile,
      staff,
      setStaff,
      // ---- GENERIC ----
      fsUpdateTable,
      // --- BUSINESS PROFILE ----
      fsCreateBusinessProfile,
      fsUpdateBusinessProfile,
      createDefaults,
      // ---- FUNCTIONS ----
      fbTranslate,
      fbTranslateMeal,
      // ---- STORAGE ----
      fsGetImgDownloadUrl,
      // ---- BRANCHES ----
      fsGetBranch,
      fsGetBranchSnapshot,
      fsGetAllBranches,
      fsAddNewBranch,
      fsUpdateBranch,
      fsDeleteBranch,
      fsUpdateDisabledMealsInBranch,
      // ---- TABLES ----
      fsGetBranchTablesCount,
      fsGetBranchTables,
      fsUpdateBranchTable,
      fsGetTableInfo,
      fsChangeMenuForAllTables,
      // ---- ORDERS ----
      fsInitiateNewOrder,
      fsOrderSnapshot,
      fsGetActiveOrdersSnapshot,
      orderSnapShot,
      activeOrders,
      fsGetTableOrdersByPeriod,
      // ---- MENU SECTIONS ----
      fsAddSection,
      fsUpdateSection,
      fsGetSections,
      fsGetSection,
      fsUpdateSectionsOrder,
      fsGetSectionMeals,
      fsDeleteSection,
      fsUpdateSectionTitle,
      fsRemoveMealFromAllSections,
      // ---- MENU ----
      fsGetAllMenus,
      fsGetMenu,
      fsAddNewMenu,
      fsUpdateMenu,
      fsDeleteMenu,
      // ---- MEALS ----
      fsGetAllMeals,
      fsGetMeal,
      fsDeleteMeal,
      fsAddNewMeal,
      fsUpdateMeal,
      fsGetMealLabels,
      fsAddNewMealLabel,
      fsUpdateMealLabel,
      fsDeleteMealLabel,
      // ---- QR Menu ----
      fsConfirmCartOrder,
      fsUpdateScanLog,
      fsUpdateCart,
      fsRemoveMealFromCart,
      // ---- Waiter ----
      fsGetStaffLogin,
      fsGetStaffInfo,
      fsUpdateOrderStatus,
      fsOrderIsPaid,
      fsAddNewStaff,
      fsGetStaffList,
      fsUpdateStaffInfo,
      fsDeleteStaff,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
