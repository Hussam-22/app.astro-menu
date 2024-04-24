export const PLANS_INFO = [
  {
    name: 'Coffee Cup',
    description:
      'Ideal for small businesses like cafes or coffee shops with up to 15 tables. This plan offers basic digital menu features to streamline your operations and enhance customer experience.',
    cost: { monthly: 99, annualDiscount: 10 },
    limits: {
      branch: 1,
      tables: 1,
      languages: 3,
      subUser: 1,
      scans: '1 million /per month',
      analytics: false,
    },
    isMenuOnly: true,
    isFav: false,
    media: {
      icon: 'cafe',
      cover: '',
    },
  },
  {
    name: 'Dine Smart',
    description:
      'Designed for medium-sized restaurants with a capacity of up to 50 tables. The Growth Package provides additional customization options and analytics tools to help you optimize your menu and better understand your customers preferences.',
    cost: { monthly: 299, annualDiscount: 10 },
    limits: {
      branch: 3,
      tables: 1,
      languages: 5,
      subUser: 3,
      scans: '3.5 million /per month',
      analytics: false,
    },
    isMenuOnly: true,
    isFav: false,
    media: {
      icon: 'dinesmart',
      cover: '',
    },
  },
  {
    name: 'Foodify',
    description:
      'Designed for upscale restaurants and fine dining establishments, providing a galaxy of features to delight both chefs and patrons',
    cost: { monthly: 499, annualDiscount: 10 },
    limits: {
      branch: 3,
      tables: 35,
      languages: 5,
      subUser: 5,
      scans: 5000000,
      analytics: true,
    },
    isMenuOnly: false,
    isFav: true,
    media: {
      icon: 'foodify',
      cover: '',
    },
  },
  {
    name: 'Menu Master',
    description:
      'An elite package for restaurant chains and franchises, offering a constellation of tools to manage multiple locations with ease and precision.',
    cost: { monthly: 899, annualDiscount: 10 },
    limits: {
      branch: 5,
      tables: 50,
      languages: 8,
      subUser: 7,
      scans: 10000000,
      analytics: true,
    },
    isMenuOnly: false,
    isFav: false,
    media: {
      icon: 'menumaster',
      cover: '',
    },
  },
];
