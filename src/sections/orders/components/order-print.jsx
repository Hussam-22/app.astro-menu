import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import Logo from 'src/components/logo';

const OrderPrint = forwardRef(({ orderInfo, branchInfo, businessName }, ref) => {
  const meals = [...new Set(orderInfo.cart.map((cartItem) => cartItem.mealID))];

  // Display full date and time
  const orderTime = new Date().toLocaleString();

  // Get the total bill
  const tax = +branchInfo.taxValue / 100;
  const total = +orderInfo.cart.reduce((acc, cart) => acc + cart.price, 0);
  const taxValue = +(tax * total).toFixed(2);
  const totalBillAmount = (total + total * tax).toFixed(2);

  return (
    <div
      ref={ref}
      style={{
        padding: '16px',
        maxWidth: '500px',
      }}
    >
      <h4 style={{ textAlign: 'center', lineHeight: '18px', margin: 0, padding: 0 }}>
        Order Invoice
      </h4>
      <p style={{ fontSize: '0.875rem', textAlign: 'center', margin: 0, padding: 0 }}>
        Thank you for dining at <span style={{ fontWeight: '600' }}>{businessName}</span>
      </p>
      <div
        key={orderInfo.docID}
        style={{
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 0,
          padding: 0,
        }}
      >
        <p style={{ fontSize: '0.65rem', margin: 0 }}>
          Order#: {orderInfo.docID} | {orderTime}
        </p>
      </div>

      <hr style={{ borderStyle: 'dashed' }} />

      {meals.map((mealID) =>
        orderInfo.cart
          .filter((cart) => mealID === cart.mealID)
          .slice(0, 1)
          .map((cartItem, key) => (
            <div key={key}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p
                  style={{
                    fontWeight: 'bold',
                    margin: 0,
                    padding: 0,
                    fontSize: '0.9rem',
                  }}
                >
                  {cartItem?.title}
                </p>
                <p
                  style={{
                    margin: '0 4px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                  }}
                >
                  x{orderInfo.cart.filter((cartPortion) => cartPortion.mealID === mealID).length}
                </p>
              </div>

              {/* Portions */}
              <div style={{ marginLeft: '24px', marginTop: '4px', width: '85%' }}>
                {orderInfo.cart
                  .filter((cartPortion) => cartPortion.mealID === mealID)
                  .map((portion, index) => (
                    <div key={index} style={{ margin: 0, padding: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <p
                          style={{
                            margin: '0',
                            padding: '0',
                            fontSize: '0.75rem',
                            textDecoration: portion.price === 0 ? 'line-through' : 'none',
                          }}
                        >
                          - {portion.portionSize}
                        </p>
                        <p
                          style={{
                            margin: '0',
                            padding: '0',
                            fontSize: '0.75rem',
                            textDecoration: portion.price === 0 ? 'line-through' : 'none',
                          }}
                        >
                          {portion.price} {branchInfo?.currency}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
      )}

      {/* Add Hr before Total */}
      <hr style={{ borderStyle: 'dashed' }} />

      {/* Total Bill at the bottom right */}
      <div
        style={{
          textAlign: 'right',
          paddingRight: '16px',
          marginTop: '8px',
        }}
      >
        {branchInfo?.taxValue && branchInfo?.taxValue !== 0 && (
          <p style={{ fontSize: '0.9rem', margin: 0.5, padding: 0.5, lineHeight: '20px' }}>
            {`Tax(${branchInfo.taxValue}%): ${taxValue} ${branchInfo?.currency}`}
          </p>
        )}

        <p style={{ fontSize: '0.9rem', margin: 0.5, padding: 0.5, lineHeight: '20px' }}>
          Amount: {total} {branchInfo?.currency}
        </p>

        <p
          style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            margin: 0.5,
            padding: 0.5,
            lineHeight: '20px',
          }}
        >
          Total: {totalBillAmount} {branchInfo?.currency}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '14px',
          padding: '8px',
          backgroundColor: '#f5f5f5',
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '4px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ fontSize: '0.65rem', textAlign: 'center', margin: 0, padding: 0 }}>
            Powered by
          </p>
          {/* <img
            src="https://firebasestorage.googleapis.com/v0/b/menu-app-b268b.appspot.com/o/astro-logo-sm.png?alt=media&token=d4cc813e-f993-40ba-8c8b-992a1d5c3136"
            alt="astro-logo"
            width="30"
            height="30"
          /> */}
          <Logo small />
        </div>
        <a
          href="https://astro-menu.com"
          style={{
            fontSize: '0.65rem',
            textAlign: 'center',
            margin: 0,
            padding: 0,
          }}
        >
          www.astro-menu.com
        </a>
      </div>
    </div>
  );
});

OrderPrint.propTypes = {
  orderInfo: PropTypes.object,
  branchInfo: PropTypes.object,
  businessName: PropTypes.string,
};

export default OrderPrint;
