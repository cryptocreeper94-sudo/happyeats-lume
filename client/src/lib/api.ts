import type { Driver, Favorite, Location, Order } from "@shared/schema";

const API_BASE = "/api";

// Order Status (Traffic Light)
export async function getOrderStatus(): Promise<string> {
  const res = await fetch(`${API_BASE}/order-status`);
  if (!res.ok) throw new Error("Failed to fetch order status");
  const data = await res.json();
  return data.status;
}

export async function setOrderStatus(status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/order-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to set order status");
}

// Drivers
export async function getCurrentDriver(): Promise<Driver> {
  const res = await fetch(`${API_BASE}/driver/current`);
  if (!res.ok) throw new Error("Failed to fetch driver");
  return res.json();
}

export async function updateDriverLocation(
  id: number, 
  location: string, 
  lat?: string, 
  lng?: string
): Promise<Driver> {
  const res = await fetch(`${API_BASE}/driver/${id}/location`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, lat, lng }),
  });
  if (!res.ok) throw new Error("Failed to update location");
  return res.json();
}

// Favorites
export async function getFavorites(driverId: number): Promise<Favorite[]> {
  const res = await fetch(`${API_BASE}/driver/${driverId}/favorites`);
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function createFavorite(driverId: number, name: string, itemName?: string): Promise<Favorite> {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driverId, name, itemName }),
  });
  if (!res.ok) throw new Error("Failed to create favorite");
  return res.json();
}

export async function deleteFavorite(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/favorites/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete favorite");
}

// Locations
export async function getLocations(type?: string): Promise<Location[]> {
  const url = type ? `${API_BASE}/locations?type=${type}` : `${API_BASE}/locations`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}

export async function getLocation(id: number): Promise<Location> {
  const res = await fetch(`${API_BASE}/locations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch location");
  return res.json();
}

// Orders
export async function getOrders(driverId: number): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/driver/${driverId}/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function getOrder(id: number): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function createOrder(orderData: {
  driverId: number;
  locationId?: number;
  locationName: string;
  items: Array<{ id: number; name: string; qty: number; price: number }>;
  subtotal: string;
  deliveryFee: string;
  total: string;
  status?: string;
  deliveryInstructions?: string;
  runnerName?: string;
  runnerPhone?: string;
  estimatedDelivery?: Date;
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

// News
export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  description?: string;
}

export async function getNews(): Promise<NewsArticle[]> {
  const res = await fetch(`${API_BASE}/news`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

// Weather
export interface WeatherData {
  location: string;
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipChance: number;
  }>;
}

export async function getWeather(zipCode?: string): Promise<WeatherData> {
  const url = zipCode ? `${API_BASE}/weather?zip=${zipCode}` : `${API_BASE}/weather`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}
