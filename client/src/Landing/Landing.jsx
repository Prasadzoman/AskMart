import React, { useEffect, useState } from 'react'
import axios from "axios"
import './Landing.css'
import { Link } from 'react-router-dom';

const Landing = () => {
    const [products, setProducts] = useState([]);

    const fetchProd = async () => {
        const res = await axios.get("http://localhost:5000/products");
        const prod = res.data.products;
        setProducts(prod);
    };

    useEffect(() => {
        fetchProd();
    }, []);

    return (
        <div className="container">
            <h2>Product List</h2>
            <div className="product-grid">
                {products.map((p) => (
                    <Link to={`/product/${p.id}`} key={p.id} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div key={p.id}>
                        <img src={p.image_url} alt={p.name} />
                        <h3>{p.name}</h3>
                        <p className="product-price">₹{p.price}</p>
                    </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Landing;
