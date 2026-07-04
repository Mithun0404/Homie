import React, { useState, useEffect, useRef } from 'react';
import './Home.css';

const MOCK_SWIGGY_RESTAURANTS = [
  { id: 's1', name: 'Burger King', rating: 4.5, time: '30-40 min', category: 'American, Fast Food', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80', isSwiggy: true },
  { id: 's2', name: 'Nandhana Palace', rating: 4.2, time: '20-30 min', category: 'Biryani, Andhra', image: 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=500&q=80', isSwiggy: true },
  { id: 's3', name: 'Meghana Foods', rating: 4.6, time: '35-45 min', category: 'Biryani, South Indian', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80', isSwiggy: true },
  { id: 's4', name: 'Dominos Pizza', rating: 4.3, time: '30 min', category: 'Pizza, Italian', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', isSwiggy: true }
];

const MOCK_CATEGORIES = [
  { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' },
  { name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80' },
  { name: 'Burger', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80' },
  { name: 'Dosa', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80' },
  { name: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80' }
];

const Home = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', image: '', category: '', time: '30 mins' });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', description: '', image: '' });
  
  // New food form state
  const [newFood, setNewFood] = useState({ name: '', price: '', description: '', image: '', is_surplus: false });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      alert("Could not access camera. Please check permissions. Make sure you serve over HTTPS or localhost.");
    }
  };

  const capturePhoto = (e) => {
    e.preventDefault();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      
      setNewFood({...newFood, image: imageDataUrl});
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  useEffect(() => {
    fetchFoods();
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/restaurants');
      if (response.ok) {
        setRestaurants(await response.json());
      }
    } catch(err) { console.error('Failed to fetch restaurants', err); }
  };

  const fetchFoods = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/foods');
      if (response.ok) {
        const data = await response.json();
        setFoods(data);
      }
    } catch (error) {
      console.error('Failed to fetch foods', error);
    }
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: newRestaurant.name,
      owner_id: user?.id || 1,
      image: newRestaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80",
      category: newRestaurant.category,
      time: newRestaurant.time,
      rating: 5.0
    };
    try {
      const resp = await fetch('http://localhost:3001/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        setShowPartnerModal(false);
        fetchRestaurants();
        setNewRestaurant({ name: '', image: '', category: '', time: '30 mins' });
        alert("Restaurant Registered successfully!");
      }
    } catch(err) { console.error(err); }
  };

  const handleViewRestaurant = async (restaurant) => {
    if (restaurant.isSwiggy) {
      alert(`Redirecting to Swiggy to order from ${restaurant.name}`);
      return;
    }
    try {
      const resp = await fetch(`http://localhost:3001/api/restaurants/${restaurant.id}/menu`);
      if (resp.ok) {
        setRestaurantMenu(await resp.json());
        setSelectedRestaurant(restaurant);
      }
    } catch (err) { console.error(err); }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    const payload = {
      name: newMenuItem.name,
      price: parseFloat(newMenuItem.price),
      description: newMenuItem.description,
      image: newMenuItem.image
    };
    try {
      const resp = await fetch(`http://localhost:3001/api/restaurants/${selectedRestaurant.id}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        setShowMenuModal(false);
        setNewMenuItem({ name: '', price: '', description: '', image: '' });
        alert('Menu item added successfully!');
        handleViewRestaurant(selectedRestaurant); // refresh menu
      }
    } catch(err) { console.error(err); }
  };

  const handleSellFood = async (e) => {
    e.preventDefault();
    if (!newFood.image) {
      alert("Please capture a photo of the food.");
      return;
    }
    const foodItem = {
      name: newFood.name,
      price: parseFloat(newFood.price),
      description: newFood.description,
      seller: user?.name || "Anonymous Homie",
      image: newFood.image,
      is_surplus: newFood.is_surplus
    };

    try {
      const response = await fetch('http://localhost:3001/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodItem)
      });
      if (response.ok) {
        const data = await response.json();
        setFoods([data.food, ...foods]);
        setShowSellModal(false);
        setNewFood({ name: '', price: '', description: '', image: '', is_surplus: false });
      } else {
        alert('Failed to post food');
      }
    } catch (error) {
      console.error('Error posting food', error);
      alert('Error posting food');
    }
  };

  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="home-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 11C14.7614 11 17 8.76142 17 6C17 3.23858 14.7614 1 12 1C9.23858 1 7 3.23858 7 6C7 8.76142 9.23858 11 12 11Z" fill="#FB923C"/>
            <path d="M12 13C6.48 13 2 17.48 2 23H22C22 17.48 17.52 13 12 13Z" fill="#FB923C"/>
          </svg>
          <span>Homie</span>
        </div>
        <div className="nav-actions">
           <button className="sell-btn" onClick={() => setShowSellModal(true)}>+ Sell Your Food</button>
           <button className="logout-btn" onClick={() => onNavigate('login')}>Logout</button>
        </div>
      </nav>

      <main className="home-main">
        <h1 className="greeting">Welcome back, {user?.name || 'Homie'}! 👋</h1>
        <p className="subtitle">Discover comforting home-cooked meals in your neighborhood.</p>

        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>🏠 Home Chefs</button>
          <button className={`tab-btn ${activeTab === 'swiggy' ? 'active' : ''}`} onClick={() => setActiveTab('swiggy')}>🚀 Swiggy Restaurants</button>
        </div>

        {activeTab === 'home' && (
          <div className="food-grid">
            {foods.map(food => (
              <div className="food-card" key={food.id}>
                <div className="food-image-wrapper">
                  <img src={food.image} alt={food.name} className="food-image" />
                  <div className="price-tag">${Number(food.price).toFixed(2)}</div>
                  {food.is_surplus ? <div className="surplus-badge">Zero Waste Rescue</div> : null}
                </div>
                <div className="food-info">
                  <h3>{food.name}</h3>
                  <p>Cooked by <strong>{food.seller}</strong></p>
                  <button className="order-btn" onClick={() => alert(`Ordering ${food.name} - feature coming soon!`)}>Order Now</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'swiggy' && (
          <div className="swiggy-content">
            <h2 className="section-title">What's on your mind?</h2>
            <div className="slider-container">
              {MOCK_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="category-bubble">
                  <img src={cat.image} alt={cat.name} />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <h2 className="section-title">Top restaurant chains in your city</h2>
              <button className="sell-btn" onClick={() => setShowPartnerModal(true)}>Partner With Us</button>
            </div>
            
            <div className="slider-container">
               { [...restaurants, ...MOCK_SWIGGY_RESTAURANTS].slice(0, 8).map((restaurant, idx) => (
                 <div className="food-card slider-card" key={restaurant.id || idx}>
                   <div className="food-image-wrapper">
                      <img src={restaurant.image} alt={restaurant.name} className="food-image" />
                      {restaurant.isSwiggy ? <div className="swiggy-badge">Powered by Swiggy</div> : <div className="swiggy-badge" style={{background: '#10b981'}}>New Partner</div>}
                   </div>
                   <div className="food-info">
                      <h3>{restaurant.name}</h3>
                      <p>{restaurant.category} • {restaurant.rating ? `${restaurant.rating} ⭐` : "New"}</p>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '-8px' }}>Delivery in {restaurant.time}</p>
                      <button className="order-btn swiggy-btn" onClick={() => handleViewRestaurant(restaurant)}>View Menu</button>
                   </div>
                 </div>
               ))}
            </div>

            <h2 className="section-title">Restaurants with online food delivery</h2>
            <div className="food-grid">
               { [...restaurants, ...MOCK_SWIGGY_RESTAURANTS].map((restaurant, idx) => (
                 <div className="food-card" key={restaurant.id || idx}>
                   <div className="food-image-wrapper">
                      <img src={restaurant.image} alt={restaurant.name} className="food-image" />
                      {restaurant.isSwiggy ? <div className="swiggy-badge">Powered by Swiggy</div> : <div className="swiggy-badge" style={{background: '#10b981'}}>New Partner</div>}
                   </div>
                   <div className="food-info">
                      <h3>{restaurant.name}</h3>
                      <p>{restaurant.category} • {restaurant.rating ? `${restaurant.rating} ⭐` : "New"}</p>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '-8px' }}>Delivery in {restaurant.time}</p>
                      <button className="order-btn swiggy-btn" onClick={() => handleViewRestaurant(restaurant)}>View Menu</button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>

      {showSellModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="close-modal" onClick={() => { setShowSellModal(false); stopCamera(); }}>×</button>
            <h2>List Your Food</h2>
            <p>Share your home-cooked goodness with neighbors.</p>
            
            <form onSubmit={handleSellFood}>
              <div className="input-group">
                <label>Food Name</label>
                <input required type="text" value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} placeholder="e.g. Grandma's Spaghetti" />
              </div>
              <div className="input-group">
                <label>Price ($)</label>
                <input required type="number" step="0.01" value={newFood.price} onChange={e => setNewFood({...newFood, price: e.target.value})} placeholder="e.g. 10.50" />
              </div>
              <div className="input-group">
                <label>Food Photo (Mandatory)</label>
                {!newFood.image && !cameraActive && (
                  <button type="button" onClick={startCamera} className="camera-btn">Start Camera to Capture Photo</button>
                )}
                {cameraActive && (
                  <div className="camera-container">
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px' }}></video>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={capturePhoto} className="camera-btn capture-btn" style={{ flex: 1 }}>Capture Photo</button>
                      <button type="button" onClick={stopCamera} className="camera-btn cancel-btn">Cancel</button>
                    </div>
                  </div>
                )}
                {newFood.image && (
                  <div className="captured-image-preview">
                    <img src={newFood.image} alt="Captured" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                    <button type="button" onClick={() => setNewFood({...newFood, image: ''})} className="camera-btn cancel-btn">Retake Photo</button>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea rows="3" value={newFood.description} onChange={e => setNewFood({...newFood, description: e.target.value})} placeholder="Tell us about the ingredients..."></textarea>
              </div>
              <div className="input-group checkbox-group">
                <input type="checkbox" id="surplus-check" checked={newFood.is_surplus} onChange={e => setNewFood({...newFood, is_surplus: e.target.checked})} />
                <label htmlFor="surplus-check">Surplus/Leftover (Help prevent wastage!)</label>
              </div>
              <button type="submit" className="submit-sell-btn">Post to Market</button>
            </form>
          </div>
        </div>
      )}
      {showPartnerModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="close-modal" onClick={() => setShowPartnerModal(false)}>×</button>
            <h2>Register a Restaurant</h2>
            <p>Become a Swiggy partner and start receiving orders!</p>
            
            <form onSubmit={handlePartnerSubmit}>
              <div className="input-group">
                <label>Restaurant Name</label>
                <input required type="text" value={newRestaurant.name} onChange={e => setNewRestaurant({...newRestaurant, name: e.target.value})} placeholder="e.g. Rameshwaram Cafe" />
              </div>
              <div className="input-group">
                <label>Category (e.g. South Indian, Desserts)</label>
                <input required type="text" value={newRestaurant.category} onChange={e => setNewRestaurant({...newRestaurant, category: e.target.value})} placeholder="e.g. South Indian" />
              </div>
              <div className="input-group">
                <label>Image URL (Optional)</label>
                <input type="url" value={newRestaurant.image} onChange={e => setNewRestaurant({...newRestaurant, image: e.target.value})} placeholder="https://..." />
              </div>
              <button type="submit" className="submit-sell-btn swiggy-btn">Create Partner Restaurant</button>
            </form>
          </div>
        </div>
      )}

      {selectedRestaurant && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="close-modal" onClick={() => setSelectedRestaurant(null)}>×</button>
            <h2>{selectedRestaurant.name}</h2>
            <p>{selectedRestaurant.category} • ⭐ {selectedRestaurant.rating || "New"} • ⏰ {selectedRestaurant.time}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem 0', borderBottom: '1px dashed #cbd5e1', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Menu items</h3>
              <button className="sell-btn" onClick={() => setShowMenuModal(true)}>+ Add Item to Menu</button>
            </div>
            
            <div className="food-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {restaurantMenu.length === 0 ? (
                 <p style={{ color: '#64748b' }}>No menu items added yet.</p>
              ) : restaurantMenu.map((item, idx) => (
                <div className="food-card" key={idx} style={{ padding: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  {item.image && <img src={item.image} style={{ width: '100%', height: '120px', borderRadius: '12px', objectFit: 'cover' }} alt={item.name} />}
                  <h4 style={{ margin: '0.5rem 0' }}>{item.name}</h4>
                  <div className="price-tag" style={{ position: 'static', display: 'inline-block', background: '#f8fafc', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>${Number(item.price).toFixed(2)}</div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showMenuModal && selectedRestaurant && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-card">
            <button className="close-modal" onClick={() => setShowMenuModal(false)}>×</button>
            <h2>Add Menu Item</h2>
            <p>Add a new dish to {selectedRestaurant.name}'s menu</p>
            
            <form onSubmit={handleAddMenuItem}>
              <div className="input-group">
                <label>Dish Name</label>
                <input required type="text" value={newMenuItem.name} onChange={e => setNewMenuItem({...newMenuItem, name: e.target.value})} placeholder="e.g. Masala Dosa" />
              </div>
              <div className="input-group">
                <label>Price ($)</label>
                <input required type="number" step="0.01" value={newMenuItem.price} onChange={e => setNewMenuItem({...newMenuItem, price: e.target.value})} placeholder="e.g. 5.99" />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea rows="2" value={newMenuItem.description} onChange={e => setNewMenuItem({...newMenuItem, description: e.target.value})} placeholder="Delicious crispy dosa..."></textarea>
              </div>
              <div className="input-group">
                <label>Image URL (Optional)</label>
                <input type="url" value={newMenuItem.image} onChange={e => setNewMenuItem({...newMenuItem, image: e.target.value})} placeholder="https://..." />
              </div>
              <button type="submit" className="submit-sell-btn">Add Dish</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
