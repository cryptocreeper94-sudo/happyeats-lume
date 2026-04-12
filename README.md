# HappyEats Lume 🍔⚡

> **The first production application built entirely in Lume — the deterministic natural-language programming language.**

HappyEats rebuilt natively in Lume. Every operation — from vendor onboarding to order fulfillment — is deterministically compiled, cryptographically certified, and self-sustaining. AI capabilities (menu OCR, health cert validation, fraud detection) exist as *governed subsystems* under Lume-V's deterministic validation layer, not as the foundation. The foundation is trust.

## Why Lume, Not TypeScript?

| | Traditional Stack | Lume |
|---|---|---|
| **Compilation** | Source → machine code (no guarantees) | Source → deterministic AST → certified JavaScript |
| **AI Usage** | Raw API calls, no validation | `ask`/`think` keywords governed by Lume-V invariants |
| **Failure Recovery** | Manual try/catch | `@healable` decorator + `heal:` blocks (self-sustaining) |
| **Monitoring** | External APM tools | Built-in `monitor:` blocks (self-monitoring) |
| **Trust** | Hope | Ed25519 compile-time certificates (LTC v1.0) |

The key insight: **AI is not the product. Determinism is.** Every AI call in this codebase is gated by Lume-V governance — confidence thresholds, invariant checks, and human-in-the-loop escalation. If the AI is uncertain, the system rejects. If the AI hallucinates, the system catches it. This is what "deterministic AI governance" means.

## Architecture

```
happyeats-lume/
├── src/
│   ├── app.lume              # Entry point — deterministic server bootstrap
│   ├── models/
│   │   ├── vendor.lume       # Vendor type (compile-time validated)
│   │   ├── order.lume        # Order + OrderItem types
│   │   └── menu.lume         # MenuItem + MenuCategory types
│   ├── routes/
│   │   ├── vendors.lume      # Vendor CRUD — AI validation is governed
│   │   ├── orders.lume       # Order lifecycle — fraud detection is governed
│   │   ├── zones.lume        # Delivery zones + deterministic fee calculation
│   │   └── health.lume       # System health endpoint
│   ├── ai/
│   │   ├── menu-scan.lume    # Menu digitizer (ask/think, Lume-V gated)
│   │   └── cert-check.lume   # Health cert validator (ask/think, Lume-V gated)
│   └── trust/
│       └── certs.lume        # Trust certificate management (LTC v1.0)
├── dist/                     # Compiled JavaScript output
├── scripts/
│   └── compile.js            # Lume → JS deterministic build pipeline
├── lume.config.json          # Compiler + governance configuration
└── package.json
```

## Core Principles

### 1. Deterministic Compilation
Every `.lume` file passes through the same pipeline: **Lexer → Parser → AST → Transpiler → JavaScript**. The output is identical for identical input. No ambient state, no side-channel inference. The LDIR (Deterministic Inference Rulebook) guarantees that ambiguous constructs are resolved by rules, not guesses.

### 2. Self-Sustaining Runtime
The compiled output automatically includes four runtime layers:
- **Monitor** — tracks function metrics, latency, error rates
- **Healer** — retry logic, circuit breakers, fallback chains
- **Optimizer** — detects slow paths, proposes improvements
- **Evolver** — learns patterns, suggests upgrades

These aren't external tools. They're compiled into the output.

### 3. Trust Certificates (LTC v1.0)
Every compile produces Ed25519-signed certificates that prove:
- What source was compiled
- What rules were applied
- What the output hash is

This is the "certified at birth" guarantee — the compiled JavaScript carries proof of its own correctness.

### 4. Governed AI (Not Raw AI)
When this codebase uses `ask` or `think`, those calls are **not** raw OpenAI API calls. They're governed:

```lume
// This is NOT "call GPT and trust the output"
// This is "call GPT, validate the output against invariants,
// reject if confidence is below threshold, escalate if ambiguous"
let analysis = think "Is this health certificate valid? {cert_data}"
```

The `@healable` decorator ensures that if the AI call fails, the system retries with exponential backoff, tries fallback models, and ultimately fails safe — never fails open.

## Lume Syntax Showcase

### Type System
```lume
type Vendor:
    name: text
    cuisine: text
    approval_status: text = "pending"
    rating: number = 0
    is_active: boolean = true
```

### Self-Sustaining Blocks
```lume
monitor:
    log("System health check")

heal:
    log("Attempting recovery")
```

### Governed AI
```lume
@healable
to scan_menu(image_url: text, vendor_id: number):
    let raw_items = ask "Extract menu items from: {image_url}"
    let validation = think "Are these valid food items with prices between 1 and 200? {raw_items}"
    when validation is:
        "valid" -> log("Menu scan validated")
        "invalid" -> log("Menu scan flagged for review")
        default -> log("Uncertain — defaulting to review")
    return raw_items
```

### Pattern Matching
```lume
when analysis is:
    "approved" -> log("APPROVED")
    "conditional" -> log("CONDITIONAL")
    "rejected" -> log("REJECTED")
    default -> log("ESCALATED to human review")
```

## Getting Started

```bash
# Compile .lume → .js (deterministic output)
npm run compile

# Start the server
npm run dev
```

## Compiler Pipeline

```
.lume source
    → Lexer (tokenization)
    → Parser (AST construction)
    → LDIR (deterministic inference, 31 rules across 4 tiers)
    → Transpiler (clean JavaScript emission)
    → LTC (Ed25519 trust certificate signing)
    → Self-Sustaining Runtime Injection (monitor/heal/optimize/evolve)
    → dist/*.js
```

## Stack

- **Language**: Lume v1.1.0 — deterministic natural-language programming
- **Governance**: Lume-V — deterministic AI validation (confidence gates, invariant checks)
- **Trust**: LTC v1.0 — Ed25519 compile-time certificates
- **Runtime**: Node.js ≥ 18 with self-sustaining layers
- **Database**: PostgreSQL via Neon + Drizzle ORM

## Related

- [Lume Language](https://github.com/cryptocreeper94-sudo/lume) — The compiler
- [HappyEats](https://happyeats.app) — The production platform
- [Lume Paper](https://doi.org/10.5281/zenodo.19430898) — "Eliminating Cognitive Distance" (Zenodo preprint)

---

**By [DarkWave Studios LLC](https://darkwavestudios.io)**

*Lume and Lume-V Deterministic AI Governance — Patent Pending*
