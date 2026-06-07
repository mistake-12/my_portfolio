# Type Safety

> Type safety patterns in this project.

---

## Overview

TypeScript with `strict: true` (`tsconfig.json`). Types are co-located with the data or components they describe — there is no separate `/types/` directory.

---

## TypeScript Config

From `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": { "@/*": ["./src/*"] },
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

Key points:
- `strict: true` — all strict checks enabled
- `skipLibCheck: true` — avoids type-checking `node_modules`
- `noEmit: true` — Next.js handles compilation
- `@/*` alias for `src/*`

---

## Type Organization

**Types are co-located, not centralized.** No dedicated `/types/` directory.

| Location | Types Defined |
|----------|--------------|
| `src/data/works.ts` | `Work` interface (extensive, with union types for layout/width) |
| `src/data/profile.ts` | `Profile` interface |
| `src/components/RagChat.tsx` | `Message` interface (`{role, content}`) |
| `src/components/WorkCanvas.tsx` | `WorkCanvasProps` interface |
| `src/components/FlyingMascot.tsx` | `FlyingMascotProps` interface |
| `src/components/ui/Beams.tsx` | `BeamsProps`, `MergedPlanesProps`, `PlaneNoiseProps`, `DirLightProps` |
| `src/lib/rag-index.ts` | `Chunk` interface |
| `src/lib/mascot-events.ts` | `Listener` type alias |

---

## interface vs type

**Rule: `interface` for object shapes, `type` for unions/aliases.**

```ts
// Object shapes → interface
export interface Work {
  id: string;
  title: string;
  categoryId: "industrial" | "software" | "internship" | "other";
  // ...
}

interface WorkCanvasProps {
  work: Work;
  index: number;
  className?: string;
}

// Function signatures / unions → type
type Listener = (msg: string, force?: boolean) => void;
```

---

## Common Type Patterns

### String Union Types

Used for constrained values:
```ts
categoryId: "industrial" | "software" | "internship" | "other";
layout: "img-left" | "img-right" | "stacked";
alignY: "start" | "center" | "end";
width: "w-[40vw]" | "w-[45vw]" | ... | "w-[250vw]";
```

### `as const` for Lookup Maps

```ts
const alignYMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
} as const;
```

### Record for String-Keyed Maps

```ts
const widthMap: Record<string, string> = {
  "w-[40vw]": "max-w-lg",
  "w-[45vw]": "max-w-xl",
  // ...
};

const FAQ_ANSWERS: Record<string, string> = {
  "期望薪资": "薪资我们可以沟通中详细聊...",
  // ...
};
```

### Optional Properties with `?`

```ts
interface Work {
  description?: string;
  tags?: string[];
  imageConfig?: { width: string; height: string; /* ... */ };
  extraImages?: Array<{ url: string; /* ... */ }>;
}
```

### DOM Query Type Assertions

Heavy use of `as` casts for `document.querySelector`:
```ts
const masterTrack = document.querySelector("#master-track") as HTMLElement;
const journeyPath = stage4Wrapper?.querySelector("#journey-path") as SVGPathElement | null;
```

---

## Where `any` Appears

`any` is used sparingly but consistently in certain contexts:

1. **Three.js refs** (`src/components/ui/Beams.tsx`):
   ```ts
   const meshRef = useRef<any>(null);
   const dir = useRef<any>(null);
   ```

2. **Three.js material extension** (`src/components/ui/Beams.tsx`):
   ```ts
   function extendMaterial(BaseMaterial: any, cfg: any) {
     const physical = THREE.ShaderLib.physical as any;
   }
   ```

3. **ESLint disable comments** (file-level in `Beams.tsx`):
   ```
   /* eslint-disable @typescript-eslint/no-explicit-any */
   /* eslint-disable @typescript-eslint/no-non-null-assertion */
   /* eslint-disable react/no-unknown-property */
   ```

---

## `@ts-ignore` Usage

Used exclusively for the Lenis global:
```ts
// @ts-ignore
const lenis = window.lenis;
if (lenis && typeof lenis.scrollTo === "function") {
  lenis.scrollTo(targetY, { duration: 0.8, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
} else {
  window.scrollTo(0, targetY);
}
```

This appears in `NavBar.tsx`, `page.tsx`, and `scrollToCategory.ts`.

---

## Validation

**No runtime validation library** (no Zod, Yup, io-ts). API input (`/api/rag/chat`) trusts the client — no server-side validation beyond checking response status codes.

---

## Forbidden / Avoided Patterns

| Pattern | Status | Notes |
|---------|--------|-------|
| `any` outside Three.js | Avoid | Prefer `unknown` or proper types |
| `@ts-ignore` for non-Lenis | Avoid | Use `@ts-expect-error` with comment instead |
| `as` casts for non-DOM | Use sparingly | Prefer type guards |
| `!` non-null assertion | Avoid | Use optional chaining `?.` or null checks |
| `enum` | Not used | String unions preferred |
| `React.FC` | Not used | Function declarations with explicit props typing |
| Generic components | Not used | No generic type parameters on components |
