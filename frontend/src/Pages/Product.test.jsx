import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Product from './Product';
import { ShopContext } from '../Context/ShopContext';
import { useParams } from 'react-router-dom';

// Mock the components used in Product
jest.mock('../Components/Breadcrums/Breadcrums', () => {
  return function MockBreadcrums({ product }) {
    return <div data-testid="breadcrums">Breadcrums: {product.name}</div>;
  };
});

jest.mock('../Components/ProductDisplay/ProductDisplay', () => {
  return function MockProductDisplay({ product }) {
    return <div data-testid="product-display">Product Display: {product.name}</div>;
  };
});

jest.mock('../Components/DescriptionBox/DescriptionBox', () => {
  return function MockDescriptionBox() {
    return <div data-testid="description-box">Description Box</div>;
  };
});

jest.mock('../Components/RelatedProducts/RelatedProducts', () => {
  return function MockRelatedProducts({ id, category }) {
    return (
      <div data-testid="related-products">
        Related Products for ID: {id}, Category: {category}
      </div>
    );
  };
});

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

// Mock products data
const mockProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    category: 'men',
    image: 'test1.jpg',
    new_price: 99.99,
    old_price: 149.99,
  },
  {
    id: 2,
    name: 'Test Product 2',
    category: 'women',
    image: 'test2.jpg',
    new_price: 79.99,
    old_price: 129.99,
  },
];

describe('Product Component', () => {
  const renderWithContext = (productId) => {
    useParams.mockReturnValue({ productId });
    
    return render(
      <ShopContext.Provider value={{ products: mockProducts }}>
        <Product />
      </ShopContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product details when product is found', async () => {
    renderWithContext('1');

    await waitFor(() => {
      expect(screen.getByTestId('breadcrums')).toBeInTheDocument();
      expect(screen.getByTestId('product-display')).toBeInTheDocument();
      expect(screen.getByTestId('description-box')).toBeInTheDocument();
      expect(screen.getByTestId('related-products')).toBeInTheDocument();
    });

    expect(screen.getByText('Breadcrums: Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product Display: Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Related Products for ID: 1, Category: men')).toBeInTheDocument();
  });

  it('should render nothing when product is not found', async () => {
    renderWithContext('999');

    await waitFor(() => {
      expect(screen.queryByTestId('breadcrums')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-display')).not.toBeInTheDocument();
      expect(screen.queryByTestId('description-box')).not.toBeInTheDocument();
      expect(screen.queryByTestId('related-products')).not.toBeInTheDocument();
    });
  });

  it('should update when product ID changes', async () => {
    const { rerender } = renderWithContext('1');

    await waitFor(() => {
      expect(screen.getByText('Breadcrums: Test Product 1')).toBeInTheDocument();
    });

    // Change product ID
    useParams.mockReturnValue({ productId: '2' });
    rerender(
      <ShopContext.Provider value={{ products: mockProducts }}>
        <Product />
      </ShopContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Breadcrums: Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('Product Display: Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('Related Products for ID: 2, Category: women')).toBeInTheDocument();
    });
  });
});
