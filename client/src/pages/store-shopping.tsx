import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Plus, Minus, Trash2, X, ChevronDown,
  Store, Truck, ArrowLeft, Sparkles, Tag, Star, ExternalLink,
  Package, Check, AlertCircle, Loader2, ShoppingBag
} from "lucide-react";
import { Link, useLocation } from "wouter";

// ── Types ──────────────────────────────────────────────────────

interface StoreProduct {
  id: string;
  store: "walmart" | "kroger";
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  onSale: boolean;
  image: string;
  category: string;
  inStock: boolean;
  rating?: number;
  numReviews?: number;
  description?: string;
  size?: string;
  affiliateUrl: string;
  productUrl: string;
}

interface ShoppingListItem extends StoreProduct {
  quantity: number;
  substitutionPref: "accept_similar" | "refund" | "contact_me";
}

interface WalmartCategory {
  id: string;
  name: string;
  path: string;
}

// ── Main Component ─────────────────────────────────────────────

export default function StoreShopping() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<WalmartCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState<StoreProduct[]>([]);

  // Checkout form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [tipAmount, setTipAmount] = useState("5");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Load categories and trending on mount
  useEffect(() => {
    fetch("/api/store/walmart/categories")
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {});

    fetch("/api/store/walmart/trending")
      .then(r => r.json())
      .then(d => {
        setTrendingProducts(d.products || []);
        if (!products.length) setProducts(d.products || []);
      })
      .catch(() => {});
  }, []);

  const searchProducts = useCallback(async (query: string, category?: string) => {
    if (!query.trim() && !category) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query);
      else params.set("q", category || "grocery");
      if (category) params.set("category", category);

      const res = await fetch(`/api/store/walmart/search?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts(searchQuery, selectedCategory);
  };

  const handleCategoryClick = (catId: string, catName: string) => {
    setSelectedCategory(catId);
    searchProducts(catName, catId);
  };

  // ── Shopping List Methods ──────────────────────────────────────

  const addToList = (product: StoreProduct) => {
    setShoppingList(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1, substitutionPref: "accept_similar" }];
    });
  };

  const removeFromList = (productId: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setShoppingList(prev => prev.map(i => {
      if (i.id !== productId) return i;
      const newQty = Math.max(1, i.quantity + delta);
      return { ...i, quantity: newQty };
    }));
  };

  const getListQuantity = (productId: string): number => {
    return shoppingList.find(i => i.id === productId)?.quantity || 0;
  };

  const itemsTotal = shoppingList.reduce((sum, i) => sum + ((i.salePrice || i.price) * i.quantity), 0);
  const serviceFee = Math.round(itemsTotal * 0.10 * 100) / 100;
  const deliveryFee = 5.99;
  const tax = Math.round(itemsTotal * 0.0975 * 100) / 100;
  const tip = parseFloat(tipAmount) || 0;
  const grandTotal = Math.round((itemsTotal + serviceFee + deliveryFee + tax + tip) * 100) / 100;

  // ── Submit Order ───────────────────────────────────────────────

  const submitOrder = async () => {
    if (!customerName || !customerPhone || !deliveryAddress) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: shoppingList.map(i => ({
            productId: i.id,
            store: i.store,
            name: i.name,
            brand: i.brand,
            price: i.salePrice || i.price,
            image: i.image,
            quantity: i.quantity,
            affiliateUrl: i.affiliateUrl,
            substitutionPref: i.substitutionPref,
          })),
          customerName,
          customerPhone,
          customerEmail,
          deliveryAddress,
          deliveryInstructions,
          storeLocation: "Walmart Supercenter",
          tipAmount,
        }),
      });
      if (res.ok) {
        setOrderSuccess(true);
        setShoppingList([]);
        setTimeout(() => setLocation("/"), 4000);
      }
    } catch (err) {
      console.error("Order submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Order Submitted!</h2>
          <p className="text-slate-400">Your grocery shopping order has been placed. A shopper will be assigned shortly and will head to Walmart to pick up your items.</p>
          <p className="text-sm text-cyan-400">Redirecting to home...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      {/* ── Decorative Blurs ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[40vh] h-[40vh] bg-blue-900/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[50vh] h-[50vh] bg-cyan-900/10 rounded-full blur-[150px]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 hover:bg-white/5 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wider uppercase text-white">Shop a Store</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Walmart · Powered by Happy Eats</p>
              </div>
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2.5 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 hover:from-cyan-500/20 hover:to-teal-500/20 border border-cyan-500/20 rounded-xl transition"
          >
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            {shoppingList.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full text-[10px] font-bold text-black flex items-center justify-center">
                {shoppingList.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Search Bar ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Walmart products — milk, bread, diapers, detergent..."
            className="w-full pl-12 pr-28 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl text-sm font-bold text-white transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Category Chips ── */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id, cat.name)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition border ${
                selectedCategory === cat.id
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 pb-32 relative z-10">
        {products.length === 0 && !loading && (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-400">Search for products</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Search the Walmart catalog or browse by category. Add items to your list and we'll have a shopper pick them up for you.</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {searchQuery ? `Results for "${searchQuery}"` : "Trending Items"}
              </h2>
              <span className="text-xs text-slate-500">{products.length} items</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {products.map(product => {
                const inList = getListQuantity(product.id);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative bg-white/[0.03] border rounded-2xl overflow-hidden hover:bg-white/[0.06] transition-all ${
                      inList > 0 ? "border-cyan-500/30" : "border-white/5"
                    }`}
                  >
                    {/* Sale Badge */}
                    {product.onSale && product.salePrice && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-full uppercase">
                          Sale
                        </span>
                      </div>
                    )}

                    {/* In-List Badge */}
                    {inList > 0 && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="w-6 h-6 bg-cyan-500 rounded-full text-[10px] font-bold text-black flex items-center justify-center">
                          {inList}
                        </span>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="aspect-square bg-white/5 flex items-center justify-center p-4">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" loading="lazy" />
                      ) : (
                        <Package className="w-12 h-12 text-slate-600" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 space-y-1.5">
                      {product.brand && (
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium truncate">{product.brand}</p>
                      )}
                      <h3 className="text-xs font-semibold text-white leading-tight line-clamp-2 min-h-[2rem]">{product.name}</h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5">
                        {product.onSale && product.salePrice ? (
                          <>
                            <span className="text-base font-bold text-emerald-400">${product.salePrice.toFixed(2)}</span>
                            <span className="text-xs text-slate-500 line-through">${product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-white">${product.price.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] text-slate-400">{product.rating}</span>
                          {product.numReviews && (
                            <span className="text-[10px] text-slate-500">({product.numReviews.toLocaleString()})</span>
                          )}
                        </div>
                      )}

                      {/* Add / Adjust Buttons */}
                      <div className="pt-1">
                        {inList > 0 ? (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => { if (inList === 1) removeFromList(product.id); else updateQuantity(product.id, -1); }}
                              className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg flex items-center justify-center transition"
                            >
                              {inList === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5 text-red-400" />}
                            </button>
                            <span className="text-sm font-bold text-cyan-400">{inList}</span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="w-8 h-8 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg flex items-center justify-center transition"
                            >
                              <Plus className="w-3.5 h-3.5 text-cyan-400" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToList(product)}
                            className="w-full py-2 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 hover:from-cyan-500/20 hover:to-teal-500/20 border border-cyan-500/20 rounded-xl text-xs font-semibold text-cyan-400 flex items-center justify-center gap-1.5 transition"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add to List
                          </button>
                        )}
                      </div>

                      {/* Affiliate link (opens Walmart.com) */}
                      {product.affiliateUrl && product.affiliateUrl !== "#" && (
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-400 transition mt-1"
                        >
                          <ExternalLink className="w-2.5 h-2.5" /> View on Walmart
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Floating Cart Bar (mobile) ── */}
      {shoppingList.length > 0 && !drawerOpen && !checkoutOpen && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-4 right-4 z-40"
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-2xl flex items-center justify-between text-white font-bold shadow-lg shadow-cyan-500/20 transition"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span>{shoppingList.reduce((s, i) => s + i.quantity, 0)} items</span>
            </div>
            <span className="text-lg">${itemsTotal.toFixed(2)}</span>
          </button>
        </motion.div>
      )}

      {/* ── Shopping List Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl z-50 flex flex-col"
            >
              {/* Drawer Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Drawer Header */}
              <div className="px-6 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Shopping List</h2>
                  <p className="text-xs text-slate-500">{shoppingList.length} items from Walmart</p>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Item List */}
              <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-4">
                {shoppingList.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-white truncate">{item.name}</h3>
                      <p className="text-xs text-slate-500">${(item.salePrice || item.price).toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => { if (item.quantity === 1) removeFromList(item.id); else updateQuantity(item.id, -1); }}
                        className="w-7 h-7 bg-white/5 hover:bg-red-500/10 border border-white/10 rounded-lg flex items-center justify-center transition">
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3 text-slate-400" />}
                      </button>
                      <span className="text-sm font-bold text-white w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 bg-white/5 hover:bg-cyan-500/10 border border-white/10 rounded-lg flex items-center justify-center transition">
                        <Plus className="w-3 h-3 text-cyan-400" />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-white w-14 text-right">
                      ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Items ({shoppingList.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>${itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Shopping Service Fee (10%)</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Delivery</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Est. Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                  <span>Estimated Total</span>
                  <span className="text-cyan-400">${(itemsTotal + serviceFee + deliveryFee + tax).toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => { setDrawerOpen(false); setCheckoutOpen(true); }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-2xl text-white font-bold text-sm transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Truck className="w-5 h-5" /> Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Checkout Modal ── */}
      <AnimatePresence>
        {checkoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl z-50 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              <div className="px-6 pb-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Checkout</h2>
                  <button onClick={() => setCheckoutOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Order Summary</h3>
                  <div className="text-xs text-slate-500 space-y-1">
                    {shoppingList.map(i => (
                      <div key={i.id} className="flex justify-between">
                        <span className="truncate mr-2">{i.quantity}x {i.name}</span>
                        <span className="flex-shrink-0">${((i.salePrice || i.price) * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                    <span>Est. Total</span>
                    <span className="text-cyan-400">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Delivery Details</h3>
                  <input
                    type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                    placeholder="Your Name *"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                  <input
                    type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number *"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                  <input
                    type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                  <input
                    type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Delivery Address *"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                  <textarea
                    value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)}
                    placeholder="Delivery Instructions (e.g., Leave at door, gate code...)"
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>

                {/* Tip */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Shopper Tip</h3>
                  <div className="flex gap-2">
                    {["3", "5", "8", "10"].map(t => (
                      <button
                        key={t}
                        onClick={() => setTipAmount(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition border ${
                          tipAmount === t
                            ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        ${t}
                      </button>
                    ))}
                    <input
                      type="number"
                      value={tipAmount}
                      onChange={e => setTipAmount(e.target.value)}
                      className="w-20 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-center text-sm text-white focus:outline-none focus:border-cyan-500/50"
                      min="0"
                    />
                  </div>
                </div>

                {/* Final Total */}
                <div className="p-4 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 border border-cyan-500/20 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Items</span><span>${itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Shopping Service (10%)</span><span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Delivery</span><span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Tax</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Tip</span><span>${tip.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-cyan-500/20">
                    <span>Total</span>
                    <span className="text-cyan-400">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={submitOrder}
                  disabled={submitting || !customerName || !customerPhone || !deliveryAddress}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-white font-bold text-sm transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                  ) : (
                    <><ShoppingBag className="w-5 h-5" /> Place Grocery Order — ${grandTotal.toFixed(2)}</>
                  )}
                </button>

                <p className="text-[10px] text-slate-500 text-center">
                  Your card will be charged upon order submission. A shopper will visit Walmart, purchase your items, and deliver them. Actual total may vary based on item availability.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
