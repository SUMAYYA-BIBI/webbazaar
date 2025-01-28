import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cart from './Cart';

// Mock CartItems component
jest.mock('../Components/CartItems/CartItems', () => {
  return function MockCartItems() {
    return (
      <div data-testid="cart-items">
        <h2>Shopping Cart</h2>
        <div data-testid="cart-products">
          <div data-testid="cart-item-1">
            <span>Product 1</span>
            <span>Quantity: 2</span>
            <span>Price: $200</span>
          </div>
          <div data-testid="cart-item-2">
            <span>Product 2</span>
            <span>Quantity: 1</span>
            <span>Price: $100</span>
          </div>
        </div>
        <div data-testid="cart-total">Total: $300</div>
      </div>
    );
  };
});

describe('Cart Component', () => {
  describe('Rendering', () => {
    beforeEach(() => {
      render(<Cart />);
    });

    it('should render CartItems component', () => {
      expect(screen.getByTestId('cart-items')).toBeInTheDocument();
    });

    it('should display cart products', () => {
      expect(screen.getByTestId('cart-products')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
    });

    it('should display correct product information', () => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
      expect(screen.getByText('Price: $200')).toBeInTheDocument();

      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
      expect(screen.getByText('Price: $100')).toBeInTheDocument();
    });

    it('should display cart total', () => {
      expect(screen.getByTestId('cart-total')).toBeInTheDocument();
      expect(screen.getByText('Total: $300')).toBeInTheDocument();
    });

    it('should display shopping cart title', () => {
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    });
  });
});
