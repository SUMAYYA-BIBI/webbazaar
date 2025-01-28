import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { backend_url, currency } from "../../App";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${backend_url}/allproducts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAllProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    try {
      const response = await fetch(`${backend_url}/removeproduct`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the product list
        fetchInfo();
      } else {
        throw new Error(result.message || 'Failed to remove product');
      }
    } catch (err) {
      console.error("Error removing product:", err);
      alert("Failed to remove product. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="listproduct">
        <h1>All Products List</h1>
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="listproduct">
        <h1>All Products List</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          allproducts.map((product, index) => (
            <div key={product.id || index}>
              <div className="listproduct-format-main listproduct-format">
                <img
                  className="listproduct-product-icon"
                  src={`${backend_url}${product.image}`}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'placeholder.jpg'; // Add a placeholder image
                    e.target.onerror = null; // Prevent infinite loop
                  }}
                />
                <p className="cartitems-product-title">{product.name}</p>
                <p>{currency}{product.old_price}</p>
                <p>{currency}{product.new_price}</p>
                <p>{product.category}</p>
                <img
                  className="listproduct-remove-icon"
                  onClick={() => removeProduct(product.id)}
                  src={cross_icon}
                  alt="Remove"
                />
              </div>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListProduct;
