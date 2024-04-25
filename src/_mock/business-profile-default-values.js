export const DEFAULT_LABELS = [
  'chicken',
  'beef',
  'plant-based',
  'spicy',
  'gluten free',
  'seafood',
  'healthy',
  'Asian',
  'italian',
  'vegetarian',
];
export const DEFAULT_MEALS = (businessProfileID) => [
  {
    description: 'Tender grilled chicken breast served with a side of seasonal vegetables.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['chicken'],
    portions: [
      { gram: 300, portionSize: 'small', price: 15 },
      { gram: 500, portionSize: 'regular', price: 20 },
      { gram: 700, portionSize: 'large', price: 25 },
    ],
    title: 'Grilled Chicken Breast',
    businessProfileID,
    section: 'Chicken Meals',
  },
  {
    description: 'Authentic beef tacos with spicy seasoning, served with salsa and sour cream.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['beef', 'spicy'],
    portions: [
      { gram: 300, portionSize: 'small', price: 12 },
      { gram: 500, portionSize: 'regular', price: 18 },
      { gram: 700, portionSize: 'large', price: 24 },
    ],
    title: 'Beef Tacos',
    businessProfileID,
    section: 'Beef Meals',
  },
  {
    description:
      'Freshly stir-fried vegetables tossed in a savory sauce, served over steamed rice.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['plant-based'],
    portions: [
      { gram: 300, portionSize: 'small', price: 10 },
      { gram: 500, portionSize: 'regular', price: 15 },
      { gram: 700, portionSize: 'large', price: 20 },
    ],
    title: 'Vegetable Stir Fry',
    businessProfileID,
    section: 'Vegetarian',
  },
  {
    description: 'Delicious gluten-free pasta served with rich marinara sauce and fresh basil.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['gluten free'],
    portions: [
      { gram: 300, portionSize: 'small', price: 12 },
      { gram: 500, portionSize: 'regular', price: 18 },
      { gram: 700, portionSize: 'large', price: 24 },
    ],
    title: 'Gluten-Free Pasta with Marinara Sauce',
    businessProfileID,
    section: 'Pastas',
  },
  {
    description:
      'Spicy black bean patty topped with avocado, lettuce, tomato, and chipotle mayo on a toasted bun.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['plant-based', 'spicy'],
    portions: [
      { gram: 200, portionSize: 'small', price: 10 },
      { gram: 400, portionSize: 'regular', price: 15 },
      { gram: 600, portionSize: 'large', price: 20 },
    ],
    title: 'Spicy Black Bean Burger',
    businessProfileID,
    section: 'Vegetarian',
  },
  {
    description:
      'Healthy grilled salmon fillet served with a refreshing quinoa salad and lemon vinaigrette.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['seafood', 'healthy'],
    portions: [
      { gram: 250, portionSize: 'small', price: 18 },
      { gram: 400, portionSize: 'regular', price: 24 },
      { gram: 600, portionSize: 'large', price: 30 },
    ],
    title: 'Grilled Salmon with Quinoa Salad',
    businessProfileID,
    section: 'Seafood Meals',
  },
  {
    description:
      'Classic Caesar salad topped with grilled chicken breast, parmesan cheese, and homemade croutons.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['chicken'],
    portions: [
      { gram: 300, portionSize: 'small', price: 12 },
      { gram: 500, portionSize: 'regular', price: 18 },
      { gram: 700, portionSize: 'large', price: 24 },
    ],
    title: 'Classic Caesar Salad with Grilled Chicken',
    businessProfileID,
    section: 'Salads',
  },
  {
    description: 'Savory beef curry cooked with aromatic spices, served with fluffy basmati rice.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['beef', 'spicy', 'Asian'],
    portions: [
      { gram: 300, portionSize: 'small', price: 14 },
      { gram: 500, portionSize: 'regular', price: 20 },
      { gram: 700, portionSize: 'large', price: 26 },
    ],
    title: 'Spicy Beef Curry with Basmati Rice',
    businessProfileID,
    section: 'Beef Meals',
  },
  {
    description: 'Creamy mushroom risotto made with Arborio rice, mushrooms, and parmesan cheese.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['vegetarian', 'Italian'],
    portions: [
      { gram: 300, portionSize: 'small', price: 13 },
      { gram: 500, portionSize: 'regular', price: 19 },
      { gram: 700, portionSize: 'large', price: 25 },
    ],
    title: 'Mushroom Risotto',
    businessProfileID,
    section: 'Pastas',
  },
  {
    description:
      'Juicy grilled steak served with roasted potatoes and a side of seasonal vegetables.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['beef'],
    portions: [
      { gram: 300, portionSize: 'small', price: 18 },
      { gram: 500, portionSize: 'regular', price: 25 },
      { gram: 700, portionSize: 'large', price: 30 },
    ],
    title: 'Grilled Steak',
    businessProfileID,
    section: 'Beef Meals',
  },
  {
    description: 'Crispy fried chicken served with mashed potatoes, gravy, and coleslaw.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['chicken'],
    portions: [
      { gram: 300, portionSize: 'small', price: 14 },
      { gram: 500, portionSize: 'regular', price: 20 },
      { gram: 700, portionSize: 'large', price: 26 },
    ],
    title: 'Fried Chicken Platter',
    businessProfileID,
    section: 'Chicken Meals',
  },
  {
    description: 'Spicy shrimp stir-fry with bell peppers, onions, and a tangy soy sauce.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['seafood', 'spicy'],
    portions: [
      { gram: 300, portionSize: 'small', price: 16 },
      { gram: 500, portionSize: 'regular', price: 22 },
      { gram: 700, portionSize: 'large', price: 28 },
    ],
    title: 'Spicy Shrimp Stir-Fry',
    businessProfileID,
    section: 'Seafood Meals',
  },
  {
    description:
      'Vegetarian quinoa salad with mixed greens, cherry tomatoes, cucumbers, and feta cheese.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['vegetarian'],
    portions: [
      { gram: 300, portionSize: 'small', price: 12 },
      { gram: 500, portionSize: 'regular', price: 18 },
      { gram: 700, portionSize: 'large', price: 24 },
    ],
    title: 'Quinoa Salad',
    businessProfileID,
    section: 'Salads',
  },
  {
    description:
      'Homemade cheeseburger with lettuce, tomato, onion, pickles, and special sauce on a brioche bun.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['beef'],
    portions: [
      { gram: 300, portionSize: 'small', price: 13 },
      { gram: 500, portionSize: 'regular', price: 19 },
      { gram: 700, portionSize: 'large', price: 25 },
    ],
    title: 'Classic Cheeseburger',
    businessProfileID,
    section: 'Beef Meals',
  },
  {
    description:
      'Vegetarian chili made with beans, tomatoes, peppers, and a blend of spices, served with cornbread.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['vegetarian', 'spicy'],
    portions: [
      { gram: 300, portionSize: 'small', price: 10 },
      { gram: 500, portionSize: 'regular', price: 15 },
      { gram: 700, portionSize: 'large', price: 20 },
    ],
    title: 'Vegetarian Chili',
    businessProfileID,
    section: 'Salads',
    menu: 'Gourmet',
  },
  {
    description:
      'Tender chicken marinated in aromatic spices and yogurt, layered with fragrant basmati rice, and slow-cooked to perfection. Served with raita and spicy curry sauce on the side.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['chicken'],
    portions: [
      { gram: 300, portionSize: 'small', price: 16 },
      { gram: 500, portionSize: 'regular', price: 26 },
      { gram: 700, portionSize: 'large', price: 36 },
    ],
    title: 'Chicken Biryani',
    businessProfileID,
    section: 'Entrees',
    menu: 'Gourmet',
  },
  {
    description:
      'Juicy beef kofta skewers seasoned with Middle Eastern spices and grilled to perfection. Served with fluffy basmati rice, grilled vegetables, and a tangy tzatziki sauce.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['beef'],
    portions: [
      { gram: 300, portionSize: 'small', price: 20 },
      { gram: 500, portionSize: 'regular', price: 30 },
      { gram: 700, portionSize: 'large', price: 40 },
    ],
    title: 'Beef Kofta',
    businessProfileID,
    section: 'Entrees',
    menu: 'Gourmet',
  },
  {
    description:
      'Marinated slices of chicken roasted on a vertical spit, served with warm pita bread, garlic sauce, and pickled vegetables. Accompanied by a side of tabbouleh salad.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['chicken'],
    portions: [
      { gram: 300, portionSize: 'small', price: 15 },
      { gram: 500, portionSize: 'regular', price: 25 },
      { gram: 700, portionSize: 'large', price: 35 },
    ],
    title: 'Chicken Shawarma',
    businessProfileID,
    section: 'Entrees',
  },
  {
    description:
      'Tender beef simmered in a rich coconut milk sauce with lemongrass, galangal, and aromatic spices until tender. Served with steamed jasmine rice and crispy fried shallots.',
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['beef'],
    portions: [
      { gram: 300, portionSize: 'small', price: 22 },
      { gram: 500, portionSize: 'regular', price: 32 },
      { gram: 700, portionSize: 'large', price: 42 },
    ],
    title: 'Beef Rendang',
    businessProfileID,
    section: 'Entrees',
    menu: 'Gourmet',
  },
  {
    description: `Bavette Steak & Sherry Shallot Sauce with Crème Fraîche Mashed Potatoes & Roasted Green Beans`,
    isActive: true,
    isDeleted: false,
    isNew: true,
    lastUpdatedAt: new Date(),
    mealLabels: ['beef'],
    portions: [
      { gram: 300, portionSize: 'small', price: 35 },
      { gram: 500, portionSize: 'regular', price: 45 },
      { gram: 700, portionSize: 'large', price: 55 },
    ],
    title: 'Bavette Steak & Sherry Shallot Sauce',
    businessProfileID,
    section: 'Entrees',
    menu: 'Gourmet',
  },
];
export const DEFAULT_MENUS = (businessProfileID) => [
  {
    description: 'Default Menu for most of our branches',
    isActive: true,
    isDeleted: false,
    lastUpdatedAt: new Date(),
    lastUpdatedBy: '',
    title: 'Default Menu',
    businessProfileID,
  },
  {
    description: 'Special Menu for Dubai Gourmet Branch',
    isActive: true,
    isDeleted: false,
    lastUpdatedAt: new Date(),
    lastUpdatedBy: '',
    title: 'Gourmet Menu',
    businessProfileID,
  },
];
export const DEFAULT_MENU_SECTIONS = [
  'Beef Meals',
  'Chicken Meals',
  'Pastas',
  'Seafood Meals',
  'Salads',
  'Vegetarian ',
];
export const DEFAULT_BRANCHES = (businessProfileID) => [
  {
    allowSelfOrder: true,
    currency: 'د.إ',
    defaultLanguage: 'en',
    description: 'Main Branch - Dubai',
    email: 'hello@cool-restaurant.com',
    imgUrl:
      'https://firebasestorage.googleapis.com/v0/b/menu-app-b268b/o/_mock%2Fbranches%2Fbranch-1_800x800.webp?alt=media&token=fb35cd0a-8c90-4500-b9de-9862b3dfc3f8',
    isActive: true,
    isDeleted: false,
    lastUpdatedAt: new Date(),
    lastUpdatedBy: '',
    number: '97141234567',
    taxValue: 5,
    title: 'Main Branch',
    wifiPassword: 'Connect@2024',
    businessProfileID,
  },
  {
    allowSelfOrder: true,
    currency: 'د.إ',
    defaultLanguage: 'en',
    description: 'Abu Dhabi Branch - Cornish St.',
    email: 'hello@cool-restaurant.com',
    imgUrl:
      'https://firebasestorage.googleapis.com/v0/b/menu-app-b268b/o/_mock%2Fbranches%2Fbranch-3_800x800.webp?alt=media&token=4a90180c-280c-4c52-94ee-3aba5ee2ac50',
    isActive: true,
    isDeleted: false,
    lastUpdatedAt: new Date(),
    lastUpdatedBy: '',
    number: '97121234567',
    taxValue: 5,
    title: 'Abu Dhabi Branch',
    wifiPassword: 'HelloWifi_01234',
    businessProfileID,
  },
  {
    allowSelfOrder: true,
    currency: 'د.إ',
    defaultLanguage: 'en',
    description: 'Sharjah Branch - University Street',
    email: 'hello@cool-restaurant.com',
    imgUrl:
      'https://firebasestorage.googleapis.com/v0/b/menu-app-b268b/o/_mock%2Fbranches%2Fbranch-4_800x800.webp?alt=media&token=97f82a0c-78e5-439f-bd3a-d19c8595b459',
    isActive: true,
    isDeleted: false,
    lastUpdatedAt: new Date(),
    lastUpdatedBy: '',
    number: '97161234567',
    taxValue: 5,
    title: 'Sharjah Branch',
    wifiPassword: 'BranchPass^701',
    businessProfileID,
  },
];
export const DEFAULT_STAFF = (businessProfileID) => [];