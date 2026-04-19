import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Users, Truck, AlertTriangle, Scale, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
            <FileText className="size-6 text-rose-400" />
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2, 2026</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Plain English</Badge>
      </div>

      {/* Quick Summary */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Scale className="size-5 text-cyan-400" />
            The Short Version
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Happy Eats connects food trucks with hungry drivers. We handle the technology, you handle the food and deliveries. 
            Be honest, be safe, treat each other right, and we'll all do well together. That's really it.
          </p>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {/* Who We Are */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Truck className="size-5 text-rose-400" />
              1. Who We Are
            </h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                Happy Eats is operated by Dark Wave Studios LLC. We're a platform that helps food trucks 
                reach truck drivers at logistics hubs, and helps drivers get good food delivered right to their rigs.
              </p>
              <p>
                We're based in Tennessee and primarily serve the Nashville, Lebanon, Mt. Juliet, Smyrna, and LaVergne areas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Using Our Service */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Users className="size-5 text-violet-400" />
              2. Using Our Service
            </h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p><strong className="text-white">For Drivers:</strong> You can browse menus, place orders, and track deliveries. 
              You agree to pay for what you order and provide accurate delivery locations.</p>
              
              <p><strong className="text-white">For Food Trucks:</strong> You agree to provide accurate menus, prepare food safely, 
              and fulfill orders in a timely manner. You're responsible for your own food safety certifications and licenses.</p>
              
              <p><strong className="text-white">For Delivery Partners:</strong> You agree to deliver orders safely and promptly. 
              You're responsible for your own vehicle, insurance, and following traffic laws.</p>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="size-5 text-emerald-400" />
              3. Payments & Fees
            </h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>Orders include a service fee and delivery fee clearly shown before you checkout. 
              Food trucks pay a subscription fee to be listed on the platform.</p>
              
              <p>We process payments securely. Refunds are handled on a case-by-case basis - 
              if something goes wrong with your order, reach out and we'll make it right.</p>
            </div>
          </CardContent>
        </Card>

        {/* What We Expect */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="size-5 text-rose-400" />
              4. What We Expect From You
            </h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong className="text-white">Be honest</strong> - Provide accurate information</p>
              <p>• <strong className="text-white">Be respectful</strong> - Treat drivers, vendors, and staff with respect</p>
              <p>• <strong className="text-white">Be safe</strong> - Follow all applicable laws and safety guidelines</p>
              <p>• <strong className="text-white">No funny business</strong> - Don't try to game the system or defraud anyone</p>
            </div>
          </CardContent>
        </Card>

        {/* Liability */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3">5. The Legal Stuff</h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>We provide the platform "as is." While we work hard to keep things running smoothly, 
              we can't guarantee the service will be perfect 100% of the time.</p>
              
              <p>Food trucks are independent businesses - they're responsible for their own food quality and safety. 
              Delivery partners are independent contractors responsible for their own actions while delivering.</p>
              
              <p>If there's ever a legal dispute, we'll try to work it out together first. 
              If we can't, Tennessee law applies and any legal proceedings happen in Nashville.</p>
            </div>
          </CardContent>
        </Card>

        {/* Changes */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3">6. Changes to These Terms</h2>
            <div className="text-sm text-muted-foreground">
              <p>We might update these terms from time to time. If we make big changes, we'll let you know. 
              Continuing to use the service after changes means you accept the new terms.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-3">7. Questions?</h2>
            <div className="text-sm text-muted-foreground">
              <p>Got questions about these terms? We're happy to explain anything that's unclear.</p>
              <p className="mt-2">
                Email: <span className="text-rose-400">support@happyeats.app</span><br />
                Or use the chat button on any page to talk to our AI assistant.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Links */}
      <div className="flex justify-center gap-4 mt-8">
        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-white transition-colors">
          Privacy Policy
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
