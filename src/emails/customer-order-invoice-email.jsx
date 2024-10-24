import * as React from 'react';
import PropTypes from 'prop-types';
import { Hr, Img, Link, Text, Html, Heading, Section } from '@react-email/components';

CustomerOrderInvoiceEmail.propTypes = {
  orderInfo: PropTypes.object,
  branchInfo: PropTypes.object,
  businessName: PropTypes.string,
};

export default function CustomerOrderInvoiceEmail({ orderInfo, branchInfo, businessName }) {
  const meals = [...new Set(orderInfo.cart.map((cartItem) => cartItem.mealID))];

  // Display full date and time
  const orderTime = new Date().toLocaleString();

  // Get the total bill
  const tax = +branchInfo.taxValue / 100;
  const total = +orderInfo.cart.reduce((acc, cart) => acc + cart.price, 0);
  const taxValue = +(tax * total).toFixed(2);
  const totalBillAmount = (total + total * tax).toFixed(2);

  return (
    <Html>
      <Section
        style={{
          padding: '16px',
          maxWidth: '500px',
          backgroundColor: '#F3F3F3',
          borderRadius: '15px',
        }}
      >
        <Heading as="h1" style={{ textAlign: 'center' }}>
          Order Invoice
        </Heading>
        <Text style={{ fontSize: '0.975rem', textAlign: 'center' }}>
          Thank you for dining at{' '}
          <span style={{ color: '#e11d48', fontWeight: '600' }}>{businessName}</span>, here is your
          order invoice
        </Text>
        <div
          key={orderInfo.docID}
          style={{
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            gap: '0', // Ensures no extra space
            justifyContent: 'center',
            alignItems: 'center',
            margin: 0,
            padding: 0,
          }}
        >
          {/* Order# and Date together with no space */}
          <Text style={{ fontSize: '0.65rem', margin: 0 }}>
            Order#: {orderInfo.docID} | {orderTime}
          </Text>
        </div>

        <Hr />

        {meals.map((mealID) =>
          orderInfo.cart
            .filter((cart) => mealID === cart.mealID)
            .slice(0, 1)
            .map((cartItem, key) => (
              <div key={key}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', margin: 0, padding: 0 }}>
                    {cartItem?.title}
                  </Text>
                  <Text style={{ margin: '0 4px', fontWeight: '700', color: '#e11d48' }}>
                    x{orderInfo.cart.filter((cartPortion) => cartPortion.mealID === mealID).length}
                  </Text>
                </div>

                {/* Portions */}
                <div style={{ marginLeft: '24px', marginTop: '4px', width: '85%' }}>
                  {orderInfo.cart
                    .filter((cartPortion) => cartPortion.mealID === mealID)
                    .map((portion, index) => (
                      <div
                        key={index}
                        style={{
                          margin: 0, // Minimal space between portions
                          padding: 0,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Text
                            style={{
                              margin: '0',
                              padding: '0',
                              textDecoration: portion.price === 0 ? 'line-through' : 'none',
                            }}
                          >
                            - {portion.portionSize}
                          </Text>
                          <Text
                            style={{
                              margin: '0',
                              padding: '0',
                              textDecoration: portion.price === 0 ? 'line-through' : 'none',
                            }}
                          >
                            {portion.price} {branchInfo?.currency}
                          </Text>
                        </div>
                        {/* {portion?.comment && (
                          <Text
                            style={{
                              marginLeft: '16px',
                              color: 'red',
                              fontSize: '12px',
                              margin: 0,
                              padding: 0,
                            }}
                          >
                            *{portion.comment}
                          </Text>
                        )} */}
                      </div>
                    ))}
                </div>
              </div>
            ))
        )}

        {/* Add Hr before Total */}
        <Hr />

        {/* Total Bill at the bottom right */}
        <div
          style={{
            textAlign: 'right',
            paddingRight: '16px', // Aligns with the padding of the section
            marginTop: '8px',
          }}
        >
          {branchInfo?.taxValue && branchInfo?.taxValue !== 0 && (
            <Text style={{ fontSize: '0.9rem', margin: 0.5, padding: 0.5, lineHeight: '20px' }}>
              {`Tax(${branchInfo.taxValue}%): ${taxValue}  ${branchInfo?.currency}`}
            </Text>
          )}

          <Text style={{ fontSize: '0.9rem', margin: 0.5, padding: 0.5, lineHeight: '20px' }}>
            Amount: {total} {branchInfo?.currency}
          </Text>

          <Text
            style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              margin: 0.5,
              padding: 0.5,
              lineHeight: '20px',
            }}
          >
            Total: {totalBillAmount} {branchInfo?.currency}
          </Text>
        </div>
      </Section>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: '0.65rem', textAlign: 'center', lineHeight: '18px' }}>
            Powered by Astro-Menu
          </Text>
          <Img
            src="https://firebasestorage.googleapis.com/v0/b/menu-app-b268b.appspot.com/o/astro-logo-sm.png?alt=media&token=d4cc813e-f993-40ba-8c8b-992a1d5c3136"
            alt="astro-logo"
            width="30"
            height="30"
          />
        </div>
        <Link
          href="https://astro-menu.com"
          style={{
            fontSize: '0.65rem',
            textAlign: 'center',
            margin: 0,
            padding: 0,
          }}
        >
          www.astro-menu.com
        </Link>
      </div>
    </Html>
  );
}
