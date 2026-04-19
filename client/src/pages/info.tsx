import { Link } from "wouter";
import { Truck, Car, UtensilsCrossed, Package, Wrench, MapPin, Calculator, Users, Clock, Shield } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-rose-500/20" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              HAPPY <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">EATS</span>
            </h1>
            <p className="text-2xl md:text-3xl text-orange-300 mb-2">
              Delivery That Comes To You
            </p>
            <p className="text-lg text-white/70">
              Nashville • Lebanon • Mt. Juliet, TN
            </p>
          </div>
        </div>
      </div>

      {/* What We Offer */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white text-center mb-8">What We Deliver</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 text-center border border-white/10">
            <UtensilsCrossed className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white">Food</h3>
            <p className="text-white/60 text-sm">Local restaurants & food trucks</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 text-center border border-white/10">
            <Package className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white">Parts</h3>
            <p className="text-white/60 text-sm">Auto parts & supplies</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 text-center border border-white/10">
            <Wrench className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white">Services</h3>
            <p className="text-white/60 text-sm">Mobile repairs & maintenance</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 text-center border border-white/10">
            <MapPin className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white">Supplies</h3>
            <p className="text-white/60 text-sm">Essentials delivered to you</p>
          </div>
        </div>
      </div>

      {/* Three User Paths */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Built For Drivers</h2>
        
        {/* Commercial Drivers */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 rounded-3xl p-8 border border-blue-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Truck className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Commercial Drivers</h3>
                <p className="text-blue-300">Long-haul truckers & professional drivers</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Feature icon={Clock} text="Break timer with HOS compliance" />
                <Feature icon={UtensilsCrossed} text="Order food to your truck stop location" />
                <Feature icon={Package} text="Parts & supplies delivered on route" />
                <Feature icon={MapPin} text="GPS finder for nearby services" />
              </div>
              <div className="space-y-3">
                <Feature icon={Users} text="Trucker Talk chat with other drivers" />
                <Feature icon={Calculator} text="Mileage & expense tracking" />
                <Feature icon={Shield} text="Load board integration" />
                <Feature icon={Clock} text="Break room with games & entertainment" />
              </div>
            </div>
          </div>
        </div>

        {/* Everyday Drivers */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-900/50 to-green-800/30 rounded-3xl p-8 border border-green-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <Car className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Everyday Drivers</h3>
                <p className="text-green-300">Gig workers, delivery drivers & commuters</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Feature icon={Calculator} text="Automatic mileage tracking" />
                <Feature icon={Shield} text="IRS deduction calculator ($0.70/mile)" />
                <Feature icon={Package} text="Expense categorization" />
              </div>
              <div className="space-y-3">
                <Feature icon={Clock} text="CSV export for tax season" />
                <Feature icon={UtensilsCrossed} text="Order food between deliveries" />
                <Feature icon={MapPin} text="Find nearby gas & services" />
              </div>
            </div>
          </div>
        </div>

        {/* Food Truck Vendors */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-orange-900/50 to-rose-800/30 rounded-3xl p-8 border border-orange-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                <UtensilsCrossed className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Food Truck Vendors</h3>
                <p className="text-orange-300">Restaurants, food trucks & local eateries</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Feature icon={Users} text="Reach drivers where they are" />
                <Feature icon={Clock} text="Easy order management" />
                <Feature icon={MapPin} text="Location-based visibility" />
              </div>
              <div className="space-y-3">
                <Feature icon={Calculator} text="Simple fee structure" />
                <Feature icon={Shield} text="Partner support" />
                <Feature icon={Package} text="Delivery coordination" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/70 mb-8">
            Join thousands of drivers already using Happy Eats for deliveries, tracking, and more.
          </p>
          <Link href="/">
            <a className="inline-block bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-xl py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">
              Launch App
            </a>
          </Link>
          <p className="text-white/50 text-sm mt-6">
            happyeats.app
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-white/40 text-sm">
          <p>© 2025 Happy Eats • Nashville, TN</p>
          <p className="mt-2">A Trust Layer Driver Connect Franchise</p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-white/60 flex-shrink-0" />
      <span className="text-white/80">{text}</span>
    </div>
  );
}
