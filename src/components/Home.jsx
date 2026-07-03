import React, { useState } from 'react';
import './Home.css';

const MOCK_FOODS = [
  { id: 1, name: "Mom's Special Lasagna", price: 12.99, seller: "Sarah J.", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&q=80" },
  { id: 2, name: "Authentic Butter Chicken", price: 14.50, seller: "Rajesh K.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80" },
  { id: 3, name: "Homemade Apple Pie", price: 8.00, seller: "Granny Adams", image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500&q=80" },
];

const Home = ({ user, onNavigate }) => {
  const [foods, setFoods] = useState(MOCK_FOODS);
  const [showSellModal, setShowSellModal] = useState(false);
  
  // New food form state
  const [newFood, setNewFood] = useState({ name: '', price: '', description: '', image: '' });

  const handleSellFood = (e) => {
    e.preventDefault();
    const foodItem = {
      id: Date.now(),
      name: newFood.name,
      price: parseFloat(newFood.price),
      seller: user?.name || "Anonymous Homie",
      image: newFood.image || "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=500&q=80" // fallback toast image
    };
    setFoods([foodItem, ...foods]);
    setShowSellModal(false);
    setNewFood({ name: '', price: '', description: '', image: '' });
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

        <div className="food-grid">
          {foods.map(food => (
            <div className="food-card" key={food.id}>
              <div className="food-image-wrapper">
                <img src={food.image} alt={food.name} className="food-image" />
                <div className="price-tag">${food.price.toFixed(2)}</div>
              </div>
              <div className="food-info">
                <h3>{food.name}</h3>
                <p>Cooked by <strong>{food.seller}</strong></p>
                <button className="order-btn" onClick={() => alert(`Ordering ${food.name} - feature coming soon!`)}>Order Now</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showSellModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="close-modal" onClick={() => setShowSellModal(false)}>×</button>
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
                <label>Image URL (Optional)</label>
                <input type="url" value={newFood.image} onChange={e => setNewFood({...newFood, image: e.target.value})} placeholder="https://..." />
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea rows="3" value={newFood.description} onChange={e => setNewFood({...newFood, description: e.target.value})} placeholder="Tell us about the ingredients..."></textarea>
              </div>
              <button type="submit" className="submit-sell-btn">Post to Market</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
