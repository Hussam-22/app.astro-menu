const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Translate } = require('@google-cloud/translate').v2;
const { LANGUAGE_CODES } = require('./languageCodes');

admin.initializeApp(functions.config().firebase);

// // use this command to deploy functions: firebase deploy --only functions
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const translate = new Translate({ projectId: process.env.PROJECT_ID });

exports.fbTranslateSectionTitle = functions.https.onCall(async (data, context) => {
  // get to-translate string & target translation languages array
  const { text, sectionRef } = data;

  // get section data
  const sectionDoc = (await admin.firestore().doc(sectionRef).get()).data();

  // get available languages from user profile
  const userDocRef = `/businessProfiles/${sectionDoc.businessProfileID}`;
  const userDoc = (await admin.firestore().doc(userDocRef).get()).data();

  // translate string to target languages
  const tasks = userDoc.languages.map(async (lang) => ({
    [lang]: {
      title: await (await translate.translate(text, lang)).slice(0, 1).toString(),
    },
  }));

  // resolve translation Promise
  const translations = await Promise.all(tasks);

  // flat translation array to single object
  const translationObj = Object.assign({}, ...translations);

  // update menu section
  await admin
    .firestore()
    .doc(sectionRef)
    .update({ ...sectionDoc, translation: translationObj, translationEdited: translationObj });

  return null;
});

exports.fbTranslateMeal = functions.https.onCall(async (data, context) => {
  // get to-translate string & target translation languages array
  const { text, mealRef, businessProfileID } = data;

  // get section data
  const mealDoc = (await admin.firestore().doc(mealRef).get()).data();

  // get available languages from user profile
  const userDocRef = `/businessProfiles/${businessProfileID}`;
  const businessProfileDoc = (await admin.firestore().doc(userDocRef).get()).data();

  // translate string to target languages
  const tasks = businessProfileDoc.languages.map(async (lang) => ({
    [lang]: {
      title: await (await translate.translate(text.title, lang)).slice(0, 1).toString(),
      desc: await (await translate.translate(text.desc, lang)).slice(0, 1).toString(),
    },
  }));

  // resolve translation Promise
  const translations = await Promise.all(tasks);

  // flat translation array to single object
  const translationObj = Object.assign({}, ...translations);

  // update meal section
  await admin
    .firestore()
    .doc(mealRef)
    .update({ ...mealDoc, translation: translationObj, translationEdited: translationObj });

  return null;
});

exports.fbTranslateBranchDesc = functions.https.onCall(async (data, context) => {
  // get to-translate string & target translation languages array
  const { title, desc, businessProfileID } = data;

  const businessProfileRef = `/businessProfiles/${businessProfileID}`;
  const businessProfileDoc = (await admin.firestore().doc(businessProfileRef).get()).data();

  // translate string to target languages
  const tasks = businessProfileDoc.languages.map(async (lang) => ({
    [lang]: {
      title: await (await translate.translate(title, lang)).slice(0, 1).toString(),
      desc: await (await translate.translate(desc, lang)).slice(0, 1).toString(),
    },
  }));

  // resolve translation Promise
  const translations = await Promise.all(tasks);

  // flat translation array to single object
  const translationObj = Object.assign({}, ...translations);

  // update businessProfileDoc section
  await admin
    .firestore()
    .doc(businessProfileRef)
    .update({
      ...businessProfileDoc,
      translation: translationObj,
      translationEdited: translationObj,
    });

  return null;
});

exports.fbTranslateMealLabelTitle = functions.https.onCall(async (data, context) => {
  const { labelTitle, businessProfileID, labelDocID } = data;

  // get label data
  const mealLabelRef = `/businessProfiles/${businessProfileID}/meal-labels/${labelDocID}`;
  const labelDoc = (await admin.firestore().doc(mealLabelRef).get()).data();

  // get available languages from business profile
  const businessProfileRef = `/businessProfiles/${businessProfileID}`;
  const businessProfileDoc = (await admin.firestore().doc(businessProfileRef).get()).data();

  // translate string to target languages
  const tasks = businessProfileDoc.languages.map(async (lang) => ({
    [lang]: {
      title: await (await translate.translate(labelTitle, lang)).slice(0, 1).toString(),
    },
  }));

  // resolve translation Promise
  const translations = await Promise.all(tasks);

  // flat translation array to single object
  const translationObj = Object.assign({}, ...translations);

  // update menu section
  await admin
    .firestore()
    .doc(mealLabelRef)
    .update({ ...labelDoc, translation: translationObj, translationEdited: translationObj });

  return null;
});

exports.fbTranslateKeyword = functions.https.onCall(async () => {
  const keywords = [
    'most ordered meals',
    'new',
    'out of stock',
    'add',
    'add meal',
    'close',
    'bill',
    'menu',
    'home',
    'reset',
    'meal type',
    'search',
    'menu sections',
    'total bill',
    'order',
    'tax',
    'go to menu',
    'wifi password',
    'any special requests ?',
    'provided by',
    'table',
  ];

  const translationTasks = Object.keys(LANGUAGE_CODES).map(async (langKey) => {
    const tasks = keywords.map(async (keyword) => ({
      [keyword]: (await translate.translate(keyword, langKey)).slice(0, 1).toString(),
    }));

    const translations = await Promise.all(tasks);
    const translationObj = Object.assign({}, ...translations);

    const docRef = `/system-translations/${langKey}`;
    await admin
      .firestore()
      .doc(docRef)
      .set({ ...translationObj });
  });

  await Promise.all(translationTasks);

  return null;
});
