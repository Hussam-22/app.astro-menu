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

export const stripeCreateCustomer = async (
  email,
  name,
  businessProfileID,
  ownerID,

  useLocalUrl = false
) => {
  const url = `${useLocalUrl ? LOCAL_URL : LIVE_URL}/create-customer`;
  const body = {
    email,
    name,
    businessProfileID,
    ownerID,
  };

  try {
    console.log(headers);

    const response = await axios.post(url, body, { headers });
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
  name,
  businessName,
  plan,
  useLocalUrl = false
) => {
  const url = `${useLocalUrl ? LOCAL_URL : LIVE_URL}/create-business`;
  const body = {
    ownerID,
    email,
    name,
    businessName,
    plan,
  };

  try {
    console.log(headers);

    const response = await axios.post(url, body, { headers });
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
