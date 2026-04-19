import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Store, ShoppingCart, Megaphone, MessageSquare,
  DollarSign, MapPin, Truck, Shield, Ticket, Handshake,
  FileImage, BarChart3, Globe, Rocket, Search,
  ChevronDown, Phone, Mail, Clock,
  Star, Zap, HelpCircle, Compass,
  Briefcase, Hash, Languages, ExternalLink,
  PlayCircle, Users, CheckCircle2, ListChecks
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/context";
import manualHero from "@/assets/images/cc/operations_manual.png";

const GLASS = "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]";

type Lang = "en" | "es";

const T = {
  pageTitle: { en: "Operations Manual", es: "Manual de Operaciones" },
  pageSubtitle: { en: "Complete platform reference guide", es: "Guía completa de referencia de la plataforma" },
  azGuide: { en: "A-Z Guide", es: "Guía A-Z" },
  heroTitle: { en: "Everything You Need to Know", es: "Todo Lo Que Necesitas Saber" },
  heroDesc: { en: "From vendor signup to order delivery — the complete guide to operating Happy Eats. Tap any section below to expand it.", es: "Desde el registro de vendedores hasta la entrega de pedidos — la guía completa para operar Happy Eats. Toca cualquier sección para expandirla." },
  searchPlaceholder: { en: "Search topics...", es: "Buscar temas..." },
  quickNav: { en: "Quick Navigation", es: "Navegación Rápida" },
  topics: { en: "topics", es: "temas" },
  needHelp: { en: "Need Help?", es: "¿Necesitas Ayuda?" },
  needHelpDesc: { en: "Join Signal Chat and head to the #vendor-support channel. Our team monitors it regularly and will help you with any questions or issues.", es: "Únete a Signal Chat y ve al canal #vendor-support. Nuestro equipo lo monitorea regularmente y te ayudará con cualquier pregunta o problema." },
  openSignalChat: { en: "Open Signal Chat", es: "Abrir Signal Chat" },
  noResults: { en: "No topics found matching", es: "No se encontraron temas que coincidan con" },
  clearSearch: { en: "Clear search", es: "Limpiar búsqueda" },
} as const;

interface ManualSection {
  id: string;
  title: Record<Lang, string>;
  icon: React.ReactNode;
  gradient: string;
  items: { title: Record<Lang, string>; content: Record<Lang, React.ReactNode> }[];
}

function AccordionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${GLASS} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.03] transition-colors"
        data-testid={`accordion-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span className="text-sm font-semibold text-white/90">{title}</span>
        <ChevronDown className={`size-4 text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.06]">
          <div className="pt-3 text-sm text-white/60 leading-relaxed space-y-2">{children}</div>
        </div>
      )}
    </div>
  );
}

function SectionBlock({ section, lang, defaultExpanded = false }: { section: ManualSection; lang: Lang; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div id={section.id} className="scroll-mt-20">
      <button onClick={() => setExpanded(!expanded)} className="w-full group" data-testid={`section-${section.id}`}>
        <div className={`flex items-center gap-3 mb-3 p-3 rounded-xl ${GLASS} hover:bg-white/[0.05] transition-all`}>
          <div className={`size-10 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center text-white shadow-lg`}>
            {section.icon}
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-base font-bold text-white">{section.title[lang]}</h3>
            <p className="text-[11px] text-white/30">{section.items.length} {T.topics[lang]}</p>
          </div>
          <ChevronDown className={`size-5 text-white/30 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 ml-2 mb-6">
          {section.items.map((item, i) => (
            <AccordionBlock key={i} title={item.title[lang]}>
              {item.content[lang]}
            </AccordionBlock>
          ))}
        </motion.div>
      )}
    </div>
  );
}

const B = ({ children }: { children: React.ReactNode }) => <strong className="text-white/80">{children}</strong>;
const H = ({ children, color = "text-orange-300" }: { children: React.ReactNode; color?: string }) => <strong className={color}>{children}</strong>;
const GoTo = ({ href, children }: { children: React.ReactNode; href: string }) => (
  <Link href={href} className="inline-flex items-center gap-1 mt-2 px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 text-orange-300 hover:text-orange-200 text-xs font-medium transition-all" data-testid={`link-goto-${href.replace(/\//g, '-').slice(1)}`}>
    <ExternalLink className="size-3" />
    {children}
  </Link>
);

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02]">
    <div className="size-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300 font-bold text-[11px] shrink-0 mt-0.5">{n}</div>
    <div className="text-sm text-white/60 leading-relaxed">{children}</div>
  </div>
);

const SECTIONS: ManualSection[] = [
  {
    id: "quick-start",
    title: { en: "Quick Start Guides", es: "Guías de Inicio Rápido" },
    icon: <PlayCircle className="size-5" />,
    gradient: "from-rose-500 to-orange-500",
    items: [
      {
        title: { en: "Owner / Admin Quick Start", es: "Inicio Rápido para Propietario / Admin" },
        content: {
          en: (
            <>
              <p className="text-orange-300 font-semibold text-xs mb-3">Your daily checklist to run Happy Eats smoothly</p>
              <div className="space-y-2">
                <Step n={1}><B>Log in to Command Center</B> — Go to <H>/command-center</H> and enter your owner PIN. This unlocks all admin tools.</Step>
                <Step n={2}><B>Check vendor availability</B> — Open <H>Sandbox Hub</H> (Operations &gt; Sandbox Hub). Look at the "Truck Status" section to see which vendors have checked in today. If none have, reach out to your vendors.</Step>
                <Step n={3}><B>Activate delivery zones</B> — In Sandbox Hub, toggle on the zones you want to serve today using the "Zone Controls" section. Only active zones will appear to customers.</Step>
                <Step n={4}><B>Plan tomorrow's zones</B> — Scroll to "Tomorrow's Plan" and check the zones you plan to operate in tomorrow. At 8:30 PM tonight, every vendor with a phone or email on file will get a notification to confirm their availability.</Step>
                <Step n={5}><B>Monitor the order pipeline</B> — Watch the "Order Pipeline" in Sandbox Hub. Orders flow through: Pending → Confirmed → Picked Up → In Progress → Delivered. You can see everything in real-time.</Step>
                <Step n={6}><B>Handle batch pickup windows</B> — Each zone can have multiple pickup windows (Morning Run 10:00 AM cutoff, Midday Run 12:00 PM cutoff, etc.). Make sure drivers know which window they're picking up for.</Step>
                <Step n={7}><B>Review analytics</B> — Go to Command Center &gt; Owner Dashboard for revenue, order counts, and vendor performance. The <H>Revenue Split panel</H> shows the full breakdown per order — Kathy 50% / Jason 40% / Expense 10% — so both partners see exactly where every dollar goes.</Step>
                <Step n={8}><B>Communicate with the team</B> — Use <H>Signal Chat</H> (Communication &gt; Signal Chat) to stay in touch. The #vendor-support channel is for vendor questions, #happy-eats for general operations.</Step>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-orange-300 font-semibold text-[11px]">Key Pages for Owners</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <GoTo href="/command-center">Command Center</GoTo>
                  <GoTo href="/sandbox">Sandbox Hub</GoTo>
                  <GoTo href="/owner">Owner Dashboard</GoTo>
                  <GoTo href="/signal-chat">Signal Chat</GoTo>
                  <GoTo href="/zones">Zone Map</GoTo>
                </div>
              </div>
            </>
          ),
          es: (
            <>
              <p className="text-orange-300 font-semibold text-xs mb-3">Tu lista de verificación diaria para operar Happy Eats sin problemas</p>
              <div className="space-y-2">
                <Step n={1}><B>Inicia sesión en el Centro de Comando</B> — Ve a <H>/command-center</H> e ingresa tu PIN de propietario. Esto desbloquea todas las herramientas admin.</Step>
                <Step n={2}><B>Verifica la disponibilidad de vendedores</B> — Abre <H>Sandbox Hub</H> (Operaciones &gt; Sandbox Hub). Mira la sección "Estado de Trucks" para ver qué vendedores hicieron check-in hoy.</Step>
                <Step n={3}><B>Activa las zonas de entrega</B> — En Sandbox Hub, activa las zonas que quieres servir hoy usando la sección "Controles de Zona". Solo las zonas activas aparecerán para los clientes.</Step>
                <Step n={4}><B>Planifica las zonas de mañana</B> — Desplázate a "Plan de Mañana" y selecciona las zonas para mañana. A las 8:30 PM esta noche, cada vendedor con teléfono o email recibirá una notificación.</Step>
                <Step n={5}><B>Monitorea el pipeline de pedidos</B> — Observa el "Pipeline de Pedidos" en Sandbox Hub. Los pedidos fluyen: Pendiente → Confirmado → Recogido → En Progreso → Entregado.</Step>
                <Step n={6}><B>Gestiona las ventanas de recogida</B> — Cada zona puede tener múltiples ventanas de recogida. Asegúrate de que los conductores sepan qué ventana les corresponde.</Step>
                <Step n={7}><B>Revisa las analíticas</B> — Ve al Centro de Comando &gt; Panel del Propietario para ingresos, conteo de pedidos y métricas de rendimiento.</Step>
                <Step n={8}><B>Comunícate con el equipo</B> — Usa <H>Signal Chat</H> para estar en contacto. El canal #vendor-support es para preguntas de vendedores.</Step>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-orange-300 font-semibold text-[11px]">Páginas Clave para Propietarios</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <GoTo href="/command-center">Centro de Comando</GoTo>
                  <GoTo href="/sandbox">Sandbox Hub</GoTo>
                  <GoTo href="/owner">Panel del Propietario</GoTo>
                  <GoTo href="/signal-chat">Signal Chat</GoTo>
                  <GoTo href="/zones">Mapa de Zonas</GoTo>
                </div>
              </div>
            </>
          ),
        },
      },
      {
        title: { en: "Vendor Quick Start", es: "Inicio Rápido para Vendedor" },
        content: {
          en: (
            <>
              <p className="text-emerald-300 font-semibold text-xs mb-3">Everything you need to know to start selling on Happy Eats</p>
              <div className="space-y-2">
                <Step n={1}><B>Visit the Vendor Page</B> — Go to <H>happyeats.app/vendor</H> to see everything Happy Eats offers vendors. When you're ready, click <H>"Join for Free"</H> to start the signup wizard.</Step>
                <Step n={2}><B>Complete the signup wizard</B> — You'll enter your business name, owner info, food truck name, cuisine type, phone, and email. Upload your emblem/logo and health inspection certificate, then review and accept the agreements.</Step>
                <Step n={3}><B>Connect Stripe for payments</B> — During signup (or anytime from your dashboard), connect your bank account through Stripe. This is how you get paid — <H>instant payouts when your orders settle</H>, money in your bank the next business day. You keep 80% of every order.</Step>
                <Step n={4}><B>Set up your menu</B> — Log in at <H>happyeats.app/vendor/login</H>. Add your food items with names, descriptions, prices, and photos. You can also upload a photo of your menu and our AI will digitize it for you.</Step>
                <Step n={5}><B>Check in every morning</B> — Each day you want to operate, toggle "Available Today" in the Daily Check-In section. If you don't check in, customers won't see your truck.</Step>
                <Step n={6}><B>Watch for orders</B> — When customers order from your truck, you get instant notifications (push + SMS). Accept the order, set your prep time, then mark it as "Preparing" and finally "Ready for Pickup."</Step>
                <Step n={7}><B>Use your free tools</B> — You get access to flyer builders, business card generators, AI marketing tools, receipt scanners, and mileage trackers — all free with your membership.</Step>
                <Step n={8}><B>Get help anytime</B> — Join <H>Signal Chat</H> and go to the #vendor-support channel. The operations team monitors it and will help you with any questions.</Step>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-300 font-semibold text-[11px]">Key Pages for Vendors</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <GoTo href="/vendor">Vendor Info Page</GoTo>
                  <GoTo href="/vendor/join">Sign Up</GoTo>
                  <GoTo href="/vendor/login">Vendor Portal</GoTo>
                  <GoTo href="/signal-chat">Signal Chat</GoTo>
                </div>
              </div>
            </>
          ),
          es: (
            <>
              <p className="text-emerald-300 font-semibold text-xs mb-3">Todo lo que necesitas saber para empezar a vender en Happy Eats</p>
              <div className="space-y-2">
                <Step n={1}><B>Visita la Página de Vendedores</B> — Ve a <H>happyeats.app/vendor</H> y conoce todo lo que Happy Eats ofrece. Cuando estés listo, haz clic en <H>"Únete Gratis"</H> para comenzar.</Step>
                <Step n={2}><B>Completa el formulario</B> — Ingresa nombre del negocio, info del propietario, nombre del food truck, tipo de cocina, teléfono y email. Sube tu emblema/logo y certificado sanitario, y acepta los acuerdos.</Step>
                <Step n={3}><B>Conecta Stripe para pagos</B> — Durante el registro (o desde tu panel), conecta tu cuenta bancaria a través de Stripe. Así es como te pagan — <H>pagos instantáneos cuando tus pedidos se completan</H>, dinero en tu banco el siguiente día hábil. Te quedas con el 80% de cada pedido.</Step>
                <Step n={4}><B>Configura tu menú</B> — Inicia sesión en <H>happyeats.app/vendor/login</H>. Agrega tus platillos con nombre, descripción, precio y fotos. También puedes subir una foto de tu menú y nuestra IA lo digitalizará.</Step>
                <Step n={5}><B>Haz check-in cada mañana</B> — Cada día que quieras operar, activa "Disponible Hoy" en la sección de Check-In Diario. Si no haces check-in, los clientes no verán tu truck.</Step>
                <Step n={6}><B>Vigila los pedidos</B> — Cuando los clientes ordenen, recibirás notificaciones instantáneas (push + SMS). Acepta el pedido, establece tu tiempo de preparación, marca como "Preparando" y finalmente "Listo para Recoger."</Step>
                <Step n={7}><B>Usa tus herramientas gratuitas</B> — Tienes acceso a creadores de volantes, tarjetas de presentación, marketing con IA, escáner de recibos y rastreador de millaje — todo gratis con tu membresía.</Step>
                <Step n={8}><B>Obtén ayuda en cualquier momento</B> — Únete a <H>Signal Chat</H> y ve al canal #vendor-support. El equipo de operaciones lo monitorea.</Step>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-300 font-semibold text-[11px]">Páginas Clave para Vendedores</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <GoTo href="/vendor">Página de Vendedores</GoTo>
                  <GoTo href="/vendor/join">Registrarse</GoTo>
                  <GoTo href="/vendor/login">Portal de Vendedores</GoTo>
                  <GoTo href="/signal-chat">Signal Chat</GoTo>
                </div>
              </div>
            </>
          ),
        },
      },
      {
        title: { en: "Customer Quick Start", es: "Inicio Rápido para Cliente" },
        content: {
          en: (
            <>
              <p className="text-purple-300 font-semibold text-xs mb-3">How to order food from Happy Eats in just a few taps</p>
              <div className="space-y-2">
                <Step n={1}><B>Create an account</B> — Tap "Sign Up" and enter your name, phone number, and a password. This lets you track orders and earn rewards.</Step>
                <Step n={2}><B>Pick your delivery zone</B> — Select the zone closest to your location. Each zone covers a specific area in the Middle Tennessee corridor around Lebanon.</Step>
                <Step n={3}><B>Browse the menu</B> — You'll see food trucks that are available today. Tap any truck to see their full menu with photos, descriptions, and prices. You can order from multiple trucks in one order.</Step>
                <Step n={4}><B>Customize your order</B> — Add items to your cart. For each item, you can add extras (like extra cheese) or request removals (like no onions). Add special instructions if needed.</Step>
                <Step n={5}><B>Choose your delivery window</B> — Batch delivery means your food comes at scheduled times (e.g., Morning Run delivers around 11:00 AM, Midday Run around 1:00 PM). Pick the next available window. One-off orders deliver individually.</Step>
                <Step n={6}><B>Enter your address and pay</B> — Add your delivery address, choose a tip amount, and pay securely with your credit or debit card through Stripe.</Step>
                <Step n={7}><B>Track your order</B> — After ordering, you'll see real-time status updates: Confirmed → Preparing → Ready → Picked Up → Delivered. You'll get notifications at each step.</Step>
                <Step n={8}><B>Leave a review</B> — Once your food arrives, you'll get an email with a direct link to leave a review — no sign-in needed. Just tap the link, rate your experience, and you're done.</Step>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-purple-300 font-semibold text-[11px]">Key Pages for Customers</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <GoTo href="/explore">Explore Hub</GoTo>
                  <GoTo href="/customer/account">My Account</GoTo>
                </div>
              </div>
            </>
          ),
          es: (
            <>
              <p className="text-purple-300 font-semibold text-xs mb-3">Cómo ordenar comida de Happy Eats en pocos toques</p>
              <div className="space-y-2">
                <Step n={1}><B>Crea una cuenta</B> — Toca "Registrarse" e ingresa tu nombre, número de teléfono y una contraseña. Esto te permite rastrear pedidos y ganar recompensas.</Step>
                <Step n={2}><B>Elige tu zona de entrega</B> — Selecciona la zona más cercana a tu ubicación. Cada zona cubre un área específica en el corredor del Medio Tennessee.</Step>
                <Step n={3}><B>Explora el menú</B> — Verás los food trucks disponibles hoy. Toca cualquier truck para ver su menú completo con fotos, descripciones y precios. Puedes ordenar de varios trucks en un solo pedido.</Step>
                <Step n={4}><B>Personaliza tu pedido</B> — Agrega artículos a tu carrito. Para cada uno, puedes agregar extras o solicitar eliminaciones. Agrega instrucciones especiales si es necesario.</Step>
                <Step n={5}><B>Elige tu ventana de entrega</B> — La entrega por lotes significa que tu comida llega en horarios programados. Elige la siguiente ventana disponible. Los pedidos individuales se entregan por separado.</Step>
                <Step n={6}><B>Ingresa tu dirección y paga</B> — Agrega tu dirección de entrega, elige una propina y paga de forma segura con tarjeta a través de Stripe.</Step>
                <Step n={7}><B>Rastrea tu pedido</B> — Después de ordenar, verás actualizaciones en tiempo real: Confirmado → Preparando → Listo → Recogido → Entregado.</Step>
                <Step n={8}><B>Deja una reseña</B> — Una vez que llegue tu comida, recibirás un email con un enlace directo para dejar tu reseña — sin necesidad de iniciar sesión. Solo toca el enlace, califica tu experiencia y listo.</Step>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-purple-300 font-semibold text-[11px]">Páginas Clave para Clientes</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <GoTo href="/explore">Hub de Exploración</GoTo>
                  <GoTo href="/customer/account">Mi Cuenta</GoTo>
                </div>
              </div>
            </>
          ),
        },
      },
      {
        title: { en: "Driver Quick Start", es: "Inicio Rápido para Conductor" },
        content: {
          en: (
            <>
              <p className="text-sky-300 font-semibold text-xs mb-3">How to pick up and deliver orders as a Happy Eats driver</p>
              <div className="space-y-2">
                <Step n={1}><B>Access the Driver Dashboard</B> — Go to <H>/driver/orders</H> from the Sandbox Hub or Command Center. This is your home base for all pickups and deliveries.</Step>
                <Step n={2}><B>Check your assigned zone</B> — You'll be assigned to specific delivery zones. Make sure you know which zone you're covering today — the admin sets this in the Sandbox Hub.</Step>
                <Step n={3}><B>Wait for batch pickup time</B> — Batch orders are grouped by time windows. For example, the Morning Run pickup is at 10:30 AM. Head to the food truck hub at the Hwy 109 & I-840 intersection before pickup time.</Step>
                <Step n={4}><B>Pick up from vendors</B> — Your Pickup tab shows all orders grouped by truck. Go to each truck, confirm you've picked up their orders, and tap "Mark Picked Up." You can also use "Mark All Picked Up" to confirm everything at once.</Step>
                <Step n={5}><B>Start deliveries</B> — Switch to the Delivery tab. Each delivery shows the customer's address, order details, and a "Navigate" button that opens Google Maps with directions.</Step>
                <Step n={6}><B>Mark deliveries complete</B> — After handing off the food, tap "Mark Delivered" for each order. The customer gets a notification and can leave a review.</Step>
                <Step n={7}><B>Handle one-off orders</B> — One-off orders can come in anytime. You'll get a notification and can pick them up directly from the vendor for immediate delivery.</Step>
                <Step n={8}><B>Track your earnings</B> — Your completed deliveries and earnings are tracked automatically. Check the Completed tab to see your delivery history.</Step>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <p className="text-sky-300 font-semibold text-[11px]">Key Pages for Drivers</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <GoTo href="/driver/orders">Driver Dashboard</GoTo>
                  <GoTo href="/sandbox">Sandbox Hub</GoTo>
                  <GoTo href="/zones">Zone Map</GoTo>
                </div>
              </div>
            </>
          ),
          es: (
            <>
              <p className="text-sky-300 font-semibold text-xs mb-3">Cómo recoger y entregar pedidos como conductor de Happy Eats</p>
              <div className="space-y-2">
                <Step n={1}><B>Accede al Panel del Conductor</B> — Ve a <H>/driver/orders</H> desde el Sandbox Hub o Centro de Comando. Esta es tu base para todas las recogidas y entregas.</Step>
                <Step n={2}><B>Verifica tu zona asignada</B> — Te asignarán zonas de entrega específicas. Asegúrate de saber qué zona cubres hoy — el admin lo configura en el Sandbox Hub.</Step>
                <Step n={3}><B>Espera la hora de recogida</B> — Los pedidos por lotes se agrupan por ventanas de tiempo. Por ejemplo, la recogida de la Ronda Matutina es a las 10:30 AM. Ve al hub de food trucks antes de esa hora.</Step>
                <Step n={4}><B>Recoge de los vendedores</B> — Tu pestaña de Recogida muestra todos los pedidos agrupados por truck. Ve a cada truck, confirma que recogiste sus pedidos y toca "Marcar Recogido."</Step>
                <Step n={5}><B>Comienza las entregas</B> — Cambia a la pestaña de Entregas. Cada entrega muestra la dirección del cliente, detalles del pedido y un botón "Navegar" que abre Google Maps.</Step>
                <Step n={6}><B>Marca entregas completas</B> — Después de entregar la comida, toca "Marcar Entregado" para cada pedido. El cliente recibe una notificación.</Step>
                <Step n={7}><B>Maneja pedidos individuales</B> — Los pedidos individuales pueden llegar en cualquier momento. Recibirás una notificación y puedes recogerlos directamente.</Step>
                <Step n={8}><B>Rastrea tus ganancias</B> — Tus entregas completadas y ganancias se rastrean automáticamente. Revisa la pestaña de Completados.</Step>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <p className="text-sky-300 font-semibold text-[11px]">Páginas Clave para Conductores</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <GoTo href="/driver/orders">Panel del Conductor</GoTo>
                  <GoTo href="/sandbox">Sandbox Hub</GoTo>
                  <GoTo href="/zones">Mapa de Zonas</GoTo>
                </div>
              </div>
            </>
          ),
        },
      },
      {
        title: { en: "Testing Checklist (Before Launch)", es: "Lista de Verificación de Pruebas (Antes del Lanzamiento)" },
        content: {
          en: (
            <>
              <p className="text-amber-300 font-semibold text-xs mb-3">Run through this checklist to make sure everything works before going live on April 6</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Vendor signup</B> — Register a test vendor through the Vendor Portal. Make sure all fields save correctly.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Menu creation</B> — Add at least 3 menu items with photos, prices, and customizations.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Stripe Connect</B> — Complete Stripe onboarding for the test vendor. Verify "charges_enabled" shows true.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Daily check-in</B> — Toggle the vendor as available. Confirm the truck appears on the order page.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Place a test order</B> — As a customer, order from the test vendor. Verify the order appears in the vendor dashboard.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Vendor accepts order</B> — Accept the order, set prep time, mark as preparing, then mark as ready.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Driver pickup</B> — Assign a driver and mark the order as picked up.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Delivery completion</B> — Mark the order as delivered. Verify the customer sees the final status.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Batch windows</B> — Place orders before and after a batch cutoff to verify timing enforcement works.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Zone notifications</B> — Set tomorrow's zones and verify the 8:30 PM notification sends (check server logs).</span></div>
              </div>
            </>
          ),
          es: (
            <>
              <p className="text-amber-300 font-semibold text-xs mb-3">Revisa esta lista para asegurarte de que todo funcione antes de salir en vivo el 16 de marzo</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Registro de vendedor</B> — Registra un vendedor de prueba a través del Portal de Vendedores.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Creación de menú</B> — Agrega al menos 3 artículos del menú con fotos, precios y personalizaciones.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Stripe Connect</B> — Completa la incorporación de Stripe para el vendedor de prueba.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Check-in diario</B> — Activa la disponibilidad del vendedor. Confirma que aparece en la página de pedidos.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Pedido de prueba</B> — Como cliente, ordena del vendedor de prueba. Verifica que aparezca en el panel del vendedor.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Vendedor acepta pedido</B> — Acepta, establece tiempo de preparación, marca como preparando, luego como listo.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Recogida del conductor</B> — Asigna un conductor y marca como recogido.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Entrega completada</B> — Marca como entregado. Verifica que el cliente vea el estado final.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Ventanas de lotes</B> — Haz pedidos antes y después de un corte de lote para verificar la validación.</span></div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"><CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-white/60"><B>Notificaciones de zona</B> — Configura las zonas de mañana y verifica que se envíen a las 8:30 PM.</span></div>
              </div>
            </>
          ),
        },
      },
    ],
  },
  {
    id: "getting-started",
    title: { en: "Getting Started", es: "Primeros Pasos" },
    icon: <Rocket className="size-5" />,
    gradient: "from-orange-500 to-amber-500",
    items: [
      {
        title: { en: "What is Happy Eats?", es: "¿Qué es Happy Eats?" },
        content: {
          en: (<><p>Happy Eats is a food delivery platform designed for the Middle Tennessee corridor — specifically the I-840, Hwy 109, and I-24 area centered around Lebanon, TN. We connect food truck vendors with customers including businesses, truck stops, logistics hubs, warehouses, and everyday people in the delivery area.</p><p className="mt-2">Our central food truck hub is at the <B>Hwy 109 & I-840 intersection</B> (Lebanon area), where vendors prepare food and our drivers deliver throughout surrounding zones.</p><p className="mt-2">Happy Eats is part of the larger <B>TL Driver Connect / Trust Layer</B> ecosystem — a nationwide platform for commercial and everyday drivers.</p></>),
          es: (<><p>Happy Eats es una plataforma de entrega de comida diseñada para el corredor del Medio Tennessee — específicamente el área de I-840, Hwy 109 e I-24 centrada en Lebanon, TN. Conectamos vendedores de food trucks con clientes incluyendo empresas, paradas de camiones, centros logísticos, almacenes y personas comunes en el área de entrega.</p><p className="mt-2">Nuestro centro de food trucks está en la <B>intersección de Hwy 109 e I-840</B> (área de Lebanon), donde los vendedores preparan la comida y nuestros conductores la entregan en las zonas circundantes.</p><p className="mt-2">Happy Eats es parte del ecosistema más amplio de <B>TL Driver Connect / Trust Layer</B> — una plataforma nacional para conductores comerciales y cotidianos.</p></>),
        },
      },
      {
        title: { en: "How the Ordering System Works", es: "Cómo Funciona el Sistema de Pedidos" },
        content: {
          en: (<><p>We operate a <B>dual ordering mode</B>:</p><div className="mt-2 space-y-2"><div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"><p className="text-orange-300 font-semibold text-xs mb-1">Batch Delivery</p><p>Orders are grouped by time windows. <B>Lunch orders</B> must be placed by 10:30 AM. <B>Dinner orders</B> must be placed by 5:00 PM. This lets our drivers pick up from multiple trucks and deliver efficiently across zones.</p></div><div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20"><p className="text-sky-300 font-semibold text-xs mb-1">One-Off Orders</p><p>Customers within the local corridor can place individual orders anytime during operating hours for quicker, direct delivery.</p></div></div></>),
          es: (<><p>Operamos con un <B>modo de pedido dual</B>:</p><div className="mt-2 space-y-2"><div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"><p className="text-orange-300 font-semibold text-xs mb-1">Entrega por Lotes</p><p>Los pedidos se agrupan por ventanas de tiempo. <B>Pedidos de almuerzo</B> deben hacerse antes de las 10:30 AM. <B>Pedidos de cena</B> antes de las 5:00 PM. Esto permite a nuestros conductores recoger de varios trucks y entregar eficientemente.</p></div><div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20"><p className="text-sky-300 font-semibold text-xs mb-1">Pedidos Individuales</p><p>Los clientes dentro del corredor local pueden hacer pedidos individuales en cualquier momento durante el horario de operación.</p></div></div></>),
        },
      },
      {
        title: { en: "Delivery Zones Explained", es: "Zonas de Entrega Explicadas" },
        content: {
          en: (<><p>The Middle Tennessee service area is divided into <B>10 delivery zones</B> radiating from our central hub. Each zone covers a specific geographic area along the I-840/109/I-24 corridor.</p><p className="mt-2">Zone status (active/inactive) is managed from the <B>Zone Map</B> in Command Center &gt; Operations. Zones can be toggled based on driver availability and demand.</p><p className="mt-2">Customers select their zone when ordering, and the system automatically routes deliveries to the right drivers.</p><GoTo href="/zones">Zone Map</GoTo></>),
          es: (<><p>El área de servicio del Medio Tennessee está dividida en <B>10 zonas de entrega</B> que irradian desde nuestro centro principal. Cada zona cubre un área geográfica específica a lo largo del corredor I-840/109/I-24.</p><p className="mt-2">El estado de las zonas (activa/inactiva) se gestiona desde el <B>Mapa de Zonas</B> en Centro de Comando &gt; Operaciones. Las zonas se pueden activar según la disponibilidad de conductores y la demanda.</p><p className="mt-2">Los clientes seleccionan su zona al hacer pedidos y el sistema envía las entregas automáticamente a los conductores correctos.</p></>),
        },
      },
      {
        title: { en: "User Roles & Access", es: "Roles de Usuario y Acceso" },
        content: {
          en: (<><p>The platform has several user types:</p><ul className="mt-2 space-y-1.5"><li className="flex items-start gap-2"><Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] shrink-0 mt-0.5">Owner</Badge><span>Full access to Command Center, admin tools, analytics, and settings.</span></li><li className="flex items-start gap-2"><Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] shrink-0 mt-0.5">Developer</Badge><span>Full access plus developer tools and technical diagnostics.</span></li><li className="flex items-start gap-2"><Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] shrink-0 mt-0.5">Vendor</Badge><span>Vendor dashboard, menu management, order tracking, and marketing tools.</span></li><li className="flex items-start gap-2"><Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[10px] shrink-0 mt-0.5">Driver</Badge><span>Driver orders view, pickup/delivery management, and route info.</span></li><li className="flex items-start gap-2"><Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] shrink-0 mt-0.5">Customer</Badge><span>Browse menus, place orders, track deliveries, leave reviews.</span></li></ul></>),
          es: (<><p>La plataforma tiene varios tipos de usuarios:</p><ul className="mt-2 space-y-1.5"><li className="flex items-start gap-2"><Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] shrink-0 mt-0.5">Propietario</Badge><span>Acceso completo al Centro de Comando, herramientas admin, analíticas y configuración.</span></li><li className="flex items-start gap-2"><Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] shrink-0 mt-0.5">Desarrollador</Badge><span>Acceso completo más herramientas de desarrollo y diagnósticos técnicos.</span></li><li className="flex items-start gap-2"><Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] shrink-0 mt-0.5">Vendedor</Badge><span>Panel de vendedor, gestión de menú, seguimiento de pedidos y herramientas de marketing.</span></li><li className="flex items-start gap-2"><Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[10px] shrink-0 mt-0.5">Conductor</Badge><span>Vista de pedidos del conductor, gestión de recogida/entrega e info de rutas.</span></li><li className="flex items-start gap-2"><Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] shrink-0 mt-0.5">Cliente</Badge><span>Explorar menús, hacer pedidos, rastrear entregas, dejar reseñas.</span></li></ul></>),
        },
      },
      {
        title: { en: "PIN-Based Admin Login", es: "Inicio de Sesión Admin con PIN" },
        content: {
          en: (<><p>The Command Center and admin tools are protected by a <B>PIN code</B>. Owners and developers each have their own PIN to access the admin dashboard, Command Center, marketing tools, and management features.</p><p className="mt-2">Navigate to the admin login and enter your PIN. Once authenticated, you'll have access to all admin-level tools for your session.</p></>),
          es: (<><p>El Centro de Comando y las herramientas admin están protegidos por un <B>código PIN</B>. Los propietarios y desarrolladores tienen su propio PIN para acceder al panel admin, Centro de Comando, herramientas de marketing y funciones de gestión.</p><p className="mt-2">Navega al inicio de sesión admin e ingresa tu PIN. Una vez autenticado, tendrás acceso a todas las herramientas de nivel admin durante tu sesión.</p></>),
        },
      },
    ],
  },
  {
    id: "vendor-management",
    title: { en: "Vendor Management", es: "Gestión de Vendedores" },
    icon: <Store className="size-5" />,
    gradient: "from-emerald-500 to-teal-500",
    items: [
      {
        title: { en: "How Vendors Sign Up", es: "Cómo se Registran los Vendedores" },
        content: {
          en: (<><p>Vendors sign up through the <B>Vendor Portal</B> (Command Center &gt; Vendors &gt; Vendor Portal). The signup process collects:</p><ul className="mt-2 space-y-1 list-disc list-inside"><li>Business name, owner name, email, and phone</li><li>Food truck name and cuisine type</li><li>Health inspection certificate upload</li><li>Trust Layer ID (for verification via dwtl.io)</li><li>Optional referral code and invite code</li></ul><p className="mt-2">After signing up, vendors get access to their own dashboard where they can manage their menu, track orders, and use all the tools we provide.</p><GoTo href="/vendor-portal">Vendor Portal</GoTo></>),
          es: (<><p>Los vendedores se registran a través del <B>Portal de Vendedores</B> (Centro de Comando &gt; Vendedores &gt; Portal de Vendedores). El proceso de registro recopila:</p><ul className="mt-2 space-y-1 list-disc list-inside"><li>Nombre del negocio, nombre del propietario, email y teléfono</li><li>Nombre del food truck y tipo de cocina</li><li>Certificado de inspección sanitaria</li><li>ID de Trust Layer (para verificación en dwtl.io)</li><li>Código de referencia e invitación (opcional)</li></ul><p className="mt-2">Después de registrarse, los vendedores acceden a su propio panel donde pueden gestionar su menú, rastrear pedidos y usar todas las herramientas que proporcionamos.</p></>),
        },
      },
      {
        title: { en: "Trust Layer Verification", es: "Verificación Trust Layer" },
        content: {
          en: (<><p><B>Trust Layer</B> is our vendor verification and identity system. Every vendor gets a Trust Layer ID that links their truck to the platform.</p><p className="mt-2">Vendors visit <H>dwtl.io</H> to set up their full Trust Layer membership — it verifies identity, connects to the ordering system, and grants access to the full ecosystem.</p><p className="mt-2">The Trust Layer ID can be entered during signup or added later from the vendor dashboard.</p></>),
          es: (<><p><B>Trust Layer</B> es nuestro sistema de verificación e identidad de vendedores. Cada vendedor recibe un ID de Trust Layer que vincula su truck con la plataforma.</p><p className="mt-2">Los vendedores visitan <H>dwtl.io</H> para configurar su membresía completa de Trust Layer — verifica identidad, conecta al sistema de pedidos y otorga acceso a todo el ecosistema.</p><p className="mt-2">El ID de Trust Layer se puede ingresar durante el registro o agregarlo después desde el panel del vendedor.</p></>),
        },
      },
      {
        title: { en: "Vendor Daily Check-In", es: "Check-In Diario del Vendedor" },
        content: {
          en: (<><p>Each morning, vendors confirm whether they're operating that day through the <B>Daily Availability Check-In</B>. This keeps the customer menu accurate — only trucks that are actually serving show up for ordering.</p><p className="mt-2">Vendors simply toggle their availability status from their dashboard. If they don't check in, they won't appear in the active vendor list for the day.</p></>),
          es: (<><p>Cada mañana, los vendedores confirman si están operando ese día a través del <B>Check-In de Disponibilidad Diaria</B>. Esto mantiene el menú del cliente actualizado — solo los trucks que realmente están sirviendo aparecen para pedidos.</p><p className="mt-2">Los vendedores simplemente activan/desactivan su estado de disponibilidad desde su panel. Si no hacen check-in, no aparecerán en la lista de vendedores activos del día.</p></>),
        },
      },
      {
        title: { en: "Menu Management", es: "Gestión de Menú" },
        content: {
          en: (<><p>Vendors have full control over their menu through the <B>Vendor Dashboard</B>:</p><ul className="mt-2 space-y-1 list-disc list-inside"><li>Add, edit, and delete menu items</li><li>Set prices and update them anytime</li><li>Toggle item availability on/off</li><li>Add customization options (add-ons, removals, special requests)</li><li>Upload food photos for each item</li></ul><p className="mt-2">Each vendor also gets their own <B>ordering URL</B> where customers can browse and order directly from their truck.</p></>),
          es: (<><p>Los vendedores tienen control total de su menú a través del <B>Panel del Vendedor</B>:</p><ul className="mt-2 space-y-1 list-disc list-inside"><li>Agregar, editar y eliminar elementos del menú</li><li>Establecer precios y actualizarlos en cualquier momento</li><li>Activar/desactivar disponibilidad de elementos</li><li>Agregar opciones de personalización (extras, eliminaciones, solicitudes especiales)</li><li>Subir fotos de comida para cada elemento</li></ul><p className="mt-2">Cada vendedor también obtiene su propia <B>URL de pedidos</B> donde los clientes pueden explorar y ordenar directamente.</p></>),
        },
      },
      {
        title: { en: "Vendor Pricing Model", es: "Modelo de Precios para Vendedores" },
        content: {
          en: (<><p className="text-emerald-300 font-semibold">Zero upfront cost to join.</p><p className="mt-2">We charge a <B>20% platform fee</B> only on completed orders. No signup fees, no monthly fees, no hidden charges. Vendors set their own menu prices — they keep <H color="text-emerald-300">80% of every order</H>.</p><p className="mt-2"><B>Instant payouts</B> — your cut is transferred to your Stripe account the moment an order settles. Money hits your bank the next business day. No waiting for weekly checks.</p></>),
          es: (<><p className="text-emerald-300 font-semibold">Cero costo inicial para unirse.</p><p className="mt-2">Cobramos una <B>tarifa de plataforma del 20%</B> solo en pedidos completados. Sin tarifas de registro, sin tarifas mensuales, sin cargos ocultos. Los vendedores establecen sus propios precios — se quedan con el <H color="text-emerald-300">80% de cada pedido</H>.</p><p className="mt-2"><B>Pagos instantáneos</B> — tu parte se transfiere a tu cuenta Stripe en el momento que el pedido se completa. El dinero llega a tu banco el siguiente día hábil. Sin esperar cheques semanales.</p></>),
        },
      },
      {
        title: { en: "Vendor Order Management", es: "Gestión de Pedidos del Vendedor" },
        content: {
          en: (<><p>When orders come in, vendors see them in their <B>Order Management Dashboard</B> with real-time notifications:</p><ul className="mt-2 space-y-1 list-disc list-inside"><li>View incoming orders instantly</li><li>Accept or decline orders</li><li>Mark orders as being prepared</li><li>Mark orders as ready for pickup</li><li>Track order history and earnings</li></ul></>),
          es: (<><p>Cuando llegan pedidos, los vendedores los ven en su <B>Panel de Gestión de Pedidos</B> con notificaciones en tiempo real:</p><ul className="mt-2 space-y-1 list-disc list-inside"><li>Ver pedidos entrantes al instante</li><li>Aceptar o rechazar pedidos</li><li>Marcar pedidos como en preparación</li><li>Marcar pedidos como listos para recoger</li><li>Rastrear historial de pedidos y ganancias</li></ul></>),
        },
      },
    ],
  },
  {
    id: "vendor-benefits",
    title: { en: "Vendor Benefits & Free Tools", es: "Beneficios y Herramientas Gratuitas para Vendedores" },
    icon: <Star className="size-5" />,
    gradient: "from-amber-500 to-yellow-500",
    items: [
      {
        title: { en: "Overview of Vendor Perks", es: "Resumen de Beneficios para Vendedores" },
        content: {
          en: (<><p>When vendors join Happy Eats, they get access to a powerful suite of <B>free business tools</B> — not just a food delivery listing. We designed these tools because <H color="text-amber-300">we genuinely care about helping our vendors succeed</H>. Here's everything included:</p></>),
          es: (<><p>Cuando los vendedores se unen a Happy Eats, obtienen acceso a un potente conjunto de <B>herramientas de negocio gratuitas</B> — no solo un listado de entrega de comida. Diseñamos estas herramientas porque <H color="text-amber-300">genuinamente nos importa ayudar a nuestros vendedores a tener éxito</H>. Aquí está todo lo que incluye:</p></>),
        },
      },
      {
        title: { en: "Flyer Maker & Print Materials", es: "Creador de Volantes y Materiales Impresos" },
        content: {
          en: (<><p>Vendors get free access to our <B>Flyer Builder</B> — a full design tool for creating professional marketing flyers. Choose from multiple templates, customize colors and text, add your logo, and print or share digitally.</p><p className="mt-2">There's also a dedicated <B>Food Truck Flyer</B> tool specifically designed for vendor outreach materials — perfect for posting at truck stops, community boards, or handing out at events.</p><p className="mt-2 text-amber-300 text-xs">Find it: Command Center &gt; Marketing &gt; Flyer Builder / Food Truck Flyers</p><div className="flex gap-2 flex-wrap"><GoTo href="/flyer">Flyer Builder</GoTo><GoTo href="/food-truck-flyer">Food Truck Flyer</GoTo></div></>),
          es: (<><p>Los vendedores tienen acceso gratuito a nuestro <B>Creador de Volantes</B> — una herramienta de diseño completa para crear volantes de marketing profesionales. Elige entre múltiples plantillas, personaliza colores y texto, agrega tu logo e imprime o comparte digitalmente.</p><p className="mt-2">También hay una herramienta dedicada de <B>Volantes de Food Truck</B> diseñada específicamente para materiales de promoción — perfecta para publicar en paradas de camiones, tableros comunitarios o repartir en eventos.</p><p className="mt-2 text-amber-300 text-xs">Encuéntralo: Centro de Comando &gt; Marketing &gt; Creador de Volantes / Volantes de Food Truck</p></>),
        },
      },
      {
        title: { en: "Business Card Generator", es: "Generador de Tarjetas de Presentación" },
        content: {
          en: (<><p>Create professional <B>business cards</B> and marketing materials with our <B>12+ template card editor</B>. Customize with your brand colors, logo, contact info, and QR codes. Print-ready designs that make your food truck look polished and professional.</p><p className="mt-2 text-amber-300 text-xs">Find it: Command Center &gt; Marketing &gt; Marketing Materials</p><GoTo href="/marketing?tab=print">Marketing Materials</GoTo></>),
          es: (<><p>Crea <B>tarjetas de presentación</B> profesionales y materiales de marketing con nuestro <B>editor de 12+ plantillas</B>. Personaliza con los colores de tu marca, logo, info de contacto y códigos QR. Diseños listos para imprimir que dan a tu food truck un aspecto profesional.</p><p className="mt-2 text-amber-300 text-xs">Encuéntralo: Centro de Comando &gt; Marketing &gt; Materiales de Marketing</p></>),
        },
      },
      {
        title: { en: "OCR Receipt Scanner & Expense Tracking", es: "Escáner OCR de Recibos y Seguimiento de Gastos" },
        content: {
          en: (<><p>Our <B>Business Suite</B> includes an OCR-powered receipt scanner that lets vendors snap a photo of any receipt and automatically extract the details. Track business expenses effortlessly — fuel, supplies, ingredients, and more.</p><p className="mt-2">The expense tracker categorizes spending, generates reports, and helps with tax time. All your business finances in one place.</p><p className="mt-2 text-amber-300 text-xs">Find it: Command Center &gt; Business & Franchise &gt; Business Suite</p><GoTo href="/business">Business Suite</GoTo></>),
          es: (<><p>Nuestro <B>Suite de Negocios</B> incluye un escáner de recibos con tecnología OCR que permite a los vendedores tomar una foto de cualquier recibo y extraer automáticamente los detalles. Rastrea gastos de negocio sin esfuerzo — combustible, suministros, ingredientes y más.</p><p className="mt-2">El rastreador de gastos categoriza los gastos, genera reportes y ayuda en la temporada de impuestos. Todas tus finanzas de negocio en un solo lugar.</p><p className="mt-2 text-amber-300 text-xs">Encuéntralo: Centro de Comando &gt; Negocios y Franquicias &gt; Suite de Negocios</p></>),
        },
      },
      {
        title: { en: "Mileage Tracking", es: "Seguimiento de Millaje" },
        content: {
          en: (<><p>Track every mile driven for your food truck business with the built-in <B>Mileage Tracker</B>. Log trips, calculate deductions, and keep accurate records for tax purposes. Works alongside the expense tracker for complete financial visibility.</p><p className="mt-2 text-amber-300 text-xs">Find it: Command Center &gt; Business & Franchise &gt; Business Suite / Everyday Driver</p><div className="flex gap-2 flex-wrap"><GoTo href="/business">Business Suite</GoTo><GoTo href="/everyday">Everyday Driver</GoTo></div></>),
          es: (<><p>Rastrea cada milla conducida para tu negocio de food truck con el <B>Rastreador de Millaje</B> integrado. Registra viajes, calcula deducciones y mantén registros precisos para propósitos fiscales. Funciona junto con el rastreador de gastos para visibilidad financiera completa.</p><p className="mt-2 text-amber-300 text-xs">Encuéntralo: Centro de Comando &gt; Negocios y Franquicias &gt; Suite de Negocios / Conductor Cotidiano</p></>),
        },
      },
      {
        title: { en: "Marketing Hub & AI Content", es: "Centro de Marketing y Contenido IA" },
        content: {
          en: (<><p>Vendors benefit from the <B>Marketing Hub</B> — our AI-powered marketing command center. Create social media posts, blog content, and promotional materials with AI assistance. Schedule posts, manage campaigns, and build your brand presence online.</p><p className="mt-2 text-amber-300 text-xs">Find it: Command Center &gt; Marketing &gt; Marketing Hub</p><GoTo href="/marketing">Marketing Hub</GoTo></>),
          es: (<><p>Los vendedores se benefician del <B>Centro de Marketing</B> — nuestro centro de comando de marketing impulsado por IA. Crea publicaciones para redes sociales, contenido de blog y materiales promocionales con asistencia de IA. Programa publicaciones, gestiona campañas y construye tu presencia de marca en línea.</p><p className="mt-2 text-amber-300 text-xs">Encuéntralo: Centro de Comando &gt; Marketing &gt; Centro de Marketing</p></>),
        },
      },
      {
        title: { en: "Free Online Menu Page", es: "Página de Menú en Línea Gratuita" },
        content: {
          en: (<><p>Every vendor gets their own <B>dedicated ordering page</B> with a unique URL. Customers can browse your full menu, see photos, read descriptions, customize orders, and place them directly. Share this link on social media, business cards, or flyers.</p></>),
          es: (<><p>Cada vendedor obtiene su propia <B>página de pedidos dedicada</B> con una URL única. Los clientes pueden explorar tu menú completo, ver fotos, leer descripciones, personalizar pedidos y hacerlos directamente. Comparte este enlace en redes sociales, tarjetas de presentación o volantes.</p></>),
        },
      },
      {
        title: { en: "Customer Reviews & Ratings", es: "Reseñas y Calificaciones de Clientes" },
        content: {
          en: (<><p>Build your reputation with <B>verified customer reviews</B>. Every completed order gives the customer a chance to rate and review their experience. Good reviews boost your visibility in the vendor directory and build customer trust.</p></>),
          es: (<><p>Construye tu reputación con <B>reseñas verificadas de clientes</B>. Cada pedido completado le da al cliente la oportunidad de calificar y reseñar su experiencia. Las buenas reseñas aumentan tu visibilidad en el directorio de vendedores y generan confianza.</p></>),
        },
      },
      {
        title: { en: "Real-Time Order Notifications", es: "Notificaciones de Pedidos en Tiempo Real" },
        content: {
          en: (<><p>Never miss an order with <B>instant notifications</B>. When a customer places an order, you see it immediately in your dashboard. No delays, no missed opportunities.</p></>),
          es: (<><p>Nunca pierdas un pedido con <B>notificaciones instantáneas</B>. Cuando un cliente hace un pedido, lo ves inmediatamente en tu panel. Sin retrasos, sin oportunidades perdidas.</p></>),
        },
      },
    ],
  },
  {
    id: "codes-programs",
    title: { en: "Referral Codes, Invite Codes & Affiliate Program", es: "Códigos de Referencia, Códigos de Invitación y Programa de Afiliados" },
    icon: <Ticket className="size-5" />,
    gradient: "from-violet-500 to-purple-500",
    items: [
      {
        title: { en: "Invite Codes (Admin-Created)", es: "Códigos de Invitación (Creados por Admin)" },
        content: {
          en: (<><p><B>Invite codes</B> are special codes created by admins to incentivize vendor signups. Each code comes with a specific perk:</p><ul className="mt-2 space-y-1.5"><li className="flex items-start gap-2"><Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">Fee Discount</Badge><span>Reduced commission rate for a set period</span></li><li className="flex items-start gap-2"><Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">Priority Listing</Badge><span>Featured placement in the vendor directory</span></li><li className="flex items-start gap-2"><Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-[10px]">Free Marketing</Badge><span>Complimentary marketing campaign assistance</span></li><li className="flex items-start gap-2"><Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">Extended Trial</Badge><span>Longer evaluation period with reduced fees</span></li><li className="flex items-start gap-2"><Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">Bonus Credits</Badge><span>Platform credits for marketing tools</span></li></ul><p className="mt-2">Codes can have usage limits and expiration dates. Vendors enter them during signup to unlock their perk.</p><p className="mt-2 text-violet-300 text-xs">Manage: Command Center &gt; Vendors &gt; Invite Codes</p><GoTo href="/invite-codes">Manage Invite Codes</GoTo></>),
          es: (<><p>Los <B>códigos de invitación</B> son códigos especiales creados por admins para incentivar el registro de vendedores. Cada código viene con un beneficio específico:</p><ul className="mt-2 space-y-1.5"><li className="flex items-start gap-2"><Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">Descuento en Comisión</Badge><span>Tarifa de comisión reducida por un período determinado</span></li><li className="flex items-start gap-2"><Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">Listado Prioritario</Badge><span>Ubicación destacada en el directorio de vendedores</span></li><li className="flex items-start gap-2"><Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-[10px]">Marketing Gratis</Badge><span>Asistencia gratuita en campañas de marketing</span></li><li className="flex items-start gap-2"><Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">Prueba Extendida</Badge><span>Período de evaluación más largo con tarifas reducidas</span></li><li className="flex items-start gap-2"><Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">Créditos de Bonificación</Badge><span>Créditos de plataforma para herramientas de marketing</span></li></ul><p className="mt-2">Los códigos pueden tener límites de uso y fechas de vencimiento. Los vendedores los ingresan durante el registro para desbloquear su beneficio.</p><p className="mt-2 text-violet-300 text-xs">Gestionar: Centro de Comando &gt; Vendedores &gt; Códigos de Invitación</p></>),
        },
      },
      {
        title: { en: "Referral Codes (Vendor-to-Vendor)", es: "Códigos de Referencia (Vendedor a Vendedor)" },
        content: {
          en: (<><p><B>Referral codes</B> are how existing vendors can refer new food trucks to the platform. When a vendor shares their referral code and a new vendor signs up using it, both parties can earn rewards.</p><p className="mt-2">New vendors enter the referral code during signup in the "Referral Code" field. The system tracks who referred whom, enabling reward distribution.</p></>),
          es: (<><p>Los <B>códigos de referencia</B> son la forma en que los vendedores existentes pueden referir nuevos food trucks a la plataforma. Cuando un vendedor comparte su código de referencia y un nuevo vendedor se registra usándolo, ambas partes pueden ganar recompensas.</p><p className="mt-2">Los nuevos vendedores ingresan el código de referencia durante el registro en el campo "Código de Referencia". El sistema rastrea quién refirió a quién, permitiendo la distribución de recompensas.</p></>),
        },
      },
      {
        title: { en: "Affiliate Program", es: "Programa de Afiliados" },
        content: {
          en: (<><p>The <B>Affiliate Program</B> is a revenue-sharing system for anyone who promotes Happy Eats — not just existing vendors. Affiliates get a unique tracking link and earn passive income from orders generated through their referrals.</p><p className="mt-2">The Affiliate Dashboard shows earnings, click tracking, conversion rates, and payout history.</p><p className="mt-2 text-violet-300 text-xs">Manage: Command Center &gt; Account & Team &gt; Affiliate Program</p></>),
          es: (<><p>El <B>Programa de Afiliados</B> es un sistema de ingresos compartidos para cualquiera que promueva Happy Eats — no solo vendedores existentes. Los afiliados reciben un enlace de seguimiento único y ganan ingresos pasivos de los pedidos generados a través de sus referidos.</p><p className="mt-2">El Panel de Afiliados muestra ganancias, seguimiento de clics, tasas de conversión e historial de pagos.</p><p className="mt-2 text-violet-300 text-xs">Gestionar: Centro de Comando &gt; Cuenta y Equipo &gt; Programa de Afiliados</p></>),
        },
      },
      {
        title: { en: "How They All Work Together", es: "Cómo Funcionan Todos Juntos" },
        content: {
          en: (<><div className="space-y-2"><div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20"><p className="text-violet-300 font-semibold text-xs">Invite Codes</p><p className="text-[11px] mt-0.5">Created by admins to attract new vendors with special signup perks. One-time use during registration.</p></div><div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><p className="text-emerald-300 font-semibold text-xs">Referral Codes</p><p className="text-[11px] mt-0.5">Existing vendors share their code to bring in new trucks. Rewards both parties.</p></div><div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20"><p className="text-orange-300 font-semibold text-xs">Affiliate Program</p><p className="text-[11px] mt-0.5">Open to anyone. Earn ongoing revenue share from orders generated through your unique link.</p></div></div></>),
          es: (<><div className="space-y-2"><div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20"><p className="text-violet-300 font-semibold text-xs">Códigos de Invitación</p><p className="text-[11px] mt-0.5">Creados por admins para atraer nuevos vendedores con beneficios especiales de registro. Uso único durante la registración.</p></div><div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><p className="text-emerald-300 font-semibold text-xs">Códigos de Referencia</p><p className="text-[11px] mt-0.5">Los vendedores existentes comparten su código para traer nuevos trucks. Recompensa a ambas partes.</p></div><div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20"><p className="text-orange-300 font-semibold text-xs">Programa de Afiliados</p><p className="text-[11px] mt-0.5">Abierto a cualquiera. Gana ingresos compartidos continuos de pedidos generados a través de tu enlace único.</p></div></div></>),
        },
      },
    ],
  },
  {
    id: "ordering-operations",
    title: { en: "Orders & Delivery Operations", es: "Pedidos y Operaciones de Entrega" },
    icon: <ShoppingCart className="size-5" />,
    gradient: "from-blue-500 to-indigo-500",
    items: [
      {
        title: { en: "Order Flow (Step by Step)", es: "Flujo de Pedidos (Paso a Paso)" },
        content: {
          en: (<><ol className="space-y-2 list-decimal list-inside"><li><B>Customer browses</B> — Selects a vendor, views menu, customizes items</li><li><B>Customer places order</B> — Chooses batch delivery or one-off</li><li><B>Vendor receives notification</B> — Order appears in their dashboard instantly</li><li><B>Vendor prepares food</B> — Marks order as "preparing" then "ready for pickup"</li><li><B>Driver picks up</B> — Batch orders collected from hub, one-offs picked up directly</li><li><B>Driver delivers</B> — Customer gets real-time tracking updates</li><li><B>Order completed</B> — Customer can leave a review, vendor gets paid</li></ol></>),
          es: (<><ol className="space-y-2 list-decimal list-inside"><li><B>Cliente explora</B> — Selecciona un vendedor, ve el menú, personaliza artículos</li><li><B>Cliente hace el pedido</B> — Elige entrega por lotes o individual</li><li><B>Vendedor recibe notificación</B> — El pedido aparece en su panel al instante</li><li><B>Vendedor prepara la comida</B> — Marca pedido como "preparando" luego "listo para recoger"</li><li><B>Conductor recoge</B> — Pedidos por lotes recogidos del hub, individuales directamente</li><li><B>Conductor entrega</B> — Cliente recibe actualizaciones de seguimiento en tiempo real</li><li><B>Pedido completado</B> — Cliente puede dejar reseña, vendedor recibe pago</li></ol></>),
        },
      },
      {
        title: { en: "Batch Pickup Coordination (Admin)", es: "Coordinación de Recogida por Lotes (Admin)" },
        content: {
          en: (<><p>Admins coordinate batch pickups through the <B>Sandbox Hub</B>. This is the central control panel for managing the flow of orders between vendors, drivers, and customers.</p><p className="mt-2">The Sandbox Hub provides different views for each role: customer view, vendor view, driver view, and administrator view.</p><p className="mt-2 text-blue-300 text-xs">Find it: Command Center &gt; Operations &gt; Sandbox Hub</p><GoTo href="/sandbox">Sandbox Hub</GoTo></>),
          es: (<><p>Los admins coordinan las recogidas por lotes a través del <B>Sandbox Hub</B>. Este es el panel de control central para gestionar el flujo de pedidos entre vendedores, conductores y clientes.</p><p className="mt-2">El Sandbox Hub proporciona diferentes vistas para cada rol: vista de cliente, vendedor, conductor y administrador.</p><p className="mt-2 text-blue-300 text-xs">Encuéntralo: Centro de Comando &gt; Operaciones &gt; Sandbox Hub</p></>),
        },
      },
      {
        title: { en: "Order Tracking", es: "Seguimiento de Pedidos" },
        content: {
          en: (<><p>Customers can track their orders in real-time through the <B>Order Tracking</B> page. Status updates flow automatically as the order moves through each stage.</p><p className="mt-2 text-blue-300 text-xs">Find it: Command Center &gt; Orders &gt; Order Tracking</p><GoTo href="/tracking">Order Tracking</GoTo></>),
          es: (<><p>Los clientes pueden rastrear sus pedidos en tiempo real a través de la página de <B>Seguimiento de Pedidos</B>. Las actualizaciones de estado fluyen automáticamente a medida que el pedido avanza por cada etapa.</p><p className="mt-2 text-blue-300 text-xs">Encuéntralo: Centro de Comando &gt; Pedidos &gt; Seguimiento de Pedidos</p></>),
        },
      },
    ],
  },
  {
    id: "communication",
    title: { en: "Communication & Signal Chat", es: "Comunicación y Signal Chat" },
    icon: <MessageSquare className="size-5" />,
    gradient: "from-sky-500 to-blue-500",
    items: [
      {
        title: { en: "What is Signal Chat?", es: "¿Qué es Signal Chat?" },
        content: {
          en: (<><p><B>Signal Chat</B> is our built-in secure messaging system for the entire Happy Eats and Trust Layer ecosystem. It's the primary way vendors, owners, developers, drivers, and team members communicate.</p><p className="mt-2">Think of it like a team messaging app with different <B>channels</B> (group chats) organized by topic. Everyone can join the channels relevant to them and communicate in real-time.</p></>),
          es: (<><p><B>Signal Chat</B> es nuestro sistema de mensajería segura integrado para todo el ecosistema de Happy Eats y Trust Layer. Es la forma principal en que vendedores, propietarios, desarrolladores, conductores y miembros del equipo se comunican.</p><p className="mt-2">Piensa en ello como una app de mensajería de equipo con diferentes <B>canales</B> (chats grupales) organizados por tema. Todos pueden unirse a los canales relevantes y comunicarse en tiempo real.</p></>),
        },
      },
      {
        title: { en: "How to Join Signal Chat", es: "Cómo Unirse a Signal Chat" },
        content: {
          en: (<><ol className="space-y-2 list-decimal list-inside"><li><B>Navigate to Signal Chat</B> — Find it in Command Center &gt; Communication &gt; Signal Chat, or go directly to /signal-chat</li><li><B>Create an account</B> — Click "Sign Up" and enter a username, display name, email, and password</li><li><B>Optional: Add your Trust Layer ID</B> — This links your chat identity to your vendor/driver profile</li><li><B>Join channels</B> — Browse available channels and click to join</li><li><B>Start chatting</B> — Send messages, ask questions, and connect with the team</li></ol><GoTo href="/signal-chat">Signal Chat</GoTo></>),
          es: (<><ol className="space-y-2 list-decimal list-inside"><li><B>Navega a Signal Chat</B> — Encuéntralo en Centro de Comando &gt; Comunicación &gt; Signal Chat, o ve directamente a /signal-chat</li><li><B>Crea una cuenta</B> — Haz clic en "Registrarse" e ingresa usuario, nombre, email y contraseña</li><li><B>Opcional: Agrega tu ID de Trust Layer</B> — Vincula tu identidad de chat con tu perfil de vendedor/conductor</li><li><B>Únete a canales</B> — Explora los canales disponibles y haz clic para unirte</li><li><B>Comienza a chatear</B> — Envía mensajes, haz preguntas y conéctate con el equipo</li></ol></>),
        },
      },
      {
        title: { en: "Signal Chat Channels", es: "Canales de Signal Chat" },
        content: {
          en: (<><div className="space-y-1.5"><div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]"><Hash className="size-3.5 text-sky-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">general</span> <span className="text-white/30 text-[10px]">— General ecosystem discussion</span></div></div><div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]"><Hash className="size-3.5 text-sky-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">announcements</span> <span className="text-white/30 text-[10px]">— Official updates and news</span></div></div><div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/10"><Hash className="size-3.5 text-orange-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">happy-eats</span> <span className="text-white/30 text-[10px]">— Happy Eats franchise discussion</span></div></div><div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/10"><Hash className="size-3.5 text-emerald-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">vendor-support</span> <span className="text-white/30 text-[10px]">— Vendor help desk — questions, issues, connect with the team</span></div><Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] shrink-0">Vendors</Badge></div><div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]"><Hash className="size-3.5 text-amber-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">driver-lounge</span> <span className="text-white/30 text-[10px]">— Off-duty chat for drivers</span></div></div><div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]"><Hash className="size-3.5 text-sky-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">load-board-chat</span> <span className="text-white/30 text-[10px]">— Discuss loads, routes, and freight</span></div></div></div></>),
          es: (<><div className="space-y-1.5"><div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]"><Hash className="size-3.5 text-sky-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">general</span> <span className="text-white/30 text-[10px]">— Discusión general del ecosistema</span></div></div><div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]"><Hash className="size-3.5 text-sky-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">announcements</span> <span className="text-white/30 text-[10px]">— Actualizaciones oficiales y noticias</span></div></div><div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/10"><Hash className="size-3.5 text-orange-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">happy-eats</span> <span className="text-white/30 text-[10px]">— Discusión de la franquicia Happy Eats</span></div></div><div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/10"><Hash className="size-3.5 text-emerald-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">vendor-support</span> <span className="text-white/30 text-[10px]">— Mesa de ayuda para vendedores — preguntas, problemas, conecta con el equipo</span></div><Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] shrink-0">Vendedores</Badge></div><div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]"><Hash className="size-3.5 text-amber-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">driver-lounge</span> <span className="text-white/30 text-[10px]">— Chat para conductores fuera de servicio</span></div></div><div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]"><Hash className="size-3.5 text-sky-400 shrink-0" /><div><span className="text-white/80 font-medium text-xs">load-board-chat</span> <span className="text-white/30 text-[10px]">— Discutir cargas, rutas y fletes</span></div></div></div></>),
        },
      },
      {
        title: { en: "Vendor Support Channel", es: "Canal de Soporte para Vendedores" },
        content: {
          en: (<><p>The <H color="text-emerald-300">#vendor-support</H> channel is the dedicated help desk for all food truck vendors. Use it to:</p><ul className="mt-2 space-y-1 list-disc list-inside"><li>Ask questions about using the platform</li><li>Report issues with orders, payments, or your dashboard</li><li>Request help with menu setup or marketing tools</li><li>Connect directly with the Happy Eats operations team</li><li>Get updates on platform changes that affect vendors</li></ul><p className="mt-2">Owners and team leads monitor this channel regularly and will respond to your questions. It's the fastest way to get support.</p></>),
          es: (<><p>El canal <H color="text-emerald-300">#vendor-support</H> es la mesa de ayuda dedicada para todos los vendedores de food trucks. Úsalo para:</p><ul className="mt-2 space-y-1 list-disc list-inside"><li>Hacer preguntas sobre el uso de la plataforma</li><li>Reportar problemas con pedidos, pagos o tu panel</li><li>Solicitar ayuda con configuración de menú o herramientas de marketing</li><li>Conectar directamente con el equipo de operaciones de Happy Eats</li><li>Recibir actualizaciones sobre cambios en la plataforma que afecten a los vendedores</li></ul><p className="mt-2">Los propietarios y líderes del equipo monitorean este canal regularmente y responderán a tus preguntas. Es la forma más rápida de obtener soporte.</p></>),
        },
      },
      {
        title: { en: "Trucker Talk (Community Chat)", es: "Trucker Talk (Chat Comunitario)" },
        content: {
          en: (<><p><B>Trucker Talk</B> is the open community chat for all drivers — delivery drivers, commercial truck drivers, and anyone in the transportation space. It's a place to connect, share tips, talk about routes, and build relationships.</p><p className="mt-2 text-sky-300 text-xs">Find it: Command Center &gt; Communication &gt; Trucker Talk</p><GoTo href="/trucker-talk">Trucker Talk</GoTo></>),
          es: (<><p><B>Trucker Talk</B> es el chat comunitario abierto para todos los conductores — repartidores, camioneros comerciales y cualquiera en el espacio de transporte. Es un lugar para conectar, compartir consejos, hablar de rutas y construir relaciones.</p><p className="mt-2 text-sky-300 text-xs">Encuéntralo: Centro de Comando &gt; Comunicación &gt; Trucker Talk</p></>),
        },
      },
    ],
  },
  {
    id: "marketing",
    title: { en: "Marketing & Promotion Tools", es: "Herramientas de Marketing y Promoción" },
    icon: <Megaphone className="size-5" />,
    gradient: "from-fuchsia-500 to-pink-500",
    items: [
      {
        title: { en: "Marketing Hub Overview", es: "Resumen del Centro de Marketing" },
        content: {
          en: (<><p>The <B>Marketing Hub</B> is the central command center for all marketing activities — AI-powered content creation, campaign management, social media scheduling, and analytics.</p><p className="mt-2 text-fuchsia-300 text-xs">Find it: Command Center &gt; Marketing &gt; Marketing Hub</p><GoTo href="/marketing">Marketing Hub</GoTo></>),
          es: (<><p>El <B>Centro de Marketing</B> es el centro de comando para todas las actividades de marketing — creación de contenido con IA, gestión de campañas, programación de redes sociales y analíticas.</p><p className="mt-2 text-fuchsia-300 text-xs">Encuéntralo: Centro de Comando &gt; Marketing &gt; Centro de Marketing</p></>),
        },
      },
      {
        title: { en: "Flyer Builder", es: "Creador de Volantes" },
        content: {
          en: (<><p>Create professional, print-ready flyers with the drag-and-drop <B>Flyer Builder</B>. Multiple templates, full customization, and export options.</p><p className="mt-2 text-fuchsia-300 text-xs">Find it: Command Center &gt; Marketing &gt; Flyer Builder</p><GoTo href="/flyer">Flyer Builder</GoTo></>),
          es: (<><p>Crea volantes profesionales listos para imprimir con el <B>Creador de Volantes</B>. Múltiples plantillas, personalización completa y opciones de exportación.</p><p className="mt-2 text-fuchsia-300 text-xs">Encuéntralo: Centro de Comando &gt; Marketing &gt; Creador de Volantes</p></>),
        },
      },
      {
        title: { en: "Marketing Materials Editor", es: "Editor de Materiales de Marketing" },
        content: {
          en: (<><p>A full <B>12+ template card and flyer editor</B> for creating business cards, promotional cards, menus, coupons, and more. Professional designs with your branding, ready to print or share.</p><p className="mt-2 text-fuchsia-300 text-xs">Find it: Command Center &gt; Marketing &gt; Marketing Materials</p><GoTo href="/marketing?tab=print">Marketing Materials</GoTo></>),
          es: (<><p>Un <B>editor completo de 12+ plantillas</B> para crear tarjetas de presentación, tarjetas promocionales, menús, cupones y más. Diseños profesionales con tu marca, listos para imprimir o compartir.</p><p className="mt-2 text-fuchsia-300 text-xs">Encuéntralo: Centro de Comando &gt; Marketing &gt; Materiales de Marketing</p></>),
        },
      },
      {
        title: { en: "Brand Assets & Blog", es: "Activos de Marca y Blog" },
        content: {
          en: (<><p>Access official logos, color palettes, typography, and brand guidelines. Publish blog posts and content to engage customers and boost SEO.</p><p className="mt-2 text-fuchsia-300 text-xs">Find it: Command Center &gt; Marketing &gt; Brand Assets / Blog</p><div className="flex gap-2 flex-wrap"><GoTo href="/marketing?tab=brand">Brand Assets</GoTo><GoTo href="/blog">Blog</GoTo></div></>),
          es: (<><p>Accede a logos oficiales, paletas de colores, tipografía y guías de marca. Publica entradas de blog y contenido para atraer clientes y mejorar el SEO.</p><p className="mt-2 text-fuchsia-300 text-xs">Encuéntralo: Centro de Comando &gt; Marketing &gt; Activos de Marca / Blog</p></>),
        },
      },
    ],
  },
  {
    id: "business-tools",
    title: { en: "Business & Financial Tools", es: "Herramientas de Negocios y Finanzas" },
    icon: <Briefcase className="size-5" />,
    gradient: "from-violet-500 to-purple-500",
    items: [
      {
        title: { en: "Business Suite Overview", es: "Resumen del Suite de Negocios" },
        content: {
          en: (<><p>The <B>Business Suite</B> is a comprehensive financial management tool — expense tracking with OCR receipt scanning, mileage logging, and business reporting. All your finances in one place.</p><p className="mt-2 text-violet-300 text-xs">Find it: Command Center &gt; Business & Franchise &gt; Business Suite</p><GoTo href="/business">Business Suite</GoTo></>),
          es: (<><p>El <B>Suite de Negocios</B> es una herramienta integral de gestión financiera — seguimiento de gastos con escáner OCR de recibos, registro de millaje y reportes de negocio. Todas tus finanzas en un solo lugar.</p><p className="mt-2 text-violet-300 text-xs">Encuéntralo: Centro de Comando &gt; Negocios y Franquicias &gt; Suite de Negocios</p></>),
        },
      },
      {
        title: { en: "Franchise & Investor Info", es: "Información de Franquicias e Inversores" },
        content: {
          en: (<><p>Learn about franchise opportunities for expanding Happy Eats to new territories. Access pitch decks, market data, revenue models, and the full investment roadmap.</p><p className="mt-2 text-violet-300 text-xs">Find it: Command Center &gt; Business & Franchise &gt; Franchise Info / Investor Relations</p><div className="flex gap-2 flex-wrap"><GoTo href="/franchise">Franchise Info</GoTo><GoTo href="/investors">Investor Relations</GoTo></div></>),
          es: (<><p>Conoce las oportunidades de franquicia para expandir Happy Eats a nuevos territorios. Accede a presentaciones, datos de mercado, modelos de ingresos y la hoja de ruta de inversión completa.</p><p className="mt-2 text-violet-300 text-xs">Encuéntralo: Centro de Comando &gt; Negocios y Franquicias &gt; Info de Franquicia / Relaciones con Inversores</p></>),
        },
      },
      {
        title: { en: "Orbit Staffing (Partner)", es: "Orbit Staffing (Socio)" },
        content: {
          en: (<><p><B>Orbit Staffing</B> is our partner for payroll, HR, bookkeeping, and 1099 management. Access their services directly from the Command Center for all back-office needs.</p><p className="mt-2 text-violet-300 text-xs">Find it: Command Center &gt; Business & Franchise &gt; Orbit Payroll & HR</p></>),
          es: (<><p><B>Orbit Staffing</B> es nuestro socio para nóminas, recursos humanos, contabilidad y gestión de 1099. Accede a sus servicios directamente desde el Centro de Comando para todas las necesidades de back-office.</p><p className="mt-2 text-violet-300 text-xs">Encuéntralo: Centro de Comando &gt; Negocios y Franquicias &gt; Nóminas y RH Orbit</p></>),
        },
      },
    ],
  },
  {
    id: "additional-features",
    title: { en: "Additional Platform Features", es: "Características Adicionales de la Plataforma" },
    icon: <Zap className="size-5" />,
    gradient: "from-yellow-500 to-orange-500",
    items: [
      {
        title: { en: "Happy Eats Kitchen", es: "Cocina Happy Eats" },
        content: {
          en: (<><p>The <B>Happy Eats Kitchen</B> is our mobile commissary concept — pre-made meals available for quick ordering. Customer-facing menu and admin management interface.</p><p className="mt-2 text-yellow-300 text-xs">Find it: Command Center &gt; Operations &gt; Kitchen Menu / Kitchen Manager</p><div className="flex gap-2 flex-wrap"><GoTo href="/kitchen">Kitchen Menu</GoTo><GoTo href="/kitchen/manage">Kitchen Manager</GoTo></div></>),
          es: (<><p>La <B>Cocina Happy Eats</B> es nuestro concepto de comisaría móvil — comidas preparadas disponibles para pedidos rápidos. Menú para clientes e interfaz de gestión administrativa.</p><p className="mt-2 text-yellow-300 text-xs">Encuéntralo: Centro de Comando &gt; Operaciones &gt; Menú de Cocina / Gestor de Cocina</p></>),
        },
      },
      {
        title: { en: "GPS Finder, Weather & Concierge", es: "Buscador GPS, Clima y Conserjería" },
        content: {
          en: (<><p>Find nearby truck stops and services with the <B>GPS Finder</B>. Check real-time <B>weather</B> and road conditions. Access <B>Concierge</B> driver support services.</p><p className="mt-2 text-yellow-300 text-xs">Find it: Command Center &gt; Operations</p><div className="flex gap-2 flex-wrap"><GoTo href="/gps">GPS Finder</GoTo><GoTo href="/weather">Weather</GoTo><GoTo href="/concierge">Concierge</GoTo></div></>),
          es: (<><p>Encuentra paradas de camiones y servicios cercanos con el <B>Buscador GPS</B>. Consulta el <B>clima</B> en tiempo real y condiciones de carreteras. Accede a servicios de soporte de <B>Conserjería</B> para conductores.</p><p className="mt-2 text-yellow-300 text-xs">Encuéntralo: Centro de Comando &gt; Operaciones</p></>),
        },
      },
      {
        title: { en: "CDL Directory, Explore Hub & Roadmap", es: "Directorio CDL, Hub de Exploración y Hoja de Ruta" },
        content: {
          en: (<><p>Browse <B>CDL training programs</B>, explore all platform features in the <B>Explore Hub</B>, and view the <B>Product Roadmap</B> for planned features and improvements.</p><p className="mt-2 text-yellow-300 text-xs">Find it: Command Center &gt; Account & Team</p></>),
          es: (<><p>Explora <B>programas de capacitación CDL</B>, descubre todas las funciones de la plataforma en el <B>Hub de Exploración</B> y consulta la <B>Hoja de Ruta</B> para funciones planificadas y mejoras.</p><p className="mt-2 text-yellow-300 text-xs">Encuéntralo: Centro de Comando &gt; Cuenta y Equipo</p></>),
        },
      },
    ],
  },
  {
    id: "contact",
    title: { en: "Contact Information & Support", es: "Información de Contacto y Soporte" },
    icon: <Phone className="size-5" />,
    gradient: "from-rose-500 to-red-500",
    items: [
      {
        title: { en: "How to Get Help", es: "Cómo Obtener Ayuda" },
        content: {
          en: (<><p>There are several ways to get support:</p><div className="mt-2 space-y-2"><div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><p className="text-emerald-300 font-semibold text-xs flex items-center gap-1.5"><MessageSquare className="size-3" /> Signal Chat — #vendor-support</p><p className="text-[11px] mt-1">The fastest way to reach us. Join Signal Chat and post in the #vendor-support channel.</p></div><div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20"><p className="text-sky-300 font-semibold text-xs flex items-center gap-1.5"><Mail className="size-3" /> Email</p><p className="text-[11px] mt-1">Send us an email and we'll get back to you as soon as possible.</p></div><div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"><p className="text-orange-300 font-semibold text-xs flex items-center gap-1.5"><Phone className="size-3" /> Phone</p><p className="text-[11px] mt-1">For urgent matters, give us a call during business hours.</p></div></div></>),
          es: (<><p>Hay varias formas de obtener soporte:</p><div className="mt-2 space-y-2"><div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><p className="text-emerald-300 font-semibold text-xs flex items-center gap-1.5"><MessageSquare className="size-3" /> Signal Chat — #vendor-support</p><p className="text-[11px] mt-1">La forma más rápida de contactarnos. Únete a Signal Chat y publica en el canal #vendor-support.</p></div><div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20"><p className="text-sky-300 font-semibold text-xs flex items-center gap-1.5"><Mail className="size-3" /> Email</p><p className="text-[11px] mt-1">Envíanos un email y te responderemos lo antes posible.</p></div><div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"><p className="text-orange-300 font-semibold text-xs flex items-center gap-1.5"><Phone className="size-3" /> Teléfono</p><p className="text-[11px] mt-1">Para asuntos urgentes, llámanos durante el horario de atención.</p></div></div></>),
        },
      },
      {
        title: { en: "Operations Team Contacts", es: "Contactos del Equipo de Operaciones" },
        content: {
          en: (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300 font-bold text-xs">KG</div>
                  <div>
                    <p className="text-sm font-bold text-white">Kathy Grater</p>
                    <p className="text-[10px] text-white/30">Happy Eats Operations</p>
                  </div>
                </div>
                <div className="space-y-1 ml-10">
                  <a href="mailto:happyeats.app@gmail.com" className="flex items-center gap-2 text-xs text-sky-300 hover:text-sky-200 transition-colors" data-testid="link-email-kathy"><Mail className="size-3" />happyeats.app@gmail.com</a>
                  <a href="tel:+16154861497" className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors" data-testid="link-phone-kathy"><Phone className="size-3" />(615) 486-1497</a>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 font-bold text-xs">JA</div>
                  <div>
                    <p className="text-sm font-bold text-white">Jason Andrews</p>
                    <p className="text-[10px] text-white/30">Platform & Technology</p>
                  </div>
                </div>
                <div className="space-y-1 ml-10">
                  <a href="mailto:team@dwtl.io" className="flex items-center gap-2 text-xs text-sky-300 hover:text-sky-200 transition-colors" data-testid="link-email-jason"><Mail className="size-3" />team@dwtl.io</a>
                  <a href="tel:+16156012952" className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors" data-testid="link-phone-jason"><Phone className="size-3" />(615) 601-2952</a>
                </div>
              </div>
              <p className="text-[11px] text-white/30 italic">These email addresses can also be used for customer service inquiries.</p>
            </div>
          ),
          es: (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300 font-bold text-xs">KG</div>
                  <div>
                    <p className="text-sm font-bold text-white">Kathy Grater</p>
                    <p className="text-[10px] text-white/30">Operaciones Happy Eats</p>
                  </div>
                </div>
                <div className="space-y-1 ml-10">
                  <a href="mailto:happyeats.app@gmail.com" className="flex items-center gap-2 text-xs text-sky-300 hover:text-sky-200 transition-colors"><Mail className="size-3" />happyeats.app@gmail.com</a>
                  <a href="tel:+16154861497" className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors"><Phone className="size-3" />(615) 486-1497</a>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 font-bold text-xs">JA</div>
                  <div>
                    <p className="text-sm font-bold text-white">Jason Andrews</p>
                    <p className="text-[10px] text-white/30">Plataforma y Tecnología</p>
                  </div>
                </div>
                <div className="space-y-1 ml-10">
                  <a href="mailto:team@dwtl.io" className="flex items-center gap-2 text-xs text-sky-300 hover:text-sky-200 transition-colors"><Mail className="size-3" />team@dwtl.io</a>
                  <a href="tel:+16156012952" className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors"><Phone className="size-3" />(615) 601-2952</a>
                </div>
              </div>
              <p className="text-[11px] text-white/30 italic">Estas direcciones de email también pueden usarse para consultas de servicio al cliente.</p>
            </div>
          ),
        },
      },
      {
        title: { en: "Business Hours", es: "Horario de Atención" },
        content: {
          en: (<><p>Our food truck hub operates during standard meal service hours. Batch order cutoff times:</p><div className="mt-2 space-y-1.5"><div className="flex items-center gap-2"><Clock className="size-3.5 text-orange-400" /><span><B>Lunch orders:</B> Must be placed by 10:30 AM</span></div><div className="flex items-center gap-2"><Clock className="size-3.5 text-sky-400" /><span><B>Dinner orders:</B> Must be placed by 5:00 PM</span></div></div><p className="mt-2">One-off orders are available during regular operating hours for local corridor customers.</p></>),
          es: (<><p>Nuestro centro de food trucks opera durante las horas estándar de servicio de comidas. Horarios límite para pedidos por lotes:</p><div className="mt-2 space-y-1.5"><div className="flex items-center gap-2"><Clock className="size-3.5 text-orange-400" /><span><B>Pedidos de almuerzo:</B> Deben hacerse antes de las 10:30 AM</span></div><div className="flex items-center gap-2"><Clock className="size-3.5 text-sky-400" /><span><B>Pedidos de cena:</B> Deben hacerse antes de las 5:00 PM</span></div></div><p className="mt-2">Los pedidos individuales están disponibles durante el horario regular de operación para clientes del corredor local.</p></>),
        },
      },
    ],
  },
];

export default function OperationsManual() {
  const { lang, setLang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const autoOpenSection = urlParams.get("section");

  useEffect(() => {
    if (autoOpenSection) {
      setTimeout(() => {
        const el = document.getElementById(autoOpenSection);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [autoOpenSection]);

  const filteredSections = searchQuery.trim()
    ? SECTIONS.filter(s =>
        s.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.items.some(item => item.title[lang].toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : SECTIONS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16]">
      <div className="sticky top-0 z-50 bg-[#070b16]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/command-center">
              <button className="size-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all" data-testid="button-back">
                <ArrowLeft className="size-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">{T.pageTitle[lang]}</h1>
              <p className="text-[10px] text-white/30">{T.pageSubtitle[lang]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] text-xs text-white/60 hover:text-white transition-all"
              data-testid="button-toggle-language"
            >
              <Languages className="size-3.5" />
              {lang === "en" ? "ES" : "EN"}
            </button>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] hidden sm:flex">
              <BookOpen className="size-3 mr-1" />
              {T.azGuide[lang]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 space-y-5">
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
          <img src={manualHero} alt="" className="w-full h-36 sm:h-48 object-cover brightness-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-[#070b16]/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{T.heroTitle[lang]}</h2>
            <p className="text-xs sm:text-sm text-white/50">{T.heroDesc[lang]}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <input
            type="text"
            placeholder={T.searchPlaceholder[lang]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/30 transition-colors"
            data-testid="input-search-manual"
          />
        </div>

        <Card className={`${GLASS} border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5`}>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="size-4 text-orange-400" />
              {T.quickNav[lang]}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {SECTIONS.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] transition-all group"
                  data-testid={`nav-${s.id}`}
                >
                  <div className={`size-7 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform`}>
                    {s.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-white/80 truncate">{s.title[lang]}</p>
                    <p className="text-[9px] text-white/25">{s.items.length} {T.topics[lang]}</p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {filteredSections.map(section => (
            <SectionBlock key={section.id} section={section} lang={lang} defaultExpanded={section.id === autoOpenSection} />
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="size-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">{T.noResults[lang]} "{searchQuery}"</p>
            <button onClick={() => setSearchQuery("")} className="text-xs text-orange-400 mt-2 hover:underline">{T.clearSearch[lang]}</button>
          </div>
        )}

        <Card className={`${GLASS} border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5`}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="size-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">{T.needHelp[lang]}</p>
              <p className="text-xs text-white/50 mb-2">{T.needHelpDesc[lang]}</p>
              <Link href="/signal-chat">
                <Button size="sm" className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs h-8" data-testid="button-open-signal-chat">
                  <MessageSquare className="size-3 mr-1.5" />
                  {T.openSignalChat[lang]}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
