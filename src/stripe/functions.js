import axios from 'axios';

import { STRIPE } from 'src/config-global';

const LOCAL_URL = 'http://localhost:4242';
const LIVE_URL = 'https://stripe-astro-menu.vercel.app';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${STRIPE.secretKey}`,
};

export const stripeCreateCustomer = async (email, name, useLocalUrl = false) => {
  const body = {
    email,
    name,
  };

  const url = `${useLocalUrl ? LOCAL_URL : LIVE_URL}/create-customer`;

  try {
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