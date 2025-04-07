'use client';

import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { useCart } from '@/context/CartContext';

export default function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products);
    }
    fetchProducts();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-10">
      <h2 className="text-3xl font-bold text-center mb-6">Featured Products</h2>
      <Slider {...settings}>
        {products.map((product: any) => (
          <div key={product._id} className="px-4">
            <div className="border p-4 rounded-lg shadow-md bg-white h-full flex flex-col justify-between">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded"
              />
              <h3 className="text-lg font-semibold mt-3">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-base font-bold mt-2">${product.price}</p>
              <button
                onClick={() => addToCart(product._id)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
