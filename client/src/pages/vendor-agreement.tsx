import { Link } from "wouter";
import { ArrowLeft, Shield, FileText, Scale, HandshakeIcon, DollarSign, AlertTriangle, CheckCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

export default function VendorAgreement() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/vendor-portal">
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" data-testid="button-back">
            <ArrowLeft className="size-4 mr-1" /> Back to Vendor Portal
          </Button>
        </Link>
      </div>

      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
          <HandshakeIcon className="size-5 text-orange-400" />
          <span className="text-orange-300 font-semibold text-sm">Vendor Agreement</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-vendor-agreement-title">Happy Eats Vendor Agreement</h1>
        <p className="text-white/40">Effective Date: March 1, 2026 | Version 1.0</p>
        <p className="text-white/50 text-sm mt-2">Dark Wave Studios LLC dba Happy Eats</p>
      </div>

      <div className={`${GLASS_CARD} rounded-2xl p-6 space-y-6`}>
        <Section icon={FileText} title="1. Overview" color="orange">
          <p>This Vendor Agreement ("Agreement") is entered into between Dark Wave Studios LLC, doing business as Happy Eats ("Platform," "we," "us"), and the vendor ("Vendor," "you") who registers for an account on the Happy Eats platform.</p>
          <p>By creating a vendor account and checking the agreement box during registration, you acknowledge that you have read, understood, and agree to be bound by this Agreement, our Terms of Service, and our Privacy Policy.</p>
        </Section>

        <Section icon={Truck} title="2. Vendor Eligibility" color="cyan">
          <p>To register as a vendor on Happy Eats, you must:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/60">
            <li>Be a legally operating food service business (food truck, restaurant, catering, etc.)</li>
            <li>Hold a valid health inspection certificate from your local health department</li>
            <li>Maintain all required local, state, and federal permits and licenses</li>
            <li>Have the legal authority to enter into this agreement on behalf of your business</li>
            <li>Provide accurate and truthful information during registration</li>
          </ul>
        </Section>

        <Section icon={DollarSign} title="3. Commission & Payments" color="emerald">
          <p>Happy Eats charges a <strong className="text-white">20% commission</strong> on completed orders only.</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/60">
            <li>No signup fees, no monthly fees, no hidden charges</li>
            <li>You keep 80% of every completed order</li>
            <li>Payments are processed through Stripe and deposited to your connected account</li>
            <li>Settlement timing follows standard Stripe payout schedules (typically 2 business days)</li>
            <li>You are responsible for any applicable taxes on your income</li>
            <li>Refunds for customer complaints are handled on a case-by-case basis; the platform may deduct refunded amounts from your earnings</li>
          </ul>
        </Section>

        <Section icon={Scale} title="4. Vendor Responsibilities" color="violet">
          <p>As a vendor on Happy Eats, you agree to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/60">
            <li>Maintain accurate and up-to-date menu information (items, descriptions, prices, availability)</li>
            <li>Fulfill accepted orders promptly and to the quality described in your menu</li>
            <li>Maintain all health and safety standards required by law</li>
            <li>Check in daily using the vendor dashboard when you are available to accept orders</li>
            <li>Respond to customer and platform communications in a timely manner</li>
            <li>Not engage in fraudulent, deceptive, or misleading practices</li>
            <li>Not list items that violate any law, regulation, or third-party rights</li>
            <li>Maintain food safety and proper food handling practices at all times</li>
            <li>Keep your health inspection certification current and upload renewed documentation promptly</li>
          </ul>
        </Section>

        <Section icon={Shield} title="5. Platform Rights & Obligations" color="blue">
          <p>Happy Eats reserves the right to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/60">
            <li>Approve or deny vendor registrations at our sole discretion</li>
            <li>Suspend or terminate vendor accounts for violations of this Agreement, our Terms, or applicable law</li>
            <li>Modify commission rates with 30 days' written notice</li>
            <li>Remove menu items that violate our policies</li>
            <li>Use vendor business names, logos, and menu descriptions for marketing and promotional purposes on the platform</li>
            <li>Mediate disputes between vendors and customers</li>
          </ul>
          <p className="mt-3">Happy Eats will:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/60">
            <li>Process payments accurately and on schedule</li>
            <li>Provide a vendor dashboard for menu and order management</li>
            <li>Provide free marketing tools (business cards, flyers, AI flyer creator, social templates)</li>
            <li>Handle customer payment processing and delivery logistics</li>
            <li>Notify you of any material changes to this Agreement</li>
          </ul>
        </Section>

        <Section icon={AlertTriangle} title="6. Liability & Indemnification" color="amber">
          <p>You agree to indemnify and hold harmless Dark Wave Studios LLC, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/60">
            <li>Your breach of this Agreement</li>
            <li>Your violation of any law or regulation</li>
            <li>Foodborne illness or injury resulting from food you prepare or sell</li>
            <li>Inaccurate menu information or misleading descriptions</li>
            <li>Any dispute between you and your customers related to food quality</li>
          </ul>
          <p className="mt-3">Happy Eats is not liable for:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/60">
            <li>Food quality, preparation, or safety — that is solely your responsibility</li>
            <li>Delays caused by delivery drivers or third-party services</li>
            <li>Loss of revenue due to platform downtime or technical issues (though we strive for 99.9% uptime)</li>
          </ul>
        </Section>

        <Section icon={FileText} title="7. Termination" color="rose">
          <p>Either party may terminate this Agreement at any time:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/60">
            <li><strong className="text-white">You</strong> can deactivate your vendor account at any time through the vendor dashboard or by contacting us</li>
            <li><strong className="text-white">We</strong> may suspend or terminate your account immediately for Agreement violations, illegal activity, or repeated customer complaints</li>
            <li>Upon termination, any pending payments for completed orders will still be processed</li>
            <li>Termination does not release either party from obligations that accrued before the termination date</li>
          </ul>
        </Section>

        <Section icon={Scale} title="8. Governing Law & Disputes" color="sky">
          <p>This Agreement is governed by the laws of the State of Tennessee, United States. Any disputes arising under this Agreement shall be resolved through binding arbitration in Nashville, Tennessee, in accordance with the rules of the American Arbitration Association.</p>
          <p className="mt-2">Both parties waive the right to a jury trial and agree not to participate in a class action lawsuit related to this Agreement.</p>
        </Section>

        <Section icon={CheckCircle} title="9. Digital Signature & Consent" color="emerald">
          <p>By checking the "I agree" checkbox during vendor registration, you are providing your electronic signature and consent to this Agreement. This electronic acceptance has the same legal force as a handwritten signature.</p>
          <p className="mt-2">Upon registration, we record:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/60">
            <li>Date and time of your acceptance</li>
            <li>Your IP address at the time of acceptance</li>
            <li>The version of each agreement you accepted</li>
            <li>Your browser/device information</li>
          </ul>
          <p className="mt-2">A confirmation email with a complete record of your accepted agreements will be sent to the email address you provide during registration.</p>
        </Section>
      </div>

      <div className="text-center pt-4">
        <p className="text-white/30 text-xs">Questions? Contact us at team@dwtl.io or (615) 601-2952</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link href="/terms">
            <span className="text-cyan-400 text-xs hover:text-cyan-300 cursor-pointer">Terms of Service</span>
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/privacy">
            <span className="text-cyan-400 text-xs hover:text-cyan-300 cursor-pointer">Privacy Policy</span>
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/vendor-portal">
            <span className="text-cyan-400 text-xs hover:text-cyan-300 cursor-pointer">Vendor Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    orange: "text-orange-400 bg-orange-500/15",
    cyan: "text-cyan-400 bg-cyan-500/15",
    emerald: "text-emerald-400 bg-emerald-500/15",
    violet: "text-violet-400 bg-violet-500/15",
    blue: "text-blue-400 bg-blue-500/15",
    amber: "text-amber-400 bg-amber-500/15",
    rose: "text-rose-400 bg-rose-500/15",
    sky: "text-sky-400 bg-sky-500/15",
  };
  const c = colorMap[color] || colorMap.orange;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`size-9 rounded-xl flex items-center justify-center ${c}`}>
          <Icon className="size-5" />
        </div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="text-sm text-white/60 leading-relaxed space-y-2 pl-12">
        {children}
      </div>
    </div>
  );
}
