/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-shadow */
import PropTypes from 'prop-types';
import { faker } from '@faker-js/faker';
import { initializeApp } from 'firebase/app';
import { useQueryClient } from '@tanstack/react-query';
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
  query,
  where,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  increment,
  collection,
  writeBatch,
  onSnapshot,
  getFirestore,
  collectionGroup,
  getCountFromServer,
} from 'firebase/firestore';

import { FIREBASE_API } from 'src/config-global';
import { stripeCreateBusiness } from 'src/stripe/functions';
import {
  DEFAULT_MEALS,
  DEFAULT_MENUS,
  DEFAULT_STAFF,
  DEFAULT_BRANCH,
  DEFAULT_LABELS,
  DEFAULT_MENU_SECTIONS,
} from 'src/_mock/business-profile-default-values';

import { AuthContext } from './auth-context';

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
  const [branchTables, setBranchTables] = useState([]);
  const [branchSnapshot, setBranchSnapshot] = useState({});
  const [staff, setStaff] = useState({});

  const queryClient = useQueryClient();

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

            // create user profile (first time)
            if (!profile) {
              await setDoc(userProfile, { uid: user.uid, email: user.email, role: 'user' });
            }

            // update user last login time.
            await updateDoc(userProfile, { lastLogin: new Date() });

            queryClient.fetchQuery({
              queryKey: ['businessProfile', profile.businessProfileID],
              queryFn: async () => fsGetBusinessProfile(profile.businessProfileID, user, profile),
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
  const logout = useCallback(async () => {
    await signOut(AUTH);
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
  const forgotPassword = useCallback(async (email) => {
    if (!email.endsWith('@kojak-group.com')) throw new Error('Email Domain Not Allowed !!');
    await sendPasswordResetEmail(AUTH, email);
  }, []);
  const updateUserAccessPaths = useCallback(async (userID, allowedPaths) => {
    const docRef = doc(DB, `/users/${userID}`);
    await updateDoc(docRef, { allowedPaths });
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
  const updateUserProfile = useCallback(async (displayName) => {
    const userProfile = await updateProfile(AUTH.currentUser, { displayName });
    return userProfile;
  }, []);
  // ------------------------- Firebase Functions -----------------
  const fbTranslate = httpsCallable(FUNCTIONS, 'fbTranslateSectionTitle');
  const fbTranslateMeal = httpsCallable(FUNCTIONS, 'fbTranslateMeal');
  const fbTranslateBranchDesc = httpsCallable(FUNCTIONS, 'fbTranslateBranchDesc');
  const fbTranslateMealLabelTitle = httpsCallable(FUNCTIONS, 'fbTranslateMealLabelTitle');
  const fbTranslateKeyword = httpsCallable(FUNCTIONS, 'fbTranslateKeyword');

  // useEffect(() => {
  //   (async () => fbTranslateKeyword(KEYWORDS))();
  // }, []);

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
      .then(() => {})
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
        (snapshot) => {},
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
    async (businessProfileID, user = state.user, profile = state.profile) => {
      try {
        // await fbTranslateKeywords();

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

        const subscriptionInfo = await fsGetStripeSubscription(docSnapshot.data().subscriptionId);
        const productInfo = await fsGetProduct(subscriptionInfo.product_details.id);

        dispatch({
          type: 'INITIAL',
          payload: {
            user: {
              ...user,
              ...profile,
              id: user.uid,
            },
            businessProfile: {
              ...docSnapshot.data(),
              subscriptionInfo: { ...subscriptionInfo },
              productInfo: { ...productInfo },
              logo,
              ownerInfo: businessOwnerInfo,
              // role: docSnapshot.data().planInfo.at(-1).isMenuOnly ? 'menuOnly' : 'full',
              role: 'full',
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
        const { email, password, firstName, lastName, businessName, plan, productID } = data;

        // 1- create owner account on firebase
        const ownerID = await register?.(email, password, firstName, lastName);

        // 2- create business profile and system defaults on server
        await stripeCreateBusiness(
          ownerID,
          email,
          `${firstName} ${lastName}`,
          businessName,
          plan,
          productID,
          true
        );
      } catch (error) {
        console.log(error);
      }
    },
    [state]
  );
  const fsUpdateBusinessProfileTranslation = useCallback(
    async (description) => {
      try {
        const businessProfileID = state?.businessProfile.docID;

        const docRef = doc(DB, `/businessProfiles/${businessProfileID}`);
        await updateDoc(docRef, { description, translation: '', translationEdited: '' });

        await fbTranslateBranchDesc({
          title: state.businessProfile.businessName,
          desc: description,
          businessProfileID,
          newLang: state.businessProfile.languages,
          toRemoveLang: [],
        });

        await fsGetBusinessProfile(businessProfileID);
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsUpdateBusinessProfile = useCallback(
    async (
      payload,
      shouldUpdateTranslation = false,
      isLogoDirty = false,
      businessProfileID = state?.businessProfile.docID
    ) => {
      try {
        const { logo, ...data } = payload;
        const docRef = doc(DB, `/businessProfiles/${businessProfileID}`);

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
            (snapshot) => {},
            (error) => {},
            () => {}
          );
        }

        if (shouldUpdateTranslation)
          await fbTranslateBranchDesc({
            title: payload.businessName,
            desc: payload.description,
            businessProfileID,
            newLang: state.businessProfile.languages,
            toRemoveLang: [],
          });

        await updateDoc(docRef, { ...data, logo: isLogoDirty ? '' : logo });

        // dispatch({
        //   type: 'INITIAL',
        //   payload: {
        //     ...state,
        //     businessProfile: {
        //       ...state.businessProfile,
        //       ...payload,
        //       ownerInfo: state.businessProfile.ownerInfo,
        //     },
        //   },
        // });
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsUpdateTranslationSettings = useCallback(
    async (newLang, toRemoveLang, languages, businessProfileID = state.businessProfile.docID) => {
      try {
        const { count, maxCount } = state.businessProfile.translationEditUsage;

        // If limit is exceeded throw an error
        if (count >= maxCount) throw new Error('Monthly Translation Limit Exceeded !!');

        const promisesArray = [];
        const businessProfileRef = doc(DB, `/businessProfiles/${businessProfileID}`);

        // 1- Add Languages to Business Profile
        await updateDoc(businessProfileRef, { languages });

        // 2- Translate Business Profile
        const businessProfileSnap = await getDoc(businessProfileRef);
        const response = await fbTranslateBranchDesc({
          title: businessProfileSnap.data().businessName,
          desc: businessProfileSnap.data().description,
          businessProfileID,
          newLang,
          toRemoveLang,
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
                newLang,
                toRemoveLang,
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
                newLang,
                toRemoveLang,
              })
            );
          };
          syncOperation();
        });

        // 5- Translate Labels
        const labelsRef = query(
          collectionGroup(DB, 'meal-labels'),
          where('businessProfileID', '==', businessProfileID)
        );

        const labelsSnapshot = await getDocs(labelsRef);
        labelsSnapshot.forEach((label) => {
          const syncOperation = async () => {
            const { docID, title, businessProfileID } = label.data();
            promisesArray.push(
              await fbTranslateMealLabelTitle({
                labelTitle: title,
                businessProfileID,
                labelDocID: docID,
                newLang,
                toRemoveLang,
              })
            );
          };
          syncOperation();
        });

        await Promise.allSettled(promisesArray);

        // 6- Increase translation usage limit for this month
        const CURRENT_YEAR_MONTH = `${THIS_YEAR}-${THIS_MONTH}`;
        // const maxCount = state.businessProfile?.translationEditUsage?.maxCount ?? 3; // Default to 3 if not set

        await updateDoc(businessProfileRef, {
          translationEditUsage: {
            yearMonth: CURRENT_YEAR_MONTH, // Store the current year and month
            maxCount, // Store the maxCount from the state
            count:
              state.businessProfile?.translationEditUsage?.yearMonth === CURRENT_YEAR_MONTH
                ? Math.min((state.businessProfile?.translationEditUsage?.count ?? 0) + 1, maxCount)
                : 1, // Reset to 1 if it's a new month, otherwise increment up to maxCount
          },
        });

        return response;
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsGetSystemTranslations = useCallback(async (languages) => {
    const docRef = query(
      collectionGroup(DB, 'system-translations'),
      where('lang', 'in', languages)
    );
    const querySnapshot = await getDocs(docRef);
    const translations = [];
    querySnapshot.forEach((doc) => translations.push(doc.data()));
    return translations;

    // const translations = [];
    // const systemTranslations = [];
    // languages.forEach(async (language) => {
    //   const asyncOperation = async () => {
    //     try {
    //       const docRef = doc(DB, `/system-translations/${language}`);
    //       translations.push({ lang: language, translations: (await getDoc(docRef)).data() });
    //     } catch (error) {
    //       throw error;
    //     }
    //   };
    //   systemTranslations.push(asyncOperation());
    // });

    // await Promise.allSettled(systemTranslations);

    // return translations;
  }, []);
  const createDefaults = useCallback(async (businessProfileInfo) => {
    // create defaults for new users, default plan = 'Trial'

    const { businessProfileID, languages } = businessProfileInfo;

    // 1- ADD MEAL LABELS
    const mealLabels = await Promise.all(
      DEFAULT_LABELS.map(async (label) => ({
        id: await fsAddNewMealLabel(label, businessProfileID, languages),
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
          const mealID = await fsAddNewMeal(modifiedMeal, businessProfileID, languages);
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
    await Promise.all(
      DEFAULT_MENU_SECTIONS.map(async (section, order) => {
        const sectionMeals = meals
          .filter((item) => item.meal.section === section)
          .map((mealItem) => ({
            docID: mealItem.id,
            isActive: true,
            portions: mealItem.meal.portions,
            isNew: mealItem.meal.isNew,
          }));

        menus.map(async (menu) =>
          fsAddSection(menu.id, section, order + 1, businessProfileID, sectionMeals, languages)
        );
      })
    );

    // 4- ADD BRANCH
    const branchID = await fsAddNewBranch(
      {
        ...DEFAULT_BRANCH,
        businessProfileID,
        cover: await fsGetImgDownloadUrl('_mock/branches', `branch-1_800x800.webp`),
      },
      businessProfileID
    );

    // 5- ADD STAFF
    await Promise.all(
      DEFAULT_STAFF(businessProfileID).map(async (staff) => {
        const modifiedStaff = {
          ...staff,
          branchID,
        };
        await fsAddNewStaff(modifiedStaff, businessProfileID);
      })
    );
  }, []);
  // ----------------------- Stripe -------------------
  const fsGetStripeSubscription = useCallback(async (subscriptionID) => {
    const docRef = doc(DB, `/subscriptions/${subscriptionID}`);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  }, []);
  const fsGetProduct = useCallback(async (productID) => {
    const docRef = doc(DB, `/products/${productID}`);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  }, []);
  const fsGetProducts = useCallback(async () => {
    try {
      const docRef = query(collection(DB, 'products'));
      const querySnapshot = await getDocs(docRef);
      const dataArr = [];

      querySnapshot.forEach((doc) => dataArr.push(doc.data()));

      return dataArr;
    } catch (error) {
      throw error;
    }
  }, []);
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
      const subscriptionInfo = await fsGetStripeSubscription(
        businessProfileSnap.data().subscriptionId
      );
      const productInfo = await fsGetProduct(subscriptionInfo.product_details.id);

      const tablesCount = +productInfo.metadata.tables;

      // Get menus
      const menus = await fsGetAllMenus(businessProfileID);
      const menuID = menus.find((menu) => menu.title === 'Main Menu')?.docID || menus[0].docID;

      if (+tablesCount === 1) {
        const newDocRef = doc(
          collection(DB, `/businessProfiles/${businessProfileID}/branches/${branchID}/tables`)
        );
        await setDoc(newDocRef, {
          docID: newDocRef.id,
          menuID: menuID || '',
          businessProfileID,
          branchID,
          isActive: true,
          title: `Menu View only`,
          note: `This QR is intended to show the menu only and cart will be hidden, use it on your
              social media or place it on your front door, dont place it on customers tables unless
              you are intending to let them view the menu only and take orders manually.`,
          index: 0,
          mealAlwaysAvailable: true,
          isVisible: true,
        });
        return;
      }

      const batch = writeBatch(DB);
      for (let index = 0; index < tablesCount + 1; index += 1) {
        const newDocRef = doc(
          collection(DB, `/businessProfiles/${businessProfileID}/branches/${branchID}/tables`)
        );
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
          mealAlwaysAvailable: index === 0,
          isVisible: true,
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
  const fsGetDisplayTableInfo = useCallback(
    async (branchID, businessProfileID = state.user.businessProfileID) => {
      try {
        const docRef = query(
          collectionGroup(DB, 'tables'),
          where('businessProfileID', '==', businessProfileID),
          where('branchID', '==', branchID),
          where('index', '==', 0)
        );
        const querySnapshot = await getDocs(docRef);
        const dataArr = [];
        querySnapshot.forEach((doc) => dataArr.push(doc.data()));
        return dataArr[0];
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsChangeMenuForAllTables = useCallback(
    async (branchID, menuID, businessProfileID = state.user.businessProfileID) => {
      const docsRef = query(
        collectionGroup(DB, 'tables'),
        where('businessProfileID', '==', businessProfileID),
        where('branchID', '==', branchID)
      );
      const snapshot = await getDocs(docsRef);

      const toUpdate = [];

      snapshot.docs.forEach((tableDoc) => {
        const updateTable = async () =>
          toUpdate.push(await fsUpdateBranchTable(branchID, tableDoc.data().docID, { menuID }));

        updateTable();
      });

      await Promise.allSettled(toUpdate);

      const branchRef = doc(DB, `/businessProfiles/${businessProfileID}/branches/${branchID}`);
      await updateDoc(branchRef, { menuID });
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
  const fsGetBranchTablesSnapshot = useCallback(
    async (branchID, businessProfileID = state.user.businessProfileID) => {
      const docRef = query(
        collectionGroup(DB, 'tables'),
        where('businessProfileID', '==', businessProfileID),
        where('branchID', '==', branchID)
      );

      const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
        const tablesArray = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists() && doc.data().index !== 0) {
            tablesArray.push(doc.data());
          }
        });
        setBranchTables(tablesArray);
      });

      return unsubscribe;
    },
    [state]
  );
  const fsUpdateBranchTable = useCallback(
    async (branchID, tableID, data, businessProfileID = state.user.businessProfileID) => {
      try {
        const docRef = doc(
          DB,
          `/businessProfiles/${businessProfileID}/branches/${branchID}/tables/${tableID}`
        );
        await updateDoc(docRef, data);

        if (data.menuID) {
          const ordersQuery = query(
            collectionGroup(DB, 'orders'),
            where('tableID', '==', tableID),
            where('branchID', '==', branchID),
            where('businessProfileID', '==', businessProfileID),
            where('isCanceled', '==', false),
            where('isPaid', '==', false),
            where('isReadyToServe', '==', []),
            where('isInKitchen', '==', [])
          );
          const querySnapshot = await getDocs(ordersQuery);
          if (querySnapshot.empty) return;
          const orderRef = querySnapshot.docs[0].ref;
          await updateDoc(orderRef, { cart: [], menuID: data.menuID });
        }
      } catch (error) {
        throw new Error(error);
      }
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
  const fsUpdateQRsMenuID = useCallback(
    // this function is used to update all QRs menuID across all branches after deleting their menu
    async (oldMenuID, newMenuID) => {
      const docRef = query(
        collectionGroup(DB, 'tables'),
        where('businessProfileID', '==', state.user.businessProfileID),
        where('menuID', '==', oldMenuID)
      );

      const querySnapshot = await getDocs(docRef);

      const batch = writeBatch(DB);

      querySnapshot.forEach((doc) => {
        const tableRef = doc.ref;
        batch.update(tableRef, { menuID: newMenuID });
      });

      await batch.commit();
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
  const fsGetOrdersByFilter = useCallback(
    async ({ branchID, period, status }) => {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - period * 60 * 60 * 1000);

      let docRef = query(
        collection(
          DB,
          'businessProfiles',
          state.user.businessProfileID,
          'branches',
          branchID,
          'orders'
        ),
        where('branchID', '==', branchID),
        where('closingTime', '>=', startTime),
        where('closingTime', '<=', endTime)
      );

      if (status === 'cancelled') {
        docRef = query(docRef, where('isCanceled', '==', true));
      }

      if (status === 'paid') {
        docRef = query(docRef, where('isPaid', '==', true));
      }

      const totalCount = await getCountFromServer(docRef);

      const querySnapshot = await getDocs(docRef);
      const dataArr = [];
      querySnapshot.forEach((doc) => dataArr.push(doc.data()));
      return { data: dataArr, count: totalCount.data().count };
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
          if (element.data().cover.startsWith('http')) dataArr.push(element.data());
          if (!element.data().cover.startsWith('http')) {
            const bucketPath = `${state.user.businessProfileID}/branches/${element.data().docID}`;
            const cover = await fsGetImgDownloadUrl(bucketPath, `cover_200x200.webp`);
            if (cover === undefined) {
              throw new Error(`Cover not available: ${element.data().docID}`);
            }
            dataArr.push({ ...element.data(), cover });
          }
        } catch (error) {
          // Handle the case where cover is not available
          dataArr.push({ ...element.data(), cover: undefined });
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

        if (!docSnap.data().cover.startsWith('http')) {
          const bucketPath = `${businessProfileID}/branches/${docSnap.data().docID}`;
          const imgUrl = await fsGetImgDownloadUrl(bucketPath, `cover_800x800.webp`);
          return {
            ...docSnap.data(),
            cover: `${imgUrl}?${Date.now()}`,
            lastUpdatedAt: new Date(docSnap.data().lastUpdatedAt.seconds * 1000).toDateString(),
          };
        }
        return {
          ...docSnap.data(),
          lastUpdatedAt: new Date(docSnap.data().lastUpdatedAt.seconds * 1000).toDateString(),
        };
      } catch (error) {
        throw error;
      }
    },
    [state]
  );
  const fsAddNewBranch = useCallback(
    async (branchData, businessProfileID = state.user.businessProfileID) => {
      const newDocRef = doc(collection(DB, `businessProfiles/${businessProfileID}/branches/`));
      const { imageFile, ...documentData } = branchData;

      const CURRENT_YEAR_MONTH = `${THIS_YEAR}-${THIS_MONTH}`;

      await setDoc(newDocRef, {
        ...documentData,
        docID: newDocRef.id,
        businessProfileID,
        isDeleted: false,
        lastUpdatedBy: '',
        lastUpdatedAt: new Date(),
        translationEditUsage: { count: 0, maxCount: 3, yearMonth: CURRENT_YEAR_MONTH },
      });

      await fsAddBatchTablesToBranch(newDocRef.id, businessProfileID);

      if (imageFile) {
        const storageRef = ref(
          STORAGE,
          `gs://${BUCKET}/${state.user.businessProfileID}/branches/${newDocRef.id}/`
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
      const { imageFile, docID, ...documentData } = branchData;

      // await updateDoc(docRef, {
      //   ...documentData,
      // });

      if (!documentData.showCallWaiterBtn) {
        // mute all orders in branch
        const batch = writeBatch(DB);
        const orderRef = query(
          collectionGroup(DB, 'orders'),
          where('businessProfileID', '==', businessProfileID),
          where('branchID', '==', branchData.docID),
          where('isPaid', '==', false),
          where('isCanceled', '==', false),
          where('callWaiter', '==', true)
        );
        const ordersSnapshot = await getDocs(orderRef);
        ordersSnapshot.forEach((order) => {
          const orderRef = order.ref;
          batch.update(orderRef, { callWaiter: false });
        });

        batch.commit();
      }

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

      const updateMealData =
        imageFile && shouldUpdateCover
          ? {
              ...documentData,
              cover: '',
              lastUpdatedAt: new Date(),
            }
          : { ...documentData, lastUpdatedAt: new Date() };

      await updateDoc(docRef, updateMealData);
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
  const fsUpdateBranchesDefaultLanguage = useCallback(
    async (lang) => {
      const batch = writeBatch(DB);
      const branchesRef = query(
        collectionGroup(DB, 'branches'),
        where('businessProfileID', '==', state.user.businessProfileID),
        where('isDeleted', '==', false)
      );

      const branchesSnapshot = await getDocs(branchesRef);
      branchesSnapshot.forEach((branch) => {
        const branchRef = branch.ref;
        batch.update(branchRef, { defaultLanguage: lang });
      });
      await batch.commit();
    },
    [state]
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

      querySnapshot.forEach((doc) => dataArr.push(doc.data()));
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
    async (oldMenuID, newMenuID) => {
      await fsUpdateQRsMenuID(oldMenuID, newMenuID);

      const docRef = doc(
        DB,
        `/businessProfiles/${state.user.businessProfileID}/menus/${oldMenuID}`
      );
      await deleteDoc(docRef);
    },
    [state]
  );
  // --------------------- Menu Sections --------------------------
  const fsAddSection = useCallback(
    async (
      menuID,
      title,
      order,
      businessProfileID = state.user.businessProfileID,
      meals = [],
      languages = []
    ) => {
      const newDocRef = doc(
        collection(DB, `/businessProfiles/${businessProfileID}/menus/${menuID}/sections`)
      );

      await setDoc(newDocRef, {
        docID: newDocRef.id,
        menuID,
        businessProfileID,
        title,
        order,
        isActive: true,
        mealsQueryArray: meals.length === 0 ? [] : meals.map((meal) => meal.docID),
        meals,
      });

      fbTranslate({
        text: title,
        sectionRef: `/businessProfiles/${businessProfileID}/menus/${menuID}/sections/${newDocRef.id}`,
        newLang: languages.length !== 0 ? languages : state.businessProfile.languages,
        toRemoveLang: [],
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
    //! Remove section meals from menu Meals Array
    async (
      menuID,
      sectionID,
      orderValue,
      sectionMealsIDs,
      businessProfileID = state.user.businessProfileID
    ) => {
      try {
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

        // remove section meals from menu meals array
        const menuRef = doc(DB, `/businessProfiles/${businessProfileID}/menus/${menuID}`);
        const menuSnap = await getDoc(menuRef);
        const menuMeals = menuSnap
          .data()
          .meals.filter((mealID) => !sectionMealsIDs.includes(mealID));
        const menuPayload = { meals: menuMeals };
        await updateDoc(menuRef, menuPayload);

        // Update sections order
        const batch = writeBatch(DB);
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, { order: increment(-1) });
        });

        await batch.commit();
      } catch (error) {
        return error;
      }
      return true;
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
      const docRef = doc(
        DB,
        `/businessProfiles/${state.user.businessProfileID}/menus/${menuID}/sections/${sectionID}/`
      );
      await updateDoc(docRef, payload);

      fbTranslate({
        sectionRef: `/businessProfiles/${state.user.businessProfileID}/menus/${menuID}/sections/${docRef.id}`,
        text: payload.title,
        newLang: state.businessProfile.languages,
        toRemoveLang: [],
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
  // ------------------------- Meals --------------------------------
  const fsAddNewMeal = useCallback(
    async (mealInfo, businessProfileID = state.user.businessProfileID, languages = []) => {
      const newDocRef = doc(collection(DB, `/businessProfiles/${businessProfileID}/meals/`));
      const { imageFile, ...mealData } = mealInfo;

      await setDoc(newDocRef, {
        ...mealData,
        docID: newDocRef.id,
        lastUpdatedAt: new Date(),
        businessProfileID,
        isDeleted: false,
      });

      await fbTranslateMeal({
        mealRef: `/businessProfiles/${businessProfileID}/meals/${newDocRef.id}`,
        text: { title: mealInfo.title, desc: mealInfo.description },
        newLang: languages.length !== 0 ? languages : state.businessProfile.languages,
        toRemoveLang: [],
      });

      if (imageFile) {
        const storageRef = ref(
          STORAGE,
          `gs://${BUCKET}/${state.user.businessProfileID}/meals/${newDocRef.id}/`
        );
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
    async (payload, imageIsDirty = false) => {
      try {
        const { imageFile, cover, ...mealData } = payload;
        const docRef = doc(
          DB,
          `/businessProfiles/${state.user.businessProfileID}/meals/${payload.docID}/`
        );

        const updateMealData = imageFile && imageIsDirty ? { ...mealData, cover: '' } : mealData;
        await updateDoc(docRef, { ...updateMealData, lastUpdatedAt: new Date() });

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
            newLang: state.businessProfile.languages,
            toRemoveLang: [],
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
            if (element.data().cover.startsWith('http')) dataArr.push(element.data());
            if (!element.data().cover.startsWith('http')) {
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

        if (!docSnap.data().cover.startsWith('http')) {
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

        // the mealsQueryArray is used to query for documents in firestore more efficiently as it is an array of mealIDs and firestore cant query for array of objects
        const docsRef = query(
          collectionGroup(DB, 'sections'),
          where('businessProfileID', '==', state.user.businessProfileID),
          where('mealsQueryArray', 'array-contains', mealID)
        );
        const querySnapshot = await getDocs(docsRef);
        const asyncOperations = [];

        // delete meal from section
        querySnapshot.forEach((element) => {
          const asyncOperation = async () => {
            const { meals, mealsQueryArray } = element.data();
            const updatedMealsQueryArray = mealsQueryArray.filter((meal) => meal !== mealID);
            const updatedMeals = meals.filter((meal) => meal.docID !== mealID);

            await updateDoc(element.ref, {
              meals: [...updatedMeals],
              mealsQueryArray: [...updatedMealsQueryArray],
            });
          };
          asyncOperations.push(asyncOperation());
        });

        await Promise.allSettled(asyncOperations);

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
    async (title, businessProfileID = state.user.businessProfileID, languages = []) => {
      const docRef = doc(collection(DB, `/businessProfiles/${businessProfileID}/meal-labels/`));
      await setDoc(docRef, { title, isActive: true, businessProfileID, docID: docRef.id });

      await fbTranslateMealLabelTitle({
        labelTitle: title,
        businessProfileID,
        labelDocID: docRef.id,
        newLang: languages.length !== 0 ? languages : state.businessProfile.languages,
        toRemoveLang: [],
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

        // return updatedAffectedMeals(payload.docID);
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
  const fsUpdateMealOrderCount = useCallback(
    async (mealID, businessProfileID = state.user.businessProfileID) => {
      try {
        const docRef = doc(DB, `/businessProfiles/${businessProfileID}/meals/${mealID}/`);

        await updateDoc(docRef, { orderCount: increment(1) });
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    [state]
  );
  // -------------------------- QR Menu - Cart -----------------------------------
  const fsInitiateNewOrder = useCallback(async (payload) => {
    const { tableID, menuID, staffID, businessProfileID, branchID, initiatedBy } = payload;

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
        initiatedBy,
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
        closingTime: '',
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
        (async () => {
          await updateDoc(userRef, {
            [`statisticsSummary.meals.${THIS_YEAR}.${THIS_MONTH}.${cartItem.mealID}`]: increment(1),
          });

          await fsUpdateMealOrderCount(cartItem.mealID, businessProfileID);
        })()
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

        if (docSnap.data().isLoggedIn)
          fsGetStaffLogin(businessProfileID, staffID, docSnap.data().passCode);

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
  // -------------------- CUSTOMERS ----------------------------------------
  const fsGetCustomers = useCallback(async () => {
    const customersRef = collection(
      DB,
      'businessProfiles',
      state.user.businessProfileID,
      'customers'
    );
    const docsQuery = query(customersRef);
    const querySnapshot = await getDocs(docsQuery);
    const customers = [];
    querySnapshot.forEach((doc) => {
      customers.push(doc.data());
    });
    return customers;
  }, [state]);
  const fsDeleteCustomer = useCallback(
    async (customerID) => {
      const docRef = doc(
        DB,
        `/businessProfiles/${state.user.businessProfileID}/customers/${customerID}`
      );
      await deleteDoc(docRef);
    },
    [state]
  );
  const fsBatchAddCustomers = useCallback(async () => {
    const batch = writeBatch(DB);

    for (let index = 0; index < 100; index += 1) {
      const newDocRef = doc(
        collection(DB, `/businessProfiles/${state.user.businessProfileID}/customers`)
      );
      batch.set(newDocRef, {
        docID: newDocRef.id,
        email: faker.internet.email(),
        lastOrder: new Date(),
        lastVisitBranchID: '2EKctRFUaA06pGIvAT2D',
        totalVisits: index + 1,
      });
    }

    await batch.commit();
  }, [state]);
  // ----------------------------------------------------------------------------

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
      fsUpdateBusinessProfileTranslation,
      createDefaults,
      fsGetSystemTranslations,
      fsUpdateTranslationSettings,
      // --- STRIPE ----
      fsGetStripeSubscription,
      fsGetProduct,
      fsGetProducts,
      // ---- FUNCTIONS ----
      fbTranslate,
      fbTranslateMeal,
      // ---- STORAGE ----
      STORAGE,
      fsGetImgDownloadUrl,
      // ---- BRANCHES ----
      branchSnapshot,
      fsGetBranch,
      fsGetAllBranches,
      fsAddNewBranch,
      fsUpdateBranch,
      fsUpdateDisabledMealsInBranch,
      fsUpdateBranchesDefaultLanguage,
      // ---- TABLES ----
      fsGetBranchTablesCount,
      fsGetBranchTables,
      fsGetBranchTablesSnapshot,
      fsUpdateBranchTable,
      fsChangeMenuForAllTables,
      fsGetTableOrdersByPeriod,
      fsGetOrdersByFilter,
      fsGetTableInfo,
      fsGetDisplayTableInfo,
      branchTables,
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
      // --- Customers ---
      fsGetCustomers,
      fsDeleteCustomer,
      fsBatchAddCustomers,
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
      fsUpdateBusinessProfileTranslation,
      createDefaults,
      fsGetSystemTranslations,
      fsUpdateTranslationSettings,
      // --- STRIPE ----
      fsGetStripeSubscription,
      fsGetProduct,
      fsGetProducts,
      // ---- FUNCTIONS ----
      fbTranslate,
      fbTranslateMeal,
      // ---- STORAGE ----
      fsGetImgDownloadUrl,
      // ---- BRANCHES ----
      fsGetBranch,
      fsGetAllBranches,
      fsAddNewBranch,
      fsUpdateBranch,
      fsUpdateDisabledMealsInBranch,
      fsUpdateBranchesDefaultLanguage,
      // ---- TABLES ----
      fsGetBranchTablesCount,
      fsGetBranchTables,
      fsGetBranchTablesSnapshot,
      fsUpdateBranchTable,
      fsGetTableInfo,
      fsGetDisplayTableInfo,
      fsChangeMenuForAllTables,
      branchTables,
      // ---- ORDERS ----
      fsInitiateNewOrder,
      fsOrderSnapshot,
      fsGetActiveOrdersSnapshot,
      orderSnapShot,
      activeOrders,
      fsGetTableOrdersByPeriod,
      fsGetOrdersByFilter,
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
      // --- Customers ---
      fsGetCustomers,
      fsDeleteCustomer,
      fsBatchAddCustomers,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
