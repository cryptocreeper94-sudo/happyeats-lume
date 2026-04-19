import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Database, Trash2, Mail, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="size-6 text-emerald-400" />
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2, 2026</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Your Data, Your Rights</Badge>
      </div>

      {/* Quick Summary */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Eye className="size-5 text-cyan-400" />
            The Short Version
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We collect what we need to make the app work - your name, contact info, and location for deliveries. 
            We don't sell your data to anyone. We use it to get you food, process payments, and improve the service. That's it.
          </p>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {/* What We Collect */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Database className="size-5 text-violet-400" />
              1. What We Collect
            </h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p><strong className="text-white">Account Info:</strong> Name, email, phone number when you sign up.</p>
              
              <p><strong className="text-white">Location:</strong> Your delivery location so we can get food to you. 
              We only track location when you're actively using the app.</p>
              
              <p><strong className="text-white">Orders:</strong> What you order, when, and where - so we can fulfill orders and show your history.</p>
              
              <p><strong className="text-white">Payment Info:</strong> Processed securely through our payment provider. 
              We don't store your full credit card number.</p>
              
              <p><strong className="text-white">For Vendors:</strong> Business info, menu items, photos, and banking info for payouts.</p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use It */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <MapPin className="size-5 text-rose-400" />
              2. How We Use Your Information
            </h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong className="text-white">Deliveries:</strong> To get your food to you</p>
              <p>• <strong className="text-white">Communication:</strong> Order updates, receipts, important announcements</p>
              <p>• <strong className="text-white">Payments:</strong> Processing orders and paying vendors</p>
              <p>• <strong className="text-white">Improvement:</strong> Making the app better based on how people use it</p>
              <p>• <strong className="text-white">Support:</strong> Helping you when something goes wrong</p>
            </div>
          </CardContent>
        </Card>

        {/* What We Don't Do */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Lock className="size-5 text-emerald-400" />
              3. What We DON'T Do
            </h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong className="text-rose-400">We don't sell your data</strong> - Never have, never will</p>
              <p>• <strong className="text-rose-400">We don't share with advertisers</strong> - No targeted ads based on your orders</p>
              <p>• <strong className="text-rose-400">We don't track you 24/7</strong> - Only when you're using the app</p>
              <p>• <strong className="text-rose-400">We don't keep data forever</strong> - Inactive accounts are cleaned up</p>
            </div>
          </CardContent>
        </Card>

        {/* Who We Share With */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3">4. Who We Share With (And Why)</h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p><strong className="text-white">Food Trucks:</strong> Your name and delivery location so they can prepare and coordinate your order.</p>
              
              <p><strong className="text-white">Delivery Partners:</strong> Your delivery location and phone number so they can find you.</p>
              
              <p><strong className="text-white">Payment Processors:</strong> To securely handle payments (they have their own privacy policies).</p>
              
              <p><strong className="text-white">Law Enforcement:</strong> Only if legally required with a valid court order.</p>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Trash2 className="size-5 text-cyan-400" />
              5. Your Rights
            </h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong className="text-white">Access:</strong> Ask us what data we have about you</p>
              <p>• <strong className="text-white">Correct:</strong> Fix any wrong information</p>
              <p>• <strong className="text-white">Delete:</strong> Request we delete your account and data</p>
              <p>• <strong className="text-white">Export:</strong> Get a copy of your data</p>
              <p className="mt-3">Just email us or use the chat - we'll take care of it.</p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3">6. How We Protect Your Data</h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>We use industry-standard security: encrypted connections (HTTPS), secure databases, 
              and limited access to personal information. Only people who need access to do their jobs can see your data.</p>
              
              <p>That said, no system is 100% bulletproof. We do our best, but we're honest about it.</p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3">7. Cookies & Tracking</h2>
            <div className="text-sm text-muted-foreground">
              <p>We use cookies to keep you logged in and remember your preferences. 
              We use basic analytics to see how people use the app (like which pages are popular). 
              Nothing creepy, just the basics to make things work and improve.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Mail className="size-5 text-rose-400" />
              8. Questions or Concerns?
            </h2>
            <div className="text-sm text-muted-foreground">
              <p>Privacy matters. If you have questions, want to exercise your rights, or just want to chat about how we handle data:</p>
              <p className="mt-2">
                Email: <span className="text-emerald-400">privacy@happyeats.app</span><br />
                Or use the chat button - our AI can answer most questions and connect you with a human if needed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Links */}
      <div className="flex justify-center gap-4 mt-8">
        <Link href="/terms" className="text-sm text-muted-foreground hover:text-white transition-colors">
          Terms of Service
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        © 2026 Dark Wave Studios LLC • Happy Eats • darkwavestudios.io
      </p>
    </div>
  );
}
