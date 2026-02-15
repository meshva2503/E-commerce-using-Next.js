'use client';

import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading products...</div>}>
      <ProductContent />
    </Suspense>
  );
}

function ProductContent() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchInfo, setSearchInfo] = useState<any>(null);
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const productsPerPage = 9;

  // Fetch all products (default view) or filtered by category
  useEffect(() => {
    if (!searchQuery) {
      fetchProducts();
    }
  }, [currentPage, categoryFilter]);

  async function fetchProducts() {
    let url = `/api/products?page=${currentPage}&limit=${productsPerPage}`;
    if (categoryFilter) {
      url += `&category=${encodeURIComponent(categoryFilter)}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setProducts(data.products);
    setTotalPages(Math.ceil(data.total / productsPerPage));
    setSearchInfo(null);
  }

  // Handle search with debouncing
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      fetchProducts();
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  async function handleSearch(query: string) {
    if (!query || query.trim().length === 0) {
      fetchProducts();
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.results);
        setSearchInfo(data.searchMethods);
        setTotalPages(1); // Disable pagination for search results
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getMatchTypeBadge = (matchType: string) => {
    switch (matchType) {
      case 'hybrid':
        return <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">🎯 Hybrid Match</span>;
      case 'keyword':
        return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">🔤 Keyword Match</span>;
      case 'semantic':
        return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🧠 AI Match</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 mb-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#006A71]">Products</h1>

      {categoryFilter && (
        <div className="flex justify-center items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-700">Category: <span className="font-bold text-[#006A71]">{categoryFilter}</span></h2>
          <Link href="/products" className="text-sm text-red-500 underline hover:text-red-700">Clear Filter</Link>
        </div>
      )}

      {/* Search Bar */}
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search products using AI... (e.g., 'laptop for work', 'red dress', 'gaming')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 border-2 border-[#9ACBD0] rounded-lg focus:outline-none focus:border-[#48A6A7] text-black"
          />
          <Search className="absolute left-4 top-3.5 text-[#48A6A7]" size={20} />
          {isSearching && (
            <div className="absolute right-4 top-3.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#48A6A7]"></div>
            </div>
          )}
        </div>

        {/* Search Info */}
        {searchInfo && (
          <div className="text-center mt-3 text-sm text-gray-600">
            <p>
              Found {products.length} results •
              {searchInfo.hybridCount > 0 && ` ${searchInfo.hybridCount} hybrid matches • `}
              BM25: {searchInfo.bm25Count} • Vector: {searchInfo.vectorCount}
            </p>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No products found. Try a different search term.' : 'No products available.'}
            </p>
          </div>
        ) : (
          products.map((product: any) => (
            <div key={product._id} className="border p-4 rounded-md shadow-md">
              <Link href={`/products/${product._id}`}>
                <img
                  src={
                    Array.isArray(product.image) && product.image.length > 0
                      ? product.image[0]
                      : product.image || '/placeholder.jpg'
                  }
                  alt={product.name}
                  className="w-full h-60 object-cover rounded-md"
                />

                <div className="mt-2 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-black">
                    <Link href={`/products/${product._id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </h2>
                  {product.matchType && getMatchTypeBadge(product.matchType)}
                </div>

                <p className="text-black mt-1 line-clamp-2">{product.description}</p>
                {product.category && (
                  <p className="text-sm text-gray-500 mt-1">
                    Category: {typeof product.category === 'object' ? (product.category as any).name : product.category}
                  </p>
                )}
                <p className="font-bold mt-2 text-black">${product.price}</p>
              </Link>
              <button
                onClick={() => addToCart(product._id)}
                className="mt-3 px-4 py-2 bg-[#48A6A7] text-white rounded-lg hover:bg-[#006A71] w-full"
              >
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination (only show when not searching) */}
      {!searchQuery && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded ${currentPage === page
                ? 'bg-[#48A6A7] text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
