import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { ShopContext } from '../../Context/ShopContext';

// Mock the images
jest.mock('../Assets/logo.png', () => 'logo-mock');
jest.mock('../Assets/cart_icon.png', () => 'cart-icon-mock');
jest.mock('../Assets/nav_dropdown.png', () => 'nav-dropdown-mock');

const mockContextValue = {
  getTotalCartItems: () => 5
};

const renderWithRouterAndContext = (component) => {
  return render(
    <BrowserRouter>
      <ShopContext.Provider value={mockContextValue}>
        {component}
      </ShopContext.Provider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render logo and brand name', () => {
      renderWithRouterAndContext(<Navbar />);
      const logo = screen.getByAltText('logo');
      const brandName = screen.getByText('WEB BAZAAR');
      
      expect(logo).toBeInTheDocument();
      expect(brandName).toBeInTheDocument();
    });

    it('should render all navigation links', () => {
      renderWithRouterAndContext(<Navbar />);
      const links = ['Shop', 'Men', 'Women', 'Kids', 'FAQ'];
      
      links.forEach(link => {
        expect(screen.getByText(link)).toBeInTheDocument();
      });
    });

    it('should render cart icon with item count', () => {
      renderWithRouterAndContext(<Navbar />);
      const cartIcon = screen.getByAltText('cart');
      const cartCount = screen.getByText('5');
      
      expect(cartIcon).toBeInTheDocument();
      expect(cartCount).toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('should render login button when user is not authenticated', () => {
      renderWithRouterAndContext(<Navbar />);
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should render logout button when user is authenticated', () => {
      localStorage.setItem('auth-token', 'fake-token');
      renderWithRouterAndContext(<Navbar />);
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should handle logout correctly', () => {
      const mockReplace = jest.fn();
      delete window.location;
      window.location = { replace: mockReplace };

      localStorage.setItem('auth-token', 'fake-token');
      renderWithRouterAndContext(<Navbar />);
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  describe('Navigation', () => {
    it('should update menu state when clicking navigation items', () => {
      renderWithRouterAndContext(<Navbar />);
      
      const navItems = [
        { text: 'Men', menu: 'mens' },
        { text: 'Women', menu: 'womens' },
        { text: 'Kids', menu: 'kids' },
        { text: 'FAQ', menu: 'faq' }
      ];

      navItems.forEach(({ text }) => {
        const link = screen.getByText(text);
        fireEvent.click(link);
        const hr = link.parentElement.querySelector('hr');
        expect(hr).toBeInTheDocument();
      });
    });

    it('should handle mobile menu toggle', () => {
      renderWithRouterAndContext(<Navbar />);
      const dropdownButton = screen.getByAltText('');
      const menu = screen.getByRole('list');

      fireEvent.click(dropdownButton);
      expect(menu.classList.contains('nav-menu-visible')).toBe(true);

      fireEvent.click(dropdownButton);
      expect(menu.classList.contains('nav-menu-visible')).toBe(false);
    });
  });

  describe('Links', () => {
    it('should have correct navigation links', () => {
      renderWithRouterAndContext(<Navbar />);
      
      const links = {
        'Shop': '/',
        'Men': '/mens',
        'Women': '/womens',
        'Kids': '/kids',
        'FAQ': '/faq'
      };

      Object.entries(links).forEach(([text, path]) => {
        const link = screen.getByText(text).closest('a');
        expect(link).toHaveAttribute('href', path);
      });
    });

    it('should have correct cart link', () => {
      renderWithRouterAndContext(<Navbar />);
      const cartLink = screen.getByAltText('cart').closest('a');
      expect(cartLink).toHaveAttribute('href', '/cart');
    });

    it('should have correct login link', () => {
      renderWithRouterAndContext(<Navbar />);
      const loginLink = screen.getByText('Login').closest('a');
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});