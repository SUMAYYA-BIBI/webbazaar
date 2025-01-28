import React, { useEffect, useState } from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'
import { io } from 'socket.io-client'
import { backend_url } from '../App'

const Shop = () => {
  const [popular, setPopular] = useState([]);
  const [newcollection, setNewCollection] = useState([]);

  const fetchInfo = () => { 
    // Fetch popular women's products
    fetch(`${backend_url}/popularinwomen`) 
      .then((res) => res.json()) 
      .then((data) => setPopular(data))
      .catch(error => console.error('Error fetching popular products:', error));

    // Fetch new collections
    fetch(`${backend_url}/newcollections`) 
      .then((res) => res.json()) 
      .then((data) => setNewCollection(data))
      .catch(error => console.error('Error fetching new collections:', error));
  }

  useEffect(() => {
    // Initial fetch
    fetchInfo();

    // Set up socket connection for real-time updates
    const socket = io(backend_url);

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    // Listen for new product additions
    socket.on('product_added', (newProduct) => {
      // Update new collections
      setNewCollection(prev => {
        const updated = [newProduct, ...prev].slice(0, 8); // Keep only the latest 8 items
        return updated;
      });

      // Update popular items if the new product is in women's category
      if (newProduct.category === 'women') {
        setPopular(prev => [...prev, newProduct]);
      }
    });

    // Clean up socket connection
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <Hero/>
      <Popular data={popular}/>
      <Offers/>
      <NewCollections data={newcollection}/>
      <NewsLetter/>
    </div>
  )
}

export default Shop
