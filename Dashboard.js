import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token, but continuing to Dashboard for UI testing');
    }

    // 🔹 Mock Data (Replace with API call when backend is ready)
    setItems([
      { _id: '1', itemName: 'iPhone 15', currentBid: 500, isClosed: false },
      { _id: '2', itemName: 'MacBook Pro', currentBid: 1200, isClosed: false },
      { _id: '3', itemName: 'Rolex Watch', currentBid: 4500, isClosed: true },
    ]);
  }, []);

  return (
    <div class="form-container">
      <h2 class="form-title">Auction Dashboard</h2>

      <Link to="/post-auction">
        <button class="btn">Post New Auction</button>
      </Link>

      <ul>
  {items.map((item) => (
    <li key={item._id}>
      <Link to={`/auction/${item._id}`}>
        {item.itemName} - Current Bid: ${item.currentBid} {item.isClosed ? '(Closed)' : ''}
      </Link>
    </li>
  ))}
  </ul>

    </div>
  );
}

export default Dashboard;
