# HappyEats Lume 🍔⚡

> **The first production application built entirely in Lume — the deterministic natural-language programming language.**

HappyEats rebuilt natively in Lume. Features AI-native menu digitization, health cert validation, and order management using Lume's `ask`/`think` keywords, self-sustaining runtime blocks (`monitor`/`heal`/`optimize`), and compile-time Lume-V trust certificates.

## Architecture

```
happyeats-lume/
├── src/
│   ├── app.lume              # Main entry point — Express bootstrap
│   ├── models/
│   │   ├── vendor.lume       # Vendor data model (type declarations)
│   │   ├── order.lume        # Order + OrderItem models
│   │   └── menu.lume         # MenuItem + MenuCategory models
│   ├── routes/
│   │   ├── vendors.lume      # Vendor CRUD + AI validation
│   │   ├── orders.lume       # Order lifecycle + fraud detection
│   │   ├── zones.lume        # Delivery zones + fee calculation
│   │   └── health.lume       # Health check endpoint
│   ├── ai/
│   │   ├── menu-scan.lume    # AI menu digitizer (OCR via `ask`)
│   │   └── cert-check.lume   # AI health cert validator
│   └── trust/
│       └── certs.lume        # Trust certificate management (LTC v1.0)
├── dist/                     # Compiled JavaScript output
├── scripts/
│   └── compile.js            # Lume → JS build pipeline
├── lume.config.json          # Compiler configuration
└── package.json
```

## What Makes This Different

| Feature | Traditional HappyEats | HappyEats Lume |
|---------|----------------------|----------------|
| **AI Integration** | OpenAI SDK calls in TypeScript | Native `ask`/`think` keywords |
| **Error Handling** | Try/catch everywhere | `@healable` decorator + `heal:` blocks |
| **Monitoring** | External APM tool | Built-in `monitor:` blocks |
| **Governance** | Bolt-on Lume-V wrapper | Compiled-in Lume-V certificates |
| **Language** | TypeScript | Lume (natural language → JS) |

## Lume Features Used

### AI-Native Keywords
```lume
let menu_items = ask openai.gpt4 "Extract menu items from this image: {image_url}"
let analysis = think openai.gpt4 "Is this health certificate valid? {cert_data}"
```

### Self-Sustaining Runtime
```lume
monitor:
    dashboard: true
    alert_thresholds:
        error_rate: 0.05

heal:
    max_retries: 3
    fallback_chain: ["openai.gpt4", "anthropic.claude_sonnet"]
```

### Trust Certificates (LTC v1.0)
Every AI decision gets a cryptographically signed trust certificate (Ed25519), providing full auditability.

### Type System
```lume
type Vendor:
    name: text
    cuisine: text
    approval_status: text = "pending"
    rating: number = 0
```

## Getting Started

```bash
# Install dependencies
npm install

# Compile .lume → .js
npm run compile

# Start the server
npm run dev
```

## Compiler Pipeline

```
.lume source → Lexer → Parser → AST → Transpiler → JavaScript
                                   ↓
                             Trust Certificates (Ed25519)
                                   ↓
                          Self-Sustaining Runtime Injection
```

The Lume compiler (`@lume/compiler v1.1.0`) handles:
- **Lexing**: Tokenizes natural-language syntax
- **Parsing**: Builds AST from Lume tokens
- **Transpiling**: Emits clean JavaScript
- **Trust**: Signs output with Ed25519 certificates
- **Runtime**: Injects monitor/heal/optimize/evolve layers

## Stack

- **Language**: Lume v1.1.0
- **Runtime**: Node.js ≥ 18
- **Database**: PostgreSQL via Neon + Drizzle ORM
- **Governance**: Lume-V (deterministic AI validation)
- **Trust**: LTC v1.0 (Ed25519 certificates)

## Related

- [Lume Language](https://github.com/cryptocreeper94-sudo/lume) — The compiler
- [HappyEats](https://github.com/cryptocreeper94-sudo/happyeats) — The original TypeScript version
- [Lume Paper](https://doi.org/10.5281/zenodo.19430898) — Academic preprint

---

**By [DarkWave Studios LLC](https://darkwavestudios.io) — Protected by [TrustShield.tech](https://trustshield.tech)**

*Patent Pending — TrustShield.tech*
