import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import './Show.css'

const Show = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  const addToCart = async () => {
  await axios.post("http://localhost:5000/cart", {
    product_id: product.id,
    quantity: 1
  }, { withCredentials: true });
  alert("Item added to cart!");
};

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/products/${id}`)
        setProduct(res.data.product)
      } catch (error) {
        console.error("Error fetching product:", error)
      }
    }

    fetchProduct()
  }, [id])

  if (!product) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
  }

  return (
    <div className="show-container">
      <img src={product.image_url} alt={product.name} className="show-image" />
      <h2 className="show-title">{product.name}</h2>
      <p className="show-description">{product.description}</p>
      <p className="show-price">₹{product.price}</p>
      <p className={`show-stock ${product.stock > 0 ? 'in' : 'out'}`}>
        {product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
      </p>
     <button onClick={addToCart}>Add to Cart 🛒</button>
    </div>
  )
}

export default Show
