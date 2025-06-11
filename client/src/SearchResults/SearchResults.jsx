import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import './SearchResults.css' 

const SearchResults = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const searchQuery = queryParams.get('query')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/search?query=${encodeURIComponent(searchQuery)}`, {
          withCredentials: true
        })
        setProducts(res.data.products || [])
      } catch (err) {
        console.error(err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (searchQuery) fetchResults()
  }, [searchQuery])

  return (
    <div className="container">
      <h2>Search Results for "{searchQuery}"</h2>
      {loading ? (
        <p>Loading...</p>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map(p => (
            <div className="product-card" key={p.id}>
              <img src={p.image_url} alt={p.name} />
              <h3>{p.name}</h3>
              <div className="product-price">₹{p.price}</div>
              <div className="product-stock">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  )
}

export default SearchResults
