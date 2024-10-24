import axios from 'axios';

import { STRIPE } from 'src/config-global';

const LOCAL_URL = 'http://localhost:4242';
const LIVE_URL = 'https://stripe-astro-menu.vercel.app';

const CLIENT_LOCAL_URL = 'http://localhost:3035';
const CLIENT_LIVE_URL = 'https://app-astro-menu.vercel.app';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${STRIPE.secretKey}`,
};

const isLocal = window.location.hostname === 'localhost';
const returnUrl = `${isLocal ? CLIENT_LOCAL_URL : CLIENT_LIVE_URL}/dashboard/subscription-info`;

// export const stripeCreateCustomer = async (
//   email,
//   name,
//   businessProfileID,
//   ownerID,

//   useLocalUrl = false
// ) => {
//   const url = `${useLocalUrl ? LOCAL_URL : LIVE_URL}/create-customer`;
//   const body = {
//     email,
//     name,
//     businessProfileID,
//     ownerID,
//   };

//   try {
//     const response = await axios.post(url, body, { headers });
//     return response.data;
//   } catch (error) {
//     if (error.response) {
//       // Server responded with a status other than 200 range
//       console.error('Server error:', error.response.data);
//     } else if (error.request) {
//       // Request was made but no response received
//       console.error('No response received:', error.request);
//     } else {
//       // Something else happened while setting up the request
//       console.error('Error:', error.message);
//     }
//     throw error;
//   }
// };
export const stripeCreatePortalSession = async (customerEmail, useLocalUrl = false) => {
  const body = {
    customerEmail,
    returnUrl,
  };

  const url = `${useLocalUrl ? LOCAL_URL : LIVE_URL}/create-portal-session`;

  try {
    const response = await axios.post(url, body, { headers });
    window.location = response.data.url;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message);
    }
    throw error;
  }
};
export const stripeCreateCheckoutSession = async (items, useLocalUrl = false) => {
  const body = {
    items: [{ id: 'prod_QS9NWYK9Qt7Ecb', quantity: 1 }],
  };

  const url = `${useLocalUrl ? LOCAL_URL : LIVE_URL}/create-checkout-session`;

  try {
    const response = await axios.post(url, body, { headers });
    window.location = response.data.session.url;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message);
    }
    throw error;
  }
};
export const stripeCreateBusiness = async (
  ownerID,
  email,
  businessName,
  plan,
  productID,
  useLocalUrl = false
) => {
  const url = `${useLocalUrl ? LOCAL_URL : LIVE_URL}/create-business`;
  const body = {
    ownerID,
    email,
    businessName,
    plan,
    productID,
  };

  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error('Server error:', error.response.data);
      throw error.response.data.error;
    }
    // Something else happened while setting up the request
    console.error('Error:', error.message);
    return error.message;
  }
};
export const stripeGetProduct = async (productID, useLocalUrl = false) => {
  const url = `${useLocalUrl ? LOCAL_URL : LIVE_URL}/get-product`;
  const body = {
    productID,
  };

  try {
    const response = await axios.post(url, body, { headers });
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message);
    }
    throw error;
  }
};
export const sendInvoiceEmail = async (
  htmlString,
  customerEmail,
  businessName,
  useLocalUrl = false
) => {
  const url = `${useLocalUrl ? LOCAL_URL : LIVE_URL}/send-invoice-email`;
  const body = {
    htmlString,
    customerEmail,
    businessName,
  };

  console.log(customerEmail, businessName);

  try {
    const response = await axios.post(url, body, { headers });
    console.log(response.data);

    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message);
    }
    throw error;
  }
};
