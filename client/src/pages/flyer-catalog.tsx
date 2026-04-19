import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, Printer, Globe2, ChevronDown, ChevronUp, Sparkles, Save, FolderOpen, Trash2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import flyer1Img from "@/assets/images/flyers/flyer1-your-kitchen.png";
import flyer2Img from "@/assets/images/flyers/flyer2-free-tools.png";
import flyer3Img from "@/assets/images/flyers/flyer3-three-steps.png";

type Lang = "en" | "es";

interface FlyerTemplate {
  id: string;
  title: { en: string; es: string };
  image: string;
  category: string;
}

const FLYER_TEMPLATES: FlyerTemplate[] = [
  { id: "order-here", title: { en: "Order Food Right Here", es: "Ordena Comida Aquí Mismo" }, image: flyer1Img, category: "Customer Ordering" },
  { id: "storefront", title: { en: "We Deliver From This Location", es: "Entregamos Desde Esta Ubicación" }, image: flyer2Img, category: "Customer Ordering" },
  { id: "your-kitchen", title: { en: "Your Kitchen. Your Rules.", es: "Tu Cocina. Tus Reglas." }, image: flyer1Img, category: "Vendor Recruitment" },
  { id: "free-tools", title: { en: "Free Tools for Vendors", es: "Herramientas Gratis" }, image: flyer2Img, category: "Vendor Recruitment" },
  { id: "three-steps", title: { en: "3 Steps to Start Selling", es: "3 Pasos Para Vender" }, image: flyer3Img, category: "Vendor Recruitment" },
];

function FlyerYourKitchen({ lang }: { lang: Lang }) {
  const en = lang === "en";
  return (
    <div style={{ width: 816, minHeight: 1056, background: "#0f172a", fontFamily: "'Georgia', serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,120,73,0.1) 0%, transparent 40%)" }} />
      <div style={{ position: "relative", padding: "0" }}>
        <div style={{ width: "100%", height: 420, overflow: "hidden", position: "relative" }}>
          <img src={flyer1Img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(transparent, #0f172a)" }} />
        </div>

        <div style={{ padding: "24px 48px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>
              <span style={{ color: "#FF7849", display: "block" }}>
                {en ? "Your Kitchen." : "Tu Cocina."}
              </span>
              <span style={{ color: "#fff", display: "block" }}>
                {en ? "Your Rules." : "Tus Reglas."}
              </span>
              <span style={{ color: "#FF7849", display: "block", fontSize: 28, marginTop: 4 }}>
                {en ? "Our Platform." : "Nuestra Plataforma."}
              </span>
            </h1>
            <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 12, fontStyle: "italic" }}>
              {en ? "Join Happy Eats — Nashville's Food Truck Marketplace" : "Únete a Happy Eats — El Mercado de Food Trucks de Nashville"}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {(en ? [
              { icon: "✓", text: "FREE to sign up — only 20% per order" },
              { icon: "✓", text: "No monthly fees. No contracts." },
              { icon: "✓", text: "Free marketing tools: flyers, business cards, QR codes" },
              { icon: "✓", text: "AI-powered flyer creator & receipt scanner" },
            ] : [
              { icon: "✓", text: "Registro GRATIS — solo 20% por pedido" },
              { icon: "✓", text: "Sin cuotas mensuales. Sin contratos." },
              { icon: "✓", text: "Herramientas gratis: folletos, tarjetas, códigos QR" },
              { icon: "✓", text: "Creador de folletos con IA y escáner de recibos" },
            ]).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#FF7849", fontSize: 20, fontWeight: 900, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,120,73,0.1)", border: "1px solid rgba(255,120,73,0.3)", borderRadius: 12, padding: "16px 24px", marginBottom: 20, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, marginBottom: 4 }}>
              {en ? "Premium Add-Ons Available:" : "Complementos Premium Disponibles:"}
            </p>
            <p style={{ fontSize: 14, color: "#e2e8f0", margin: 0 }}>
              <strong style={{ color: "#FF7849" }}>TrustVault Media Studio</strong> {en ? "— Full photo, video & audio editors" : "— Editores completos de foto, video y audio"} ($15/{en ? "mo" : "mes"})
            </p>
            <p style={{ fontSize: 14, color: "#e2e8f0", margin: 0, marginTop: 4 }}>
              <strong style={{ color: "#FF7849" }}>SignalCast</strong> {en ? "— Automated social media posting" : "— Publicación automática en redes sociales"} ({en ? "Coming Soon" : "Próximamente"})
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "16px 24px", marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#FF7849", margin: 0, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              {en ? "How to Get Started:" : "Cómo Empezar:"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(en ? [
                "Visit happyeats.app/vendor-portal",
                "Upload your menu & health dept. certification",
                "Receive your vendor certification number",
                "Start receiving orders!",
              ] : [
                "Visita happyeats.app/vendor-portal",
                "Sube tu menú y certificación del depto. de salud",
                "Recibe tu número de certificación de vendedor",
                "¡Empieza a recibir pedidos!",
              ]).map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#FF7849", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 14, color: "#e2e8f0" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#FF7849", margin: 0, letterSpacing: 1 }}>
              happyeats.app/vendor-portal
            </p>
            <p style={{ fontSize: 18, color: "#94a3b8", margin: "8px 0 0", fontWeight: 600 }}>
              {en ? "Launching April 6, 2026" : "Lanzamiento 6 de Abril, 2026"}
            </p>
            <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
              Nashville • Lebanon • Mt. Juliet • Wilson County
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlyerFreeTools({ lang }: { lang: Lang }) {
  const en = lang === "en";
  return (
    <div style={{ width: 816, minHeight: 1056, background: "#0f172a", fontFamily: "'Georgia', serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,120,73,0.08) 0%, transparent 50%)" }} />
      <div style={{ position: "relative", padding: "0" }}>
        <div style={{ width: "100%", height: 380, overflow: "hidden", position: "relative" }}>
          <img src={flyer2Img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(transparent, #0f172a)" }} />
        </div>

        <div style={{ padding: "24px 48px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.15, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>
              <span style={{ color: "#fff", display: "block" }}>
                {en ? "Free Tools" : "Herramientas Gratis"}
              </span>
              <span style={{ color: "#FF7849", display: "block", fontSize: 24, marginTop: 4 }}>
                {en ? "That Big Chains Pay Thousands For" : "Que Las Grandes Cadenas Pagan Miles"}
              </span>
            </h1>
            <p style={{ fontSize: 15, color: "#94a3b8", marginTop: 10, fontStyle: "italic" }}>
              {en ? "Happy Eats gives food truck vendors a full marketing studio — free." : "Happy Eats les da a los vendedores de food trucks un estudio de marketing completo — gratis."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {(en ? [
              { label: "AI Flyer Creator", desc: "Design professional flyers in seconds" },
              { label: "Business Card Designer", desc: "Custom cards for your brand" },
              { label: "Social Media Templates", desc: "Ready-to-post designs" },
              { label: "Receipt Scanner", desc: "Built-in OCR — scan receipts free" },
              { label: "QR Code Generator", desc: "Link customers to your menu" },
              { label: "Menu Management", desc: "Upload items, set prices & availability" },
            ] : [
              { label: "Creador de Folletos IA", desc: "Diseña folletos profesionales en segundos" },
              { label: "Diseñador de Tarjetas", desc: "Tarjetas personalizadas para tu marca" },
              { label: "Plantillas para Redes", desc: "Diseños listos para publicar" },
              { label: "Escáner de Recibos", desc: "OCR integrado — escanea recibos gratis" },
              { label: "Generador de Códigos QR", desc: "Conecta clientes con tu menú" },
              { label: "Gestión de Menú", desc: "Sube productos, precios y disponibilidad" },
            ]).map((tool, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#FF7849", margin: 0, marginBottom: 3 }}>{tool.label}</p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.3 }}>{tool.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,120,73,0.1)", border: "1px solid rgba(255,120,73,0.25)", borderRadius: 12, padding: "14px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#FF7849", margin: 0, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              {en ? "Premium Add-Ons:" : "Complementos Premium:"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontSize: 13, color: "#e2e8f0", margin: 0 }}>
                <strong>TrustVault Media Studio</strong> — {en ? "Photo, video & audio editors" : "Editores de foto, video y audio"} <span style={{ color: "#FF7849" }}>($15/{en ? "mo" : "mes"})</span>
              </p>
              <p style={{ fontSize: 13, color: "#e2e8f0", margin: 0 }}>
                <strong>SignalCast</strong> — {en ? "Automated social media posting" : "Publicación automática en redes"} <span style={{ color: "#94a3b8", fontStyle: "italic" }}>({en ? "Coming Soon" : "Próximamente"})</span>
              </p>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 20px", marginBottom: 20 }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, textAlign: "center" }}>
              {en ? "Only " : "Solo "}<span style={{ color: "#FF7849" }}>20%</span>{en ? " per order" : " por pedido"}
            </p>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "4px 0 0", textAlign: "center" }}>
              {en ? "No subscriptions required to sell. No monthly fees. No contracts." : "Sin suscripciones para vender. Sin cuotas mensuales. Sin contratos."}
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, marginBottom: 4 }}>
              {en ? "Sign up in 5 minutes:" : "Regístrate en 5 minutos:"}
            </p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#FF7849", margin: 0, letterSpacing: 1 }}>
              happyeats.app/vendor-portal
            </p>
            <p style={{ fontSize: 18, color: "#94a3b8", margin: "8px 0 0", fontWeight: 600 }}>
              {en ? "Launching April 6, 2026" : "Lanzamiento 6 de Abril, 2026"}
            </p>
            <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
              Nashville • Lebanon • Mt. Juliet • Wilson County
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlyerThreeSteps({ lang }: { lang: Lang }) {
  const en = lang === "en";
  return (
    <div style={{ width: 816, minHeight: 1056, background: "#0f172a", fontFamily: "'Georgia', serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,120,73,0.08) 0%, transparent 40%)" }} />
      <div style={{ position: "relative", padding: "0" }}>
        <div style={{ width: "100%", height: 380, overflow: "hidden", position: "relative" }}>
          <img src={flyer3Img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(transparent, #0f172a)" }} />
        </div>

        <div style={{ padding: "24px 48px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>
              <span style={{ color: "#FF7849", display: "block" }}>
                {en ? "3 Steps" : "3 Pasos"}
              </span>
              <span style={{ color: "#fff", display: "block", fontSize: 28, marginTop: 4 }}>
                {en ? "to Start Selling on Happy Eats" : "Para Empezar a Vender en Happy Eats"}
              </span>
            </h1>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
            {(en ? [
              { step: "1", title: "Sign Up Free", desc: "Visit happyeats.app/vendor-portal and create your account. It takes less than 5 minutes — no fees, no contracts." },
              { step: "2", title: "Upload Your Menu & Health Cert", desc: "Add your menu items with photos, prices, and customizations. Upload your health department certification to verify your food truck." },
              { step: "3", title: "Get Your Vendor Number & Go Live", desc: "Once verified, you'll receive your Happy Eats vendor certification number. Start receiving orders from customers in your area!" },
            ] : [
              { step: "1", title: "Regístrate Gratis", desc: "Visita happyeats.app/vendor-portal y crea tu cuenta. Toma menos de 5 minutos — sin cargos, sin contratos." },
              { step: "2", title: "Sube Tu Menú y Certificación", desc: "Agrega tus productos con fotos, precios y personalizaciones. Sube tu certificación del departamento de salud para verificar tu food truck." },
              { step: "3", title: "Recibe Tu Número y Empieza", desc: "Una vez verificado, recibirás tu número de certificación Happy Eats. ¡Comienza a recibir pedidos de clientes en tu zona!" },
            ]).map((item) => (
              <div key={item.step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #FF7849, #FF5722)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, flexShrink: 0, boxShadow: "0 4px 16px rgba(255,120,73,0.3)" }}>
                  {item.step}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#FF7849", margin: 0, marginBottom: 4 }}>{item.title}</p>
                  <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,120,73,0.1)", border: "1px solid rgba(255,120,73,0.25)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>
              {en ? "Only " : "Solo "}<span style={{ color: "#FF7849" }}>20%</span>{en ? " per order. No monthly fees. No contracts." : " por pedido. Sin cuotas mensuales. Sin contratos."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {(en ? [
              "Free marketing tools",
              "AI flyer creator",
              "Receipt scanner",
            ] : [
              "Herramientas de marketing gratis",
              "Creador de folletos IA",
              "Escáner de recibos",
            ]).map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#e2e8f0", margin: 0, fontWeight: 600 }}>{item}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#FF7849", margin: 0, letterSpacing: 1 }}>
              happyeats.app/vendor-portal
            </p>
            <p style={{ fontSize: 18, color: "#94a3b8", margin: "8px 0 0", fontWeight: 600 }}>
              {en ? "Launching April 6, 2026" : "Lanzamiento 6 de Abril, 2026"}
            </p>
            <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
              Nashville • Lebanon • Mt. Juliet • Wilson County
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlyerOrderHere({ lang }: { lang: Lang }) {
  const en = lang === "en";
  return (
    <div style={{ width: 816, minHeight: 1056, background: "#0f172a", fontFamily: "'Georgia', serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,120,73,0.15) 0%, transparent 40%, rgba(251,146,60,0.08) 100%)" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 400, height: 400, background: "radial-gradient(circle, rgba(255,120,73,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 300, height: 300, background: "radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />

      <div style={{ position: "relative", padding: "48px 48px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block", background: "linear-gradient(135deg, #FF7849, #fb923c)", borderRadius: 16, padding: "10px 28px", marginBottom: 20 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 3 }}>
              {en ? "Now Available" : "Ya Disponible"}
            </span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>
            <span style={{ color: "#fff", display: "block" }}>
              {en ? "Order Food" : "Ordena Comida"}
            </span>
            <span style={{ color: "#FF7849", display: "block" }}>
              {en ? "Right Here" : "Aquí Mismo"}
            </span>
          </h1>
          <p style={{ fontSize: 18, color: "#94a3b8", marginTop: 16, fontStyle: "italic", maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            {en ? "Fresh food from local vendors delivered to your area — fast, easy, and delicious." : "Comida fresca de vendedores locales entregada a tu zona — rápido, fácil y delicioso."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
          {(en ? [
            { step: "1", title: "Browse", desc: "Scan the QR code or visit happyeats.app to see today's menu" },
            { step: "2", title: "Order", desc: "Pick your items, customize, and check out securely with Stripe" },
            { step: "3", title: "Enjoy", desc: "Your order is prepared fresh and delivered right to your area" },
          ] : [
            { step: "1", title: "Explora", desc: "Escanea el código QR o visita happyeats.app para ver el menú de hoy" },
            { step: "2", title: "Ordena", desc: "Elige tus productos, personaliza y paga de forma segura con Stripe" },
            { step: "3", title: "Disfruta", desc: "Tu pedido se prepara fresco y se entrega directo a tu zona" },
          ]).map((item) => (
            <div key={item.step} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #FF7849, #fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, margin: "0 auto 12px", boxShadow: "0 4px 16px rgba(255,120,73,0.3)" }}>
                {item.step}
              </div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#FF7849", margin: 0, marginBottom: 6 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          {(en ? [
            { icon: "🍔", text: "Food trucks & local restaurants" },
            { icon: "⚡", text: "Fast batch delivery to your zone" },
            { icon: "💳", text: "Secure online payment" },
            { icon: "📱", text: "Track your order in real-time" },
            { icon: "🎁", text: "Earn rewards — free meal every 10 orders" },
            { icon: "👥", text: "Refer friends, get $5 credit" },
          ] : [
            { icon: "🍔", text: "Food trucks y restaurantes locales" },
            { icon: "⚡", text: "Entrega rápida por lotes a tu zona" },
            { icon: "💳", text: "Pago seguro en línea" },
            { icon: "📱", text: "Rastrea tu pedido en tiempo real" },
            { icon: "🎁", text: "Gana recompensas — comida gratis cada 10 pedidos" },
            { icon: "👥", text: "Refiere amigos, recibe $5 de crédito" },
          ]).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.3 }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg, rgba(255,120,73,0.15), rgba(251,146,60,0.1))", border: "2px solid rgba(255,120,73,0.3)", borderRadius: 16, padding: "24px 32px", marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, marginBottom: 6, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>
            {en ? "Scan to Order" : "Escanea para Ordenar"}
          </p>
          <p style={{ fontSize: 36, fontWeight: 900, color: "#FF7849", margin: 0, letterSpacing: 1 }}>
            happyeats.app
          </p>
          <p style={{ fontSize: 14, color: "#cbd5e1", margin: "8px 0 0" }}>
            {en ? "Or ask your server to place an order for you!" : "¡O pídele a tu mesero que haga un pedido por ti!"}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 20 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#FF7849", margin: 0 }}>$0</p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{en ? "Service Fee" : "Cargo de Servicio"}</p>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#FF7849", margin: 0 }}>15min</p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{en ? "Avg Delivery" : "Entrega Promedio"}</p>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#FF7849", margin: 0 }}>10th</p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{en ? "Order Free!" : "¡Pedido Gratis!"}</p>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            {en ? "Powered by" : "Desarrollado por"} <strong style={{ color: "#FF7849" }}>Happy Eats</strong> • Nashville • Lebanon • Mt. Juliet • Wilson County
          </p>
        </div>
      </div>
    </div>
  );
}

function FlyerStorefront({ lang }: { lang: Lang }) {
  const en = lang === "en";
  return (
    <div style={{ width: 816, minHeight: 1056, background: "#0f172a", fontFamily: "'Georgia', serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,182,212,0.08) 0%, transparent 30%, rgba(255,120,73,0.06) 100%)" }} />
      <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)", borderRadius: "50%" }} />

      <div style={{ position: "relative", padding: "48px 48px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", gap: 8, marginBottom: 16 }}>
            <span style={{ background: "#FF7849", color: "#fff", fontSize: 11, fontWeight: 800, padding: "6px 14px", borderRadius: 8, textTransform: "uppercase", letterSpacing: 2 }}>
              {en ? "Partner Location" : "Ubicación Asociada"}
            </span>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.08, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>
            <span style={{ color: "#fff", display: "block" }}>
              {en ? "We Deliver" : "Entregamos"}
            </span>
            <span style={{ color: "#FF7849", display: "block" }}>
              {en ? "From This Location" : "Desde Esta Ubicación"}
            </span>
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 14, fontStyle: "italic" }}>
            {en ? "Skip the line — order ahead on Happy Eats and pick up or get delivery!" : "Sáltate la fila — ordena con anticipación en Happy Eats y recoge o recibe entrega!"}
          </p>
        </div>

        <div style={{ background: "rgba(255,120,73,0.08)", border: "1px solid rgba(255,120,73,0.2)", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#FF7849", margin: 0, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>
            {en ? "Why Order Through Happy Eats?" : "¿Por Qué Ordenar a Través de Happy Eats?"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(en ? [
              { title: "Order Ahead", desc: "Place your order before you arrive — it's ready when you get here" },
              { title: "Delivery Available", desc: "Can't make it? We'll bring it to your area with batch delivery" },
              { title: "Earn Rewards", desc: "Every 10 orders earns you a free meal. Refer friends for $5 credit" },
              { title: "Easy & Secure", desc: "Browse the menu, customize your order, and pay securely online" },
            ] : [
              { title: "Ordena con Anticipación", desc: "Haz tu pedido antes de llegar — estará listo cuando llegues" },
              { title: "Entrega Disponible", desc: "¿No puedes venir? Te lo llevamos a tu zona con entrega por lotes" },
              { title: "Gana Recompensas", desc: "Cada 10 pedidos ganas una comida gratis. Refiere amigos por $5" },
              { title: "Fácil y Seguro", desc: "Explora el menú, personaliza tu pedido y paga de forma segura" },
            ]).map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#FF7849", margin: 0, marginBottom: 3 }}>{item.title}</p>
                <p style={{ fontSize: 12, color: "#cbd5e1", margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>
            {en ? "How It Works" : "Cómo Funciona"}
          </p>
          {(en ? [
            { step: "1", text: "Scan the QR code below or visit happyeats.app" },
            { step: "2", text: "Find this location's menu and add your items" },
            { step: "3", text: "Pay securely online — no cash needed" },
            { step: "4", text: "Pick up your order here or get it delivered!" },
          ] : [
            { step: "1", text: "Escanea el código QR abajo o visita happyeats.app" },
            { step: "2", text: "Encuentra el menú de esta ubicación y agrega tus productos" },
            { step: "3", text: "Paga de forma segura en línea — no necesitas efectivo" },
            { step: "4", text: "¡Recoge tu pedido aquí o recíbelo a domicilio!" },
          ]).map((item) => (
            <div key={item.step} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #FF7849, #fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, flexShrink: 0 }}>
                {item.step}
              </div>
              <span style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.3 }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg, rgba(255,120,73,0.12), rgba(251,146,60,0.08))", border: "2px solid rgba(255,120,73,0.25)", borderRadius: 16, padding: "20px 28px", marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, marginBottom: 4, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>
            {en ? "Order Now" : "Ordena Ahora"}
          </p>
          <p style={{ fontSize: 32, fontWeight: 900, color: "#FF7849", margin: 0, letterSpacing: 1 }}>
            happyeats.app
          </p>
        </div>

        <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#06b6d4", margin: 0, marginBottom: 4 }}>
            {en ? "Are You a Vendor or Restaurant?" : "¿Eres Vendedor o Restaurante?"}
          </p>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            {en ? "Join Happy Eats FREE — no monthly fees, just 20% per order." : "Únete a Happy Eats GRATIS — sin cuotas mensuales, solo 20% por pedido."}
          </p>
          <p style={{ fontSize: 13, color: "#06b6d4", margin: "4px 0 0", fontWeight: 600 }}>
            happyeats.app/vendor-portal
          </p>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            {en ? "Powered by" : "Desarrollado por"} <strong style={{ color: "#FF7849" }}>Happy Eats</strong> • Nashville • Lebanon • Mt. Juliet • Wilson County
          </p>
          <p style={{ fontSize: 11, color: "#475569", margin: "4px 0 0" }}>
            {en ? "Launching April 6, 2026" : "Lanzamiento 6 de Abril, 2026"}
          </p>
        </div>
      </div>
    </div>
  );
}

const FLYER_COMPONENTS: Record<string, Record<Lang, React.FC>> = {
  "order-here": {
    en: () => <FlyerOrderHere lang="en" />,
    es: () => <FlyerOrderHere lang="es" />,
  },
  "storefront": {
    en: () => <FlyerStorefront lang="en" />,
    es: () => <FlyerStorefront lang="es" />,
  },
  "your-kitchen": {
    en: () => <FlyerYourKitchen lang="en" />,
    es: () => <FlyerYourKitchen lang="es" />,
  },
  "free-tools": {
    en: () => <FlyerFreeTools lang="en" />,
    es: () => <FlyerFreeTools lang="es" />,
  },
  "three-steps": {
    en: () => <FlyerThreeSteps lang="en" />,
    es: () => <FlyerThreeSteps lang="es" />,
  },
};

async function downloadFlyer(elementId: string, filename: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  try {
    const dataUrl = await toPng(el, { quality: 1, pixelRatio: 2, cacheBust: true });
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Download failed:", err);
  }
}

async function downloadPDF(elementId: string, filename: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  try {
    const dataUrl = await toPng(el, { quality: 1, pixelRatio: 2, cacheBust: true });
    const pdf = new jsPDF("portrait", "in", "letter");
    pdf.addImage(dataUrl, "PNG", 0, 0, 8.5, 11);
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error("PDF failed:", err);
  }
}

async function printFlyer(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  try {
    const dataUrl = await toPng(el, { quality: 1, pixelRatio: 2, cacheBust: true });
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Print Flyer</title><style>@media print{@page{margin:0;size:letter}body{margin:0}img{width:100%;height:auto}}</style></head><body><img src="${dataUrl}" onload="window.print();window.close()"/></body></html>`);
    win.document.close();
  } catch (err) {
    console.error("Print failed:", err);
  }
}

async function saveToVault(elementId: string, title: string, lang: Lang, category: string) {
  const el = document.getElementById(elementId);
  if (!el) return null;
  try {
    const dataUrl = await toPng(el, { quality: 1, pixelRatio: 2, cacheBust: true });
    const res = await fetch("/api/vault/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerType: "platform",
        category,
        title,
        language: lang,
        imageUrl: dataUrl,
        thumbnailUrl: dataUrl,
        fileType: "image/png",
        tags: ["flyer", "vendor-recruitment", lang],
        isTemplate: true,
        isPublic: false,
      }),
    });
    if (!res.ok) throw new Error("Save failed");
    return await res.json();
  } catch (err) {
    console.error("Save to vault failed:", err);
    return null;
  }
}

export default function FlyerCatalog() {
  const [expandedFlyer, setExpandedFlyer] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>("en");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [showVault, setShowVault] = useState(false);
  const queryClient = useQueryClient();

  const { data: vaultItems = [] } = useQuery<any[]>({
    queryKey: ["/api/vault/items", "flyer"],
    queryFn: async () => {
      const res = await fetch("/api/vault/items?category=flyer");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/vault/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/vault/items"] }),
  });

  const handleSaveToVault = async (flyerId: string, title: string) => {
    const result = await saveToVault(flyerId, `${title} (${activeLang.toUpperCase()})`, activeLang, "flyer");
    if (result) {
      setSavedMsg(title);
      queryClient.invalidateQueries({ queryKey: ["/api/vault/items"] });
      setTimeout(() => setSavedMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="relative overflow-hidden">
        {/* Cockpit ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/[0.07] via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-cyan-500/[0.04] to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 relative z-10">
          <div className="mb-6">
            <Link href="/marketing" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-cyan-300 transition-colors mb-5 min-h-[44px]" data-testid="link-back-marketing">
              <ArrowLeft className="w-4 h-4" />
              Back to Marketing Hub
            </Link>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg shadow-cyan-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Flyer Catalog
                </h1>
                <p className="text-[11px] text-cyan-400/50">Pre-made flyers ready to download & print</p>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-lg">
              Browse pre-made marketing flyers. Download as PNG or PDF, print directly, or use as inspiration in the flyer editor. Available in English and Spanish.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveLang("en")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] backdrop-blur-sm ${activeLang === "en" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]" : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/[0.06]"}`}
              data-testid="button-lang-en"
            >
              <Globe2 className="w-4 h-4 inline mr-1.5" />
              English
            </button>
            <button
              onClick={() => setActiveLang("es")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] backdrop-blur-sm ${activeLang === "es" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]" : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/[0.06]"}`}
              data-testid="button-lang-es"
            >
              <Globe2 className="w-4 h-4 inline mr-1.5" />
              Español
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { key: "all", label: activeLang === "en" ? "All Flyers" : "Todos" },
              { key: "Customer Ordering", label: activeLang === "en" ? "Customer / Storefront" : "Clientes / Tienda" },
              { key: "Vendor Recruitment", label: activeLang === "en" ? "Vendor Signup" : "Reclutamiento" },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] backdrop-blur-sm ${activeCategory === cat.key ? "bg-white/10 text-white border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.1)]" : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/[0.06]"}`}
                data-testid={`button-category-${cat.key}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {FLYER_TEMPLATES.filter(t => activeCategory === "all" || t.category === activeCategory).map((tmpl) => {
              const isExpanded = expandedFlyer === tmpl.id;
              const flyerId = `flyer-render-${tmpl.id}-${activeLang}`;
              const FlyerComponent = FLYER_COMPONENTS[tmpl.id][activeLang];

              return (
                <div key={tmpl.id} className="rounded-xl overflow-hidden backdrop-blur-md border border-white/[0.08] bg-white/[0.03] hover:border-cyan-500/20 transition-all duration-300">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedFlyer(isExpanded ? null : tmpl.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedFlyer(isExpanded ? null : tmpl.id); } }}
                    className="w-full flex items-center gap-4 p-4 text-left min-h-[72px] hover:bg-white/[0.02] transition-colors cursor-pointer"
                    data-testid={`button-expand-${tmpl.id}`}
                  >
                    <img src={tmpl.image} alt="" className="w-14 h-18 rounded-lg object-cover flex-shrink-0" style={{ height: 72 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{tmpl.title[activeLang]}</p>
                      <p className="text-xs text-white/40 mt-0.5">{tmpl.category} • {activeLang === "en" ? "English" : "Español"}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isExpanded && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedFlyer(tmpl.id); setTimeout(() => downloadFlyer(flyerId, `${tmpl.id}-${activeLang}`), 500); }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-orange-500/20 text-white/50 hover:text-orange-300 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                          title="Download PNG"
                          data-testid={`button-download-${tmpl.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-white/30" /> : <ChevronDown className="w-5 h-5 text-white/30" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/5">
                      <div className="flex flex-wrap gap-2 p-4 pb-2">
                        <button
                          onClick={() => downloadFlyer(flyerId, `happy-eats-${tmpl.id}-${activeLang}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500/20 text-orange-300 text-xs font-medium hover:bg-orange-500/30 transition-all min-h-[44px]"
                          data-testid={`button-download-png-${tmpl.id}`}
                        >
                          <Download className="w-3.5 h-3.5" /> Download PNG
                        </button>
                        <button
                          onClick={() => downloadPDF(flyerId, `happy-eats-${tmpl.id}-${activeLang}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-all min-h-[44px]"
                          data-testid={`button-download-pdf-${tmpl.id}`}
                        >
                          <Download className="w-3.5 h-3.5" /> Download PDF
                        </button>
                        <button
                          onClick={() => printFlyer(flyerId)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-medium hover:bg-cyan-500/30 transition-all min-h-[44px]"
                          data-testid={`button-print-${tmpl.id}`}
                        >
                          <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                        <button
                          onClick={() => handleSaveToVault(flyerId, tmpl.title[activeLang])}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-all min-h-[44px]"
                          data-testid={`button-save-vault-${tmpl.id}`}
                        >
                          <Save className="w-3.5 h-3.5" /> Save to Vault
                        </button>
                      </div>
                      {savedMsg === tmpl.title[activeLang] && (
                        <div className="mx-4 mb-2 flex items-center gap-2 text-xs text-emerald-400">
                          <Check className="w-3.5 h-3.5" /> Saved to your vault!
                        </div>
                      )}

                      <div className="p-4 overflow-x-auto">
                        <div className="mx-auto" style={{ width: 816, transformOrigin: "top left" }}>
                          <div id={flyerId}>
                            <FlyerComponent />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {vaultItems.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowVault(!showVault)}
                className="flex items-center gap-2 mb-4 min-h-[44px]"
                data-testid="button-toggle-vault"
              >
                <FolderOpen className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">My Vault</h2>
                <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{vaultItems.length} saved</span>
                {showVault ? <ChevronUp className="w-4 h-4 text-white/30 ml-auto" /> : <ChevronDown className="w-4 h-4 text-white/30 ml-auto" />}
              </button>

              {showVault && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vaultItems.map((item: any) => (
                    <div key={item.id} className="rounded-xl overflow-hidden group relative" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {item.thumbnailUrl && (
                        <div className="aspect-[3/4] overflow-hidden">
                          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover object-top" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{item.language?.toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}</p>
                        <div className="flex gap-1.5 mt-2">
                          {item.imageUrl && (
                            <a
                              href={item.imageUrl}
                              download={`${item.title}.png`}
                              className="p-1.5 rounded bg-white/5 hover:bg-orange-500/20 text-white/50 hover:text-orange-300 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
                              data-testid={`vault-download-${item.id}`}
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-300 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
                            data-testid={`vault-delete-${item.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/ai-flyer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold text-sm hover:shadow-[0_0_24px_rgba(6,182,212,0.3)] transition-all min-h-[48px]"
              data-testid="link-create-custom"
            >
              <Sparkles className="w-4 h-4" />
              Create a Custom Flyer
            </Link>
            <p className="text-xs text-white/30 mt-2">Or start fresh with the AI Flyer Creator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
