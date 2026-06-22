import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.ts';
import { Product, Category } from '../types.ts';
import ProductCard from '../components/ProductCard.tsx';
import Pagination from '../components/Pagination.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react';

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // States for query parameter mapping
  const searchVal = searchParams.get('search') || '';
  const categoryVal = searchParams.get('category') || '';
  const sortVal = searchParams.get('sort') || '';
  const pageVal = parseInt(searchParams.get('page') || '1') || 1;

  const [inputSearch, setInputSearch] = useState<string>(searchVal);

  // Synchronize searching input when URL modifies
  useEffect(() => {
    setInputSearch(searchVal);
  }, [searchVal]);

  // Fetch Categories List once on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories list:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Paginated Products Catalog on state changes
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pageVal.toString());
      params.append('limit', '10');
      if (searchVal) params.append('search', searchVal);
      if (categoryVal) params.append('category', categoryVal);
      if (sortVal) params.append('sort', sortVal);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      console.error('Error fetching retail products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pageVal, searchVal, categoryVal, sortVal]);

  // Handle URL Search trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => {
      prev.set('search', inputSearch);
      prev.set('page', '1'); // reset page on new queries
      return prev;
    });
  };

  // Clear all filters
  const handleResetFilters = () => {
    setInputSearch('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="bento-grid-container min-h-screen pb-16">
      {/* 1. Hero Promo Banner */}
      <div className="bg-indigo-900 text-white relative py-16 md:py-20 overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-800 rounded-l-full opacity-20 transform scale-125 pointer-events-none"></div>
        <div className="absolute -bottom-8 left-10 w-48 h-48 bg-indigo-700/30 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block bg-indigo-500/20 text-indigo-200 border border-indigo-400/25 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
              Summer Collection Hydration
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-sans leading-tight">
              Upgrade Your Routine. <br />
              <span className="text-indigo-300">Curated Premium Goods</span>
            </h1>
            <p className="text-indigo-100 text-sm md:text-base leading-relaxed mb-6 font-medium">
              We bring you high-fidelity devices, handcrafted home accessories, organic garments, and deep technical blueprints with immediate door delivery.
            </p>
            <div className="flex space-x-3 text-xs md:text-sm font-semibold">
              <span className="flex items-center text-indigo-200">
                ✔️ 100% Secure Checkout
              </span>
              <span className="text-indigo-400">•</span>
              <span className="flex items-center text-indigo-200">
                ✔️ Free Local Fallback Sandbox
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          
          {/* 2. Filters Desktop Sidebar (Col 1) */}
          <div className="hidden lg:block space-y-6">
            {/* Category selection */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  Categories
                </h3>
                {(categoryVal || searchVal || sortVal) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-rose-500 hover:text-rose-750 font-bold transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSearchParams(prev => { prev.delete('category'); prev.set('page', '1'); return prev; })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    !categoryVal
                      ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-2.5'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  All Categories
                </button>
                
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSearchParams(prev => { prev.set('category', cat.slug); prev.set('page', '1'); return prev; })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      categoryVal === cat.slug
                        ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-2.5'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick checkout badge promo */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-650 p-5 rounded-2xl text-white shadow-xs">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-indigo-100">Test Card Info</h4>
              <p className="text-xs text-indigo-100 mt-2 leading-relaxed opacity-90">
                Use Visa test card on checkout:
              </p>
              <div className="bg-white/10 rounded-lg p-2.5 font-mono text-xs font-bold text-center mt-3 tracking-wider select-all">
                4242 • 4242 • 4242 • 4242
              </div>
              <span className="block text-[10px] text-indigo-200 mt-3 text-center">
                Expiry: Any future date • CVV: 123
              </span>
            </div>
          </div>

          {/* 3. Catalog Section (Col 2-4) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search, Sort, and Mobile Categories Row */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                  type="text"
                  placeholder="Search articles, headphones, t-shirts..."
                  value={inputSearch || ''}
                  onChange={(e) => setInputSearch(e.target.value)}
                  className="w-full bg-gray-50/70 border border-gray-200 pl-10 pr-4 py-2 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400"
                />
              </form>

              {/* Sort selector dropdown */}
              <div className="flex gap-2 items-center justify-end w-full md:w-auto">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={sortVal}
                  onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); prev.set('page', '1'); return prev; })}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
                >
                  <option value="">Sort: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Ratings: Top Rated</option>
                </select>
                
                {/* Reset Action */}
                {(searchVal || categoryVal || sortVal) && (
                  <button
                    onClick={handleResetFilters}
                    className="p-2 border border-rose-100 hover:border-rose-205 hover:bg-rose-50 rounded-xl text-rose-500"
                    title="Reset All Filter Rules"
                  >
                    <RefreshCw className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

            </div>

            {/* Mobile Categories scrollbar */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none lg:hidden">
              <button
                onClick={() => setSearchParams(prev => { prev.delete('category'); prev.set('page', '1'); return prev; })}
                className={`py-1.5 px-3.5 rounded-full text-xs font-bold whitespace-nowrap border-2 transition-all ${
                  !categoryVal
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-500'
                }`}
              >
                All items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams(prev => { prev.set('category', cat.slug); prev.set('page', '1'); return prev; })}
                  className={`py-1.5 px-3.5 rounded-full text-xs font-bold whitespace-nowrap border-2 transition-all ${
                    categoryVal === cat.slug
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-500'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Total Results Summary text */}
            <div className="flex justify-between items-center px-1">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                {loading ? 'Searching goods...' : `Displaying ${products.length} of ${totalProducts} models`}
              </p>
            </div>

            {/* 4. Products Cards Grid list */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12">
                <LoadingSpinner message="Scanning warehouse catalogs..." />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-xs">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No matching products found</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Try adjusting your keyword spells, changing sorting options, or clearing the filter sidebar.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-5 rounded-lg mt-5 active:scale-95 transition-all shadow-sm"
                >
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* 5. Pagination Buttons */}
                <Pagination
                  currentPage={pageVal}
                  totalPages={totalPages}
                  onPageChange={(page) => setSearchParams(prev => { prev.set('page', page.toString()); return prev; })}
                />
              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
