import { Link } from "wouter";
import { ArrowLeft, MessageSquare, Shield, Phone, Clock, XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/i18n/context";

const GLASS = "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]";

export default function SMSConsent() {
  const { lang, setLang } = useLanguage();
  const isEs = lang === "es";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16]">
      <div className="sticky top-0 z-50 bg-[#070b16]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="size-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all" data-testid="button-back">
                <ArrowLeft className="size-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">
                {isEs ? "Consentimiento de SMS" : "SMS Consent"}
              </h1>
              <p className="text-[10px] text-white/30">
                {isEs ? "Términos de mensajes de texto" : "Text Messaging Terms"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLang(isEs ? "en" : "es")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] text-xs text-white/60 hover:text-white transition-all"
            data-testid="button-toggle-language"
          >
            {isEs ? "EN" : "ES"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 space-y-5">
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-orange-500/10 to-rose-500/5 p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <MessageSquare className="size-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {isEs ? "Política de Consentimiento de SMS" : "SMS Consent Policy"}
              </h2>
              <p className="text-sm text-white/40">Happy Eats / TL Driver Connect</p>
            </div>
          </div>
          <p className="text-sm text-white/50">
            {isEs
              ? "Este documento describe los términos y condiciones para recibir mensajes de texto (SMS/MMS) de Happy Eats y TL Driver Connect. Al proporcionar tu número de teléfono y optar por recibir mensajes, aceptas estos términos."
              : "This document outlines the terms and conditions for receiving text messages (SMS/MMS) from Happy Eats and TL Driver Connect. By providing your phone number and opting in to receive messages, you agree to these terms."}
          </p>
          <p className="text-xs text-white/30 mt-3">
            {isEs ? "Última actualización: 15 de febrero de 2026" : "Last updated: February 15, 2026"}
          </p>
        </div>

        <Card className={`${GLASS} border-emerald-500/20`}>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                {isEs ? "1. Consentimiento y Opt-In" : "1. Consent & Opt-In"}
              </h3>
            </div>
            <div className="text-sm text-white/60 leading-relaxed space-y-3">
              <p>
                {isEs
                  ? "Al registrarte en Happy Eats o TL Driver Connect y proporcionar tu número de teléfono móvil, das tu consentimiento expreso para recibir mensajes de texto (SMS y MMS) de nuestra parte. El consentimiento no es una condición de compra."
                  : "By signing up for Happy Eats or TL Driver Connect and providing your mobile phone number, you are giving your express consent to receive text messages (SMS and MMS) from us. Consent is not a condition of purchase."}
              </p>
              <p>
                {isEs
                  ? "Puedes dar tu consentimiento de las siguientes maneras:"
                  : "You may provide consent in the following ways:"}
              </p>
              <ul className="list-disc list-inside space-y-1 text-white/50">
                <li>{isEs ? "Ingresando tu número de teléfono durante el registro de cuenta" : "Entering your phone number during account registration"}</li>
                <li>{isEs ? "Proporcionando tu número al hacer un pedido" : "Providing your number when placing an order"}</li>
                <li>{isEs ? "Registrándote como vendedor a través del Portal de Vendedores" : "Signing up as a vendor through the Vendor Portal"}</li>
                <li>{isEs ? 'Enviando un mensaje de texto con la palabra "START" o "SUBSCRIBE" a nuestro número' : 'Texting the keyword "START" or "SUBSCRIBE" to our number'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className={`${GLASS} border-blue-500/20`}>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">
                {isEs ? "2. Tipos de Mensajes" : "2. Types of Messages"}
              </h3>
            </div>
            <div className="text-sm text-white/60 leading-relaxed space-y-3">
              <p>
                {isEs
                  ? "Puedes recibir los siguientes tipos de mensajes de texto:"
                  : "You may receive the following types of text messages:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: isEs ? "Confirmaciones de pedidos" : "Order confirmations", icon: "📋" },
                  { label: isEs ? "Actualizaciones de estado de pedidos" : "Order status updates", icon: "📦" },
                  { label: isEs ? "Notificaciones de entrega" : "Delivery notifications", icon: "🚚" },
                  { label: isEs ? "Alertas de nuevos pedidos para vendedores" : "New order alerts for vendors", icon: "🔔" },
                  { label: isEs ? "Recordatorios de check-in diario" : "Daily check-in reminders", icon: "⏰" },
                  { label: isEs ? "Verificación de cuenta y seguridad" : "Account verification & security", icon: "🔐" },
                  { label: isEs ? "Actualizaciones del sistema y mantenimiento" : "System updates & maintenance", icon: "⚙️" },
                  { label: isEs ? "Ofertas promocionales (si se opta)" : "Promotional offers (if opted in)", icon: "🎉" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs text-white/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${GLASS} border-amber-500/20`}>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                {isEs ? "3. Frecuencia de Mensajes" : "3. Message Frequency"}
              </h3>
            </div>
            <div className="text-sm text-white/60 leading-relaxed space-y-3">
              <p>
                {isEs
                  ? "La frecuencia de mensajes varía según tu actividad y configuración:"
                  : "Message frequency varies based on your activity and settings:"}
              </p>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="text-orange-300 font-semibold text-xs">{isEs ? "Clientes" : "Customers"}</p>
                  <p className="text-[11px] text-white/50 mt-1">
                    {isEs
                      ? "Típicamente 2-5 mensajes por pedido (confirmación, actualizaciones, entrega). Pueden variar según la actividad de pedidos."
                      : "Typically 2-5 messages per order (confirmation, updates, delivery). May vary based on ordering activity."}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-300 font-semibold text-xs">{isEs ? "Vendedores" : "Vendors"}</p>
                  <p className="text-[11px] text-white/50 mt-1">
                    {isEs
                      ? "Alertas de nuevos pedidos en tiempo real, recordatorios diarios de check-in y actualizaciones del sistema. Pueden ser varios mensajes por día durante horas de operación."
                      : "Real-time new order alerts, daily check-in reminders, and system updates. May be several messages per day during operating hours."}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <p className="text-sky-300 font-semibold text-xs">{isEs ? "Conductores" : "Drivers"}</p>
                  <p className="text-[11px] text-white/50 mt-1">
                    {isEs
                      ? "Asignaciones de recogida por lotes, actualizaciones de ruta y notificaciones de finalización de entrega."
                      : "Batch pickup assignments, route updates, and delivery completion notifications."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${GLASS} border-red-500/20`}>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="size-5 text-red-400" />
              <h3 className="text-base font-bold text-white">
                {isEs ? "4. Cómo Cancelar (Opt-Out)" : "4. How to Opt Out"}
              </h3>
            </div>
            <div className="text-sm text-white/60 leading-relaxed space-y-3">
              <p>
                {isEs
                  ? "Puedes dejar de recibir mensajes de texto en cualquier momento. Para cancelar:"
                  : "You can stop receiving text messages at any time. To opt out:"}
              </p>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-lg font-bold text-red-300">
                  {isEs ? 'Responde "STOP" a cualquier mensaje' : 'Reply "STOP" to any message'}
                </p>
                <p className="text-xs text-white/40 mt-2">
                  {isEs
                    ? "Recibirás un mensaje de confirmación y no se enviarán más mensajes a menos que vuelvas a optar."
                    : "You will receive a confirmation message and no further messages will be sent unless you re-opt in."}
                </p>
              </div>
              <p className="text-white/50">
                {isEs
                  ? "También puedes cancelar enviando un email a happyeats.app@gmail.com o llamando al (615) 486-1497 y solicitando ser eliminado de las comunicaciones por SMS."
                  : "You can also opt out by emailing happyeats.app@gmail.com or calling (615) 486-1497 and requesting removal from SMS communications."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${GLASS} border-violet-500/20`}>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-violet-400" />
              <h3 className="text-base font-bold text-white">
                {isEs ? "5. Tarifas de Mensajes y Datos" : "5. Message & Data Rates"}
              </h3>
            </div>
            <div className="text-sm text-white/60 leading-relaxed space-y-3">
              <p className="font-semibold text-white/70">
                {isEs
                  ? "Pueden aplicarse tarifas estándar de mensajes y datos."
                  : "Standard message and data rates may apply."}
              </p>
              <p>
                {isEs
                  ? "Las tarifas de mensajes de texto dependen de tu operador móvil y plan de servicio. Happy Eats y TL Driver Connect no cobran por enviar mensajes de texto, pero tu proveedor de servicio móvil puede cobrar tarifas de mensajes y/o datos según tu plan."
                  : "Text message charges depend on your mobile carrier and service plan. Happy Eats and TL Driver Connect do not charge for sending text messages, but your mobile service provider may charge message and/or data fees based on your plan."}
              </p>
              <p>
                {isEs
                  ? "Para obtener información sobre tarifas, consulta a tu proveedor de servicios móviles."
                  : "For rate information, please contact your mobile service provider."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${GLASS} border-sky-500/20`}>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="size-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">
                {isEs ? "6. Ayuda y Soporte" : "6. Help & Support"}
              </h3>
            </div>
            <div className="text-sm text-white/60 leading-relaxed space-y-3">
              <p>
                {isEs
                  ? "Si necesitas ayuda con nuestro programa de mensajes de texto:"
                  : "If you need help with our text messaging program:"}
              </p>
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
                <p className="text-lg font-bold text-sky-300">
                  {isEs ? 'Responde "HELP" a cualquier mensaje' : 'Reply "HELP" to any message'}
                </p>
              </div>
              <p>{isEs ? "O contáctanos directamente:" : "Or contact us directly:"}</p>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20">
                  <p className="text-sm font-bold text-white">Kathy Grater</p>
                  <p className="text-[10px] text-white/30 mb-1">{isEs ? "Operaciones Happy Eats" : "Happy Eats Operations"}</p>
                  <div className="space-y-1">
                    <a href="mailto:happyeats.app@gmail.com" className="flex items-center gap-2 text-xs text-sky-300 hover:text-sky-200" data-testid="link-email-kathy">
                      <span>happyeats.app@gmail.com</span>
                    </a>
                    <a href="tel:+16154861497" className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200" data-testid="link-phone-kathy">
                      <span>(615) 486-1497</span>
                    </a>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/20">
                  <p className="text-sm font-bold text-white">Jason Andrews</p>
                  <p className="text-[10px] text-white/30 mb-1">{isEs ? "Plataforma y Tecnología" : "Platform & Technology"}</p>
                  <div className="space-y-1">
                    <a href="mailto:team@dwtl.io" className="flex items-center gap-2 text-xs text-sky-300 hover:text-sky-200" data-testid="link-email-jason">
                      <span>team@dwtl.io</span>
                    </a>
                    <a href="tel:+16156012952" className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200" data-testid="link-phone-jason">
                      <span>(615) 601-2952</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${GLASS} border-white/10`}>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-white/60" />
              <h3 className="text-base font-bold text-white">
                {isEs ? "7. Privacidad y Protección de Datos" : "7. Privacy & Data Protection"}
              </h3>
            </div>
            <div className="text-sm text-white/60 leading-relaxed space-y-3">
              <p>
                {isEs
                  ? "Tu número de teléfono y la información asociada se manejarán de acuerdo con nuestra Política de Privacidad. No venderemos, alquilaremos ni compartiremos tu número de teléfono móvil con terceros para fines de marketing sin tu consentimiento."
                  : "Your phone number and associated information will be handled in accordance with our Privacy Policy. We will not sell, rent, or share your mobile phone number with third parties for marketing purposes without your consent."}
              </p>
              <p>
                {isEs
                  ? "Para más detalles sobre cómo manejamos tu información personal, consulta nuestra"
                  : "For more details about how we handle your personal information, please see our"}{" "}
                <Link href="/privacy" className="text-orange-400 hover:text-orange-300 underline" data-testid="link-privacy-policy">
                  {isEs ? "Política de Privacidad" : "Privacy Policy"}
                </Link>{" "}
                {isEs ? "y" : "and"}{" "}
                <Link href="/terms" className="text-orange-400 hover:text-orange-300 underline" data-testid="link-terms">
                  {isEs ? "Términos de Servicio" : "Terms of Service"}
                </Link>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${GLASS} border-orange-500/20`}>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-orange-400" />
              <h3 className="text-base font-bold text-white">
                {isEs ? "8. Operadores Compatibles" : "8. Supported Carriers"}
              </h3>
            </div>
            <div className="text-sm text-white/60 leading-relaxed space-y-3">
              <p>
                {isEs
                  ? "Nuestro servicio de mensajería de texto es compatible con los principales operadores de EE.UU., incluyendo pero no limitado a:"
                  : "Our text messaging service is compatible with major U.S. carriers including but not limited to:"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["AT&T", "Verizon", "T-Mobile", "Sprint", "US Cellular", "Cricket", "Metro PCS", "Boost Mobile", "Virgin Mobile", "Mint Mobile"].map((carrier) => (
                  <Badge key={carrier} variant="outline" className="text-[10px] border-white/10 text-white/50">{carrier}</Badge>
                ))}
              </div>
              <p className="text-[11px] text-white/30">
                {isEs
                  ? "T-Mobile no es responsable de los mensajes retrasados o no entregados."
                  : "T-Mobile is not liable for delayed or undelivered messages."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-white/5" />

        <div className="text-center space-y-3 py-4">
          <p className="text-sm text-white/40">
            {isEs
              ? "Al utilizar los servicios de Happy Eats o TL Driver Connect y proporcionar tu número de teléfono, reconoces que has leído, entendido y aceptado esta Política de Consentimiento de SMS."
              : "By using Happy Eats or TL Driver Connect services and providing your phone number, you acknowledge that you have read, understood, and agreed to this SMS Consent Policy."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="border-white/10 text-white/50 text-xs" data-testid="button-privacy">
                {isEs ? "Política de Privacidad" : "Privacy Policy"}
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline" size="sm" className="border-white/10 text-white/50 text-xs" data-testid="button-terms">
                {isEs ? "Términos de Servicio" : "Terms of Service"}
              </Button>
            </Link>
          </div>
          <p className="text-[11px] text-white/20">
            &copy; 2026 Happy Eats / TL Driver Connect. {isEs ? "Todos los derechos reservados." : "All rights reserved."}
          </p>
        </div>
      </div>
    </div>
  );
}
