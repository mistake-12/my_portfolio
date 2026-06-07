# Directory Structure

> How frontend code is organized in this project.

---

## Overview

Next.js App Router project using the `src/` directory convention. Code is organized by type (components, lib, data) rather than by feature. The `@/` path alias maps to `src/`.

---

## Directory Layout

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── layout.tsx          # Root layout (metadata, global providers, NoiseTexture, LoadingScreen)
│   ├── page.tsx            # Home page (client component — all GSAP timeline logic)
│   ├── not-found.tsx       # 404 page
│   ├── globals.css         # Global styles + Tailwind directives + @keyframes
│   └── api/
│       └── rag/chat/
│           └── route.ts    # RAG chat API endpoint (POST)
├── components/             # React components (all client components)
│   ├── ui/                 # Reusable UI primitives
│   │   ├── Beams.tsx       # Three.js beam light visual effect
│   │   ├── ScrollIndicator.tsx
│   │   └── WorksProgress.tsx
│   ├── LoadingScreen.tsx   # Media loading progress screen
│   ├── NavBar.tsx          # Stage4 fixed navigation bar
│   ├── FlyingMascot.tsx    # Animated mascot with click/right-click interaction
│   ├── RagChat.tsx         # RAG chat panel (portaled to document.body)
│   ├── WelcomeContent.tsx  # Stage 1 hero content
│   ├── AboutContent.tsx    # Stage 2 about/profile content
│   ├── DisciplineContent.tsx # Stage 3 discipline selector
│   ├── CategoryIntro.tsx   # Stage 4 category section headers
│   ├── WorkCanvas.tsx      # Stage 4 work card container
│   ├── WorkMedia.tsx       # Work card image/video media
│   ├── WorkMeta.tsx        # Work card text metadata
│   ├── Clouds.tsx          # Decorative cloud elements along the track
│   └── NoiseTexture.tsx    # Full-screen noise texture overlay
├── lib/                    # Utility functions (pure logic, no React)
│   ├── utils.ts            # cn() — clsx + tailwind-merge
│   ├── llm.ts              # DeepSeek API streaming client
│   ├── embedding.ts        # GLM Embedding API client
│   ├── rag-index.ts        # RAG index builder + search
│   ├── mascot-events.ts    # Mascot bubble event system (pub/sub)
│   ├── scrollToCategory.ts # Scroll-to-category navigation logic
│   └── extendPath.ts       # SVG path extension for horizontal track
└── data/                   # Static data exports (TypeScript modules)
    ├── profile.ts          # Personal profile (name, bio, etc.)
    ├── works.ts            # Works/projects array with Work interface
    ├── disciplines.ts      # Discipline definitions
    ├── mascot-quotes.ts    # Random mascot quote strings
    └── rag/                # RAG knowledge base (markdown files)
        ├── resume.md
        ├── faq.md
        ├── projects.md
        ├── philosophy.md
        └── index.json     # Pre-built embedding index
```

---

## Module Organization

**By type, not by feature.** New features should follow existing patterns:

- **New page/route**: Add under `src/app/` using Next.js App Router conventions
- **New component**: Add under `src/components/`, use `ui/` subfolder for small reusable pieces
- **New utility**: Add under `src/lib/`
- **New static data**: Add under `src/data/`

Components are flat — no nested feature folders. The `ui/` subfolder is the only organizational subdivision within components.

---

## Naming Conventions

| Element | Convention | Examples |
|---------|-----------|---------|
| Components | PascalCase, `.tsx` extension | `NavBar.tsx`, `LoadingScreen.tsx` |
| UI primitives | PascalCase in `ui/` subfolder | `ui/Beams.tsx` |
| Lib utilities | kebab-case or camelCase, `.ts` extension | `scrollToCategory.ts`, `mascot-events.ts` |
| Data files | kebab-case, `.ts` extension | `mascot-quotes.ts` |
| API routes | Next.js convention: `route.ts` in directory | `api/rag/chat/route.ts` |
| Exports | Default export for components, named exports for lib/data | `export default function NavBar()` |

---

## Examples

**Well-organized modules**:
- `src/lib/` — clean separation: each file does one thing (embedding, llm, rag-index, events)
- `src/data/` — typed data exports with interfaces co-located in the same file

**Notable patterns**:
- The single `src/app/page.tsx` is massive (~760 lines) — it contains all GSAP ScrollTrigger timeline logic. Future refactoring could extract timeline setup into `src/lib/`.
- No `/hooks/` directory — hooks live inline within components that need them.
- No `/types/` directory — types are co-located with the data they describe (e.g., `Work` interface in `works.ts`).
