# 📦 atomic-variants

A tiny utility for creating type-safe TailwindCSS variants — with **responsive** support.

---

## 🚀 Features

- 🧩 **Composable Variants** – define variants with base and conditional classes.
- 📱 **Responsive Variants** – automatically handle responsive prefixes (`sm:`, `md:`, etc.).
- 🔒 **Type-Safe** – fully typed with TypeScript for safer variant usage.
- ⚡️ **Lightweight** – zero dependencies, minimal runtime.
- 🎨 **Tailwind-Ready** – works with TailwindCSS v3 & v4 and supports `tailwind-merge`.

## 📦 Installation

```bash
npm install atomic-variants
# --- or ---
yarn add atomic-variants
# --- or ---
pnpm add atomic-variants
# --- or ---
bun add atomic-variants
```

### Responsive Variants

To enable **responsive variants**, install the optional atomic-variants build plugins.
These plugins ensure Tailwind includes generated responsive classes during compilation.

#### Next.js Setup

Install the atomic-variants Next.js plugin:

```bash
npm install @atomic-variants/next-plugin -D
# --- or ---
yarn add @atomic-variants/next-plugin -D
# --- or ---
pnpm add @atomic-variants/next-plugin -D
# --- or ---
bun add @atomic-variants/next-plugin -D
```

then wrap your configuration with with atomic-variants:

```js
import withAtomicVariants from "@atomic-variants/next-plugin"; // Import the atomic-variants plugin
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ... */
};

export default withAtomicVariants(nextConfig); // Wrap your config with the plugin
```

Add the generated folder to `.gitignore`:

```
.atomic-variants
```

Add generated classes to your `globals.css` (or wherever tailwindcss is imported):

```css
@import "tailwindcss";
@source "../atomic-variants";
```

### Tailwind Merge (**recommended**)

By default, **atomic-variants does not handle class conflicts**, so using [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) is recommended if you want automatic conflict resolution.

```bash
npm install tailwind-merge
# --- or ---
yarn add tailwind-merge
# --- or ---
pnpm add tailwind-merge
# --- or ---
bun add tailwind-merge
```

After installing, configure it globally using the default config:

```js
import { defaultConfig } from "atomic-variants";
import { twMerge } from "tailwind-merge";

defaultConfig.finalize = twMerge;
```

## ⚙️ API

### `atomic(config)`

Creates a **composable, type-safe variants object** for TailwindCSS.

**Parameters:**

| Name                 | Type     | Description                                                                                                    |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`               | `string` | Base classes applied by default.                                                                               |
| `override`           | `string` | Classes that **override variant classes**.                                                                     |
| `variants`           | `object` | An object defining variant keys and their corresponding class values. Boolean and string values are supported. |
| `responsiveVariants` | `boolean | string[]`                                                                                                      | Enable responsive variant support. `true` applies to all variants; or provide an array of variant keys to make only specific variants responsive. |

```ts
import { atomic, defaultConfig } from "atomic-variants";
import { twMerge } from "tailwind-merge";

const variants = atomic({
  base: "text-center",
  override: "leading-none",
  variants: {
    size: {
      extraSmall: "text-xs",
      small: "text-sm",
      normal: "text-base",
      large: "text-lg",
      extraLarge: "text-xl",
    },
    padding: {
      v1: "p-1",
      v2: "p-2",
      v3: "p-3",
      v4: "p-4",
    },
  },
});

variants();
// => text-center leading-none

variants({ className: "leading-snug", size: "extraSmall" });
// => text-center text-xs leading-none leading-snug

defaultConfig.finalize = twMerge;

variants({ className: "leading-snug", size: "extraSmall" });
// => text-center text-xs leading-snug
```

> **Note:** Classes passed via `className` take priority over `override`, which takes priority over `base` and `variants`.

### Responsive Variants

> **Note:** If you want to use responsive variants, you must install the library's SWC and Webpack plugin so Tailwind can detect the generated classes.

```ts
import { atomic } from "atomic-variants";

const variants = atomic({
  base: "w-20 h-20",
  variants: {
    padding: {
      small: "p-1",
      large: "p-2",
    },
  },
  responsiveVariants: true, // or ["padding"]
});

variants({ padding: { xs: "small", md: "large" } });
// => w-20 h-20 p-1 md:p-2
```

> **Note:** The xs value is treated as the default and does not get a responsive prefix. All other breakpoints (sm, md, lg, etc.) will have their respective prefixes.
