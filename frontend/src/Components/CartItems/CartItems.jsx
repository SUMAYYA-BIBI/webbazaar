import React, { useContext, useState } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";

const CartItems = () => {
  const { products, cartItems, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");

  const handleCheckout = async () => {
    setLoading(true);

    const authToken = localStorage.getItem("auth-token");
    const orderData = {
      items: products
        .filter((e) => cartItems[e.id] > 0)
        .map((e) => ({
          id: e.id,
          name: e.name,
          price: e.new_price,
          quantity: cartItems[e.id],
          total: e.new_price * cartItems[e.id],
        })),
      totalAmount: getTotalCartAmount(),
    };

    if (!authToken) {
      setNotification("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    if (orderData.items.length === 0) {
      setNotification("Your cart is empty!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backend_url}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": authToken,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setNotification(result.message || "Order placed successfully!");
      } else {
        const errorResult = await response.json();
        setNotification(errorResult.message || "Checkout failed");
      }
    } catch (error) {
      setNotification("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return ''; 
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${backend_url}${imagePath}`;
    return `${backend_url}/images/${imagePath}`;
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p data-testid="cart-header-products">Products</p>
        <p data-testid="cart-header-title">Title</p>
        <p data-testid="cart-header-price">Price</p>
        <p data-testid="cart-header-quantity">Quantity</p>
        <p data-testid="cart-header-total">Total</p>
        <p data-testid="cart-header-remove">Remove</p>
      </div>
      <hr />
      {products.map((e) => {
        if (cartItems[e.id] > 0) {
          return (
            <div key={e.id} data-testid={`cart-item-product-${e.id}`}>
              <div className="cartitems-format-main cartitems-format">
                <img
                  className="cartitems-product-icon"
                  src={getImageUrl(e.image)}
                  alt={e.name}
                />
                <p data-testid={`cart-item-product-${e.id}-name`}>{e.name}</p>
                <p>{currency}{e.new_price}</p>
                <p data-testid={`cart-item-product-${e.id}-quantity`}>{cartItems[e.id]}</p>
                <p>{currency}{e.new_price * cartItems[e.id]}</p>
                <img
                  onClick={() => removeFromCart(e.id)}
                  className="cartitems-remove-icon"
                  src={cross_icon}
                  alt="Remove item"
                  data-testid="remove-button"
                />
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}

      <div className="cartitems-down">
        <div className="cartitems-total" data-testid="cart-totals">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item" data-testid="cart-totals-subtotal">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item" data-testid="cart-totals-shipping-fee">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item" data-testid="cart-totals-total">
              <h3>Total</h3>
              <h3>{currency}{getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={handleCheckout} disabled={loading}>
            {loading ? "Processing..." : "PROCEED TO CHECKOUT"}
          </button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
      {notification && (
        <div className="cartitems-notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default CartItems;
