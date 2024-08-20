const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Translate } = require('@google-cloud/translate').v2;
const { LANGUAGE_CODES } = require('./languageCodes');

admin.initializeApp(functions.config().firebase);

// // use this command to deploy functions: firebase deploy --only functions
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const translate = new Translate({ projectId: process.env.PROJECT_ID });

exports.fbTranslateSectionTitle = functions.https.onCall(async (data) => {
  try {
    // get to-translate string & target translation languages array
    const { text, sectionRef, newLang, toRemoveLang } = data;

    // get section data
    const sectionDoc = (await admin.firestore().doc(sectionRef).get()).data();

    // translate string to target languages
    const tasks = newLang.map(async (lang) => ({
      [lang]: {
        title: await (await translate.translate(text, lang))[0].toString(),
      },
    }));

    toRemoveLang.forEach((lang) => {
      delete sectionDoc.translation[lang];
      delete sectionDoc.translationEdited[lang];
    });

    // resolve translation Promise
    const translations = await Promise.all(tasks);

    // flat translation array to single object
    const translationObj = Object.assign({}, ...translations);

    // update menu section
    await admin
      .firestore()
      .doc(sectionRef)
      .update({ ...sectionDoc, translation: translationObj, translationEdited: translationObj });

    return {
      status: 'success',
      message: 'Translations updated successfully',
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 'error',
      message: 'An error occurred while updating translations',
    };
  }
});
exports.fbTranslateMeal = functions.https.onCall(async (data) => {
  try {
    // get to-translate string & target translation languages array
    const { text, mealRef, newLang, toRemoveLang } = data;

    // get section data
    const mealDoc = (await admin.firestore().doc(mealRef).get()).data();

    // translate string to target languages
    const tasks = newLang.map(async (lang) => ({
      [lang]: {
        title: (await translate.translate(text.title, lang))[0].toString(),
        desc: (await translate.translate(text.desc, lang))[0].toString(),
      },
    }));

    // remove languages from translationEdited
    toRemoveLang.forEach((lang) => {
      delete mealDoc.translation[lang];
      delete mealDoc.translationEdited[lang];
    });

    // resolve translation Promise
    const translations = await Promise.all(tasks);

    // flat translation array to single object
    const translationObj = Object.assign({}, ...translations);

    // update meal section
    await admin
      .firestore()
      .doc(mealRef)
      .update({ ...mealDoc, translation: translationObj, translationEdited: translationObj });

    return {
      status: 'success',
      message: 'Translations updated successfully',
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 'error',
      message: 'An error occurred while updating translations',
    };
  }
});
exports.fbTranslateBranchDesc = functions.https.onCall(async (data) => {
  try {
    const { title, desc, businessProfileID, newLang, toRemoveLang } = data;

    const businessProfileRef = `/businessProfiles/${businessProfileID}`;
    const businessProfileDoc = (await admin.firestore().doc(businessProfileRef).get()).data();

    // translate string to target languages
    const tasks = newLang.map(async (lang) => ({
      [lang]: {
        title: (await translate.translate(title, lang))[0].toString(),
        desc: (await translate.translate(desc, lang))[0].toString(),
      },
    }));

    // remove languages from translationEdited
    toRemoveLang.forEach((lang) => {
      delete businessProfileDoc.translation[lang];
      delete businessProfileDoc.translationEdited[lang];
    });

    // resolve translation Promise
    const translations = await Promise.all(tasks);

    // flat translation array to single object
    const translationObj = Object.assign({}, ...translations);

    // update businessProfileDoc section
    await admin
      .firestore()
      .doc(businessProfileRef)
      .update({
        translation: { ...businessProfileDoc.translation, ...translationObj },
        translationEdited: { ...businessProfileDoc.translationEdited, ...translationObj },
      });

    return {
      status: 'success',
      message: 'Translations updated successfully',
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 'error',
      message: 'An error occurred while updating translations',
    };
  }
});
exports.fbTranslateMealLabelTitle = functions.https.onCall(async (data) => {
  try {
    const { labelTitle, businessProfileID, labelDocID, newLang, toRemoveLang } = data;

    // get label data
    const mealLabelRef = `/businessProfiles/${businessProfileID}/meal-labels/${labelDocID}`;
    const labelDoc = (await admin.firestore().doc(mealLabelRef).get()).data();

    // translate string to target languages
    const tasks = newLang.map(async (lang) => ({
      [lang]: {
        title: (await translate.translate(labelTitle, lang))[0].toString(),
      },
    }));

    // remove languages from translationEdited
    toRemoveLang.forEach((lang) => {
      delete labelDoc.translation[lang];
      delete labelDoc.translationEdited[lang];
    });

    // resolve translation Promise
    const translations = await Promise.all(tasks);

    // flat translation array to single object
    const translationObj = Object.assign({}, ...translations);

    // update menu section
    await admin
      .firestore()
      .doc(mealLabelRef)
      .update({ ...labelDoc, translation: translationObj, translationEdited: translationObj });

    return {
      status: 'success',
      message: 'Translations updated successfully',
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 'error',
      message: 'An error occurred while updating translations',
    };
  }
});
exports.fbTranslateKeyword = functions.https.onCall(async (keywordsArray) => {
  const translationTasks = Object.keys(LANGUAGE_CODES).map(async (langKey) => {
    const keywordObject = {
      lang: langKey,
      keywords: keywordsArray,
      translations: (await translate.translate(keywordsArray.join('*'), langKey))
        .slice(0, 1)
        .toString()
        .split('*'),
    };

    const docRef = `/system-translations/${langKey}`;
    await admin
      .firestore()
      .doc(docRef)
      .set({ ...keywordObject });
  });

  await Promise.all(translationTasks);

  return null;
});
