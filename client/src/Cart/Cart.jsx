import { useEffect, useState } from 'react';
import axios from 'axios';
import "./Cart.css"
const Cart = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/cart', { withCredentials: true })
      .then(res => setItems(res.data));
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {items.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.image_url} alt={item.name} width="80" />
          <div>
            <h4>{item.name}</h4>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ₹{item.price * item.quantity}</p>
          </div>
        </div>
      ))}
      <h3>Total: ₹{total}</h3>
    </div>
  );
};

export default Cart;
