'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Slider from 'react-slick';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';


import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      console.log(data.product, "API response");
      setProduct(data.product);
    }
    if (id) fetchProduct();
  }, [id]);

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  // Handle the case where product.images is a string instead of an array
  let imagesArray = Array.isArray(product.image)
    ? product.image
    : typeof product.image === 'string'
    ? product.image.split(',')
    : [];

  console.log(imagesArray, "imagesArray");

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-10 p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image Slider */}
      <div>
       
          {imagesArray.length > 1 ? (
            <Slider {...sliderSettings}>
            {imagesArray.map((img: string, i: number) => (
              <div key={i}>
                <img
                  src={img}
                  alt={`product-${i}`}
                  className="w-full h-[400px] object-cover rounded-md"
                />
              </div>
            ))}
          </Slider>
          ) : (
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[400px] object-cover rounded-md"
              />
            </div>
          )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-2xl font-semibold text-[#006A71]">${product.price}</p>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => addToCart(product._id)}
            className="px-6 py-2 bg-[#48A6A7] text-white rounded hover:bg-[#006A71]"
          >
            Add to Cart
          </button>
          <button onClick={handleWishlist} className="text-[#006A71] text-3xl">
            {isWishlisted ? <AiFillHeart /> : <AiOutlineHeart />}
          </button>
        </div>
      </div>
    </div>
  );
}