import React from 'react';

const profileTab = (
  activeTab,
  firstName,
  lastName,
  phoneNumber,
  user,
  orders,
  expandedSection,
  setExpandedSection,
  navigate,
  Verification,
  isLoading
) => {
  switch (activeTab) {
    case 'accountInfo':
      return (
        <div className="account-info">
          <h3>Account Information</h3>
          <div className="account-info-cards">
            <div className="info-card">
              <h4>First Name</h4>
              <p>{firstName || 'N/A'}</p>
            </div>
            <div className="info-card">
              <h4>Last Name</h4>
              <p>{lastName || 'N/A'}</p>
            </div>
            <div className="info-card">
              <h4>Phone Number</h4>
              <p>{phoneNumber || 'N/A'}</p>
            </div>
            <div className="info-card">
              <h4>Email</h4>
              <p>{user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>
      );
    case 'orderHistory':
      return (
        <div>
          <h3>Order History</h3>
          {orders.length === 0 ? (
            <p>You have no past orders.</p>
          ) : (
            <div className="order-history">
              {orders.map((order, index) => (
                <div key={order.id} className="order-card">
                  <div className="order-section">
                    <button
                      className="order-section-header"
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === `order-${index}-id` ? null : `order-${index}-id`
                        )
                      }
                    >
                      <p>
                        <strong>Order #:</strong> {order.id}
                      </p>
                      <p>
                        <strong>Date:</strong> {order.createdAt?.toDate().toLocaleString()}
                      </p>
                    </button>
                    {expandedSection === `order-${index}-id` && (
                      <div className="order-section-content">
                        <p>
                          <strong>Status:</strong> {order.status || 'Pending'}
                        </p>
                        <p>
                          <strong>Total:</strong> ${order.total.toFixed(2)}
                        </p>
                        <p>
                          <strong>Special Instructions:</strong>{' '}
                          {order.specialInstructions || 'None'}
                        </p>
                        <p>
                          <strong>Items:</strong>
                        </p>
                        <ul>
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => navigate(`/order-tracking/${order.id}`)}
                          className="track-order-btn"
                          disabled={order.status === 'Complete'}
                        >
                          {order.status === 'Complete' ? 'Order Completed' : 'Track Order'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case 'payment':
      return (
        <div>
          <h3>Payment</h3>
          <p>Payment methods will be displayed here.</p>
        </div>
      );
    case 'verification':
      return (
        <div>
          <h3>Email Verification</h3>
          {user ? (
            user.emailVerified ? (
              <p>Your email is verified. Thank you!</p>
            ) : (
              <>
                <p>Your email is not verified. Please verify your email to access all features.</p>
                <button onClick={Verification} className="button2" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </>
            )
          ) : (
            <p>Loading user information...</p>
          )}
        </div>
      );
    default:
      return null;
  }
};

export default profileTab;