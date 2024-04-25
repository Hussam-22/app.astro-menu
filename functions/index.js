const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Translate } = require('@google-cloud/translate').v2;

admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const translate = new Translate({ projectId: process.env.PROJECT_ID });

exports.fbTranslateSectionTitle = functions.https.onCall(async (data, context) => {
  // get to-translate string & target translation languages array
  const { text, sectionRef } = data;

  // get section data
  const sectionDoc = (await admin.firestore().doc(sectionRef).get()).data();

  // get available languages from user profile
  const userDocRef = `/users/${sectionDoc.userID}`;
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
  const { text, branchRef, userID } = data;

  // get section data
  const branchDoc = (await admin.firestore().doc(branchRef).get()).data();

  // get available languages from user profile
  const userDocRef = `/users/${userID}`;
  const userDoc = (await admin.firestore().doc(userDocRef).get()).data();

  // translate string to target languages
  const tasks = userDoc.languages.map(async (lang) => ({
    [lang]: {
      desc: await (await translate.translate(text.description, lang)).slice(0, 1).toString(),
    },
  }));

  // resolve translation Promise
  const translations = await Promise.all(tasks);

  // flat translation array to single object
  const translationObj = Object.assign({}, ...translations);

  // update meal section
  await admin
    .firestore()
    .doc(branchRef)
    .update({ ...branchDoc, translation: translationObj, translationEdited: translationObj });

  return null;
});
