import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";
import { backend_url } from "../../App";

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: ""
  });

  const validateForm = () => {
    if (!image) {
      setError("Please select a product image");
      return false;
    }
    if (!productDetails.name.trim()) {
      setError("Product name is required");
      return false;
    }
    if (!productDetails.description.trim()) {
      setError("Product description is required");
      return false;
    }
    if (!productDetails.new_price || productDetails.new_price <= 0) {
      setError("Please enter a valid price");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setProductDetails({
      name: "",
      description: "",
      image: "",
      category: "women",
      new_price: "",
      old_price: ""
    });
    setImage(false);
    setSuccess("Product added successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const AddProduct = async () => {
    try {
      setError("");
      setSuccess("");
      
      if (!validateForm()) {
        return;
      }

      setLoading(true);

      // Upload image first
      const formData = new FormData();
      formData.append('product', image);

      const uploadResponse = await fetch(`${backend_url}/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload image');
      }

      // Add product with image URL
      const product = {
        ...productDetails,
        image: uploadData.image_url
      };

      const addProductResponse = await fetch(`${backend_url}/addproduct`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!addProductResponse.ok) {
        throw new Error('Failed to add product');
      }

      const addProductData = await addProductResponse.json();
      
      if (!addProductData.success) {
        throw new Error(addProductData.message || 'Failed to add product');
      }

      resetForm();
    } catch (err) {
      setError(err.message || "Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    setError(""); // Clear error when user makes changes
  };

  return (
    <div className="addproduct">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input 
          type="text" 
          name="name" 
          value={productDetails.name} 
          onChange={changeHandler} 
          placeholder="Type here" 
        />
      </div>
      <div className="addproduct-itemfield">
        <p>Product description</p>
        <input 
          type="text" 
          name="description" 
          value={productDetails.description} 
          onChange={changeHandler} 
          placeholder="Type here" 
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input 
            type="number" 
            name="old_price" 
            value={productDetails.old_price} 
            onChange={changeHandler} 
            placeholder="Type here" 
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input 
            type="number" 
            name="new_price" 
            value={productDetails.new_price} 
            onChange={changeHandler} 
            placeholder="Type here" 
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product category</p>
        <select 
          value={productDetails.category} 
          name="category" 
          className="add-product-selector" 
          onChange={changeHandler}
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Product image</p>
        <label htmlFor="file-input">
          <img 
            className="addproduct-thumbnail-img" 
            src={!image ? upload_area : URL.createObjectURL(image)} 
            alt="" 
          />
        </label>
        <input 
          onChange={(e) => {
            setImage(e.target.files[0]);
            setError("");
          }} 
          type="file" 
          name="image" 
          id="file-input" 
          accept="image/*" 
          hidden 
        />
      </div>
      <button 
        className="addproduct-btn" 
        onClick={AddProduct}
        disabled={loading}
      >
        {loading ? "Adding..." : "ADD"}
      </button>
    </div>
  );
};

export default AddProduct;
