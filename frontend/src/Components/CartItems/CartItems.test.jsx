import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartItems from './CartItems';
import { ShopContext } from '../../Context/ShopContext';

// Mock CSS module
jest.mock('./CartItems.css', () => ({}));

// Mock the image
jest.mock('../Assets/cart_cross_icon.png', () => 'cross-icon-mock');

// Mock App constants
jest.mock('../../App', () => ({
  backend_url: 'http://localhost:4000',
  currency: '$'
}));

// Mock context value
const mockContextValue = {
  products: [
    { id: 1, name: 'Product 1', new_price: 100, image: 'http://example.com/product1.jpg' },
    { id: 2, name: 'Product 2', new_price: 200, image: 'http://example.com/product2.jpg' },
  ],
  cartItems: { 1: 2, 2: 1 },
  removeFromCart: jest.fn(),
  getTotalCartAmount: jest.fn(() => 400),
};

const renderWithShopContext = (ui, contextValue = mockContextValue) => {
  return render(
    <ShopContext.Provider value={contextValue}>{ui}</ShopContext.Provider>
  );
};

describe('CartItems Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders cart header correctly', () => {
    renderWithShopContext(<CartItems />);
    expect(screen.getByTestId('cart-header-products')).toBeInTheDocument();
    expect(screen.getByTestId('cart-header-title')).toBeInTheDocument();
    expect(screen.getByTestId('cart-header-price')).toBeInTheDocument();
    expect(screen.getByTestId('cart-header-quantity')).toBeInTheDocument();
    expect(screen.getByTestId('cart-header-total')).toBeInTheDocument();
    expect(screen.getByTestId('cart-header-remove')).toBeInTheDocument();
  });

  it('renders cart items correctly', () => {
    renderWithShopContext(<CartItems />);
    
    // Product 1
    expect(screen.getByTestId('cart-item-product-1')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-product-1-name')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-product-1-quantity')).toBeInTheDocument();
    
    // Product 2
    expect(screen.getByTestId('cart-item-product-2')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-product-2-name')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-product-2-quantity')).toBeInTheDocument();
  });

  it('renders cart totals correctly', () => {
    renderWithShopContext(<CartItems />);
    expect(screen.getByTestId('cart-totals')).toBeInTheDocument();
    expect(screen.getByTestId('cart-totals-subtotal')).toBeInTheDocument();
    expect(screen.getByTestId('cart-totals-shipping-fee')).toBeInTheDocument();
    expect(screen.getByTestId('cart-totals-total')).toBeInTheDocument();
  });

  it('handles removing item from cart', () => {
    renderWithShopContext(<CartItems />);
    const removeButtons = screen.getAllByTestId('remove-button');
    fireEvent.click(removeButtons[0]); // Click on the first remove button
    expect(mockContextValue.removeFromCart).toHaveBeenCalledWith(1);
  });
});
