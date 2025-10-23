&nbsp;

<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset=".github/assets/logo-light.svg" >
      <img alt="Atomic Variants logo" src=".github/assets/logo-dark.svg">
    </picture>
</p>

<p align="center">Tailwind-ready responsive, type-safe variants</p>

&nbsp;

## 🚀 Features

- 🧩 **Composable Variants** – Define variants with base and conditional classes effortlessly.
- 📱 **Responsive Variants** – Automatically handle responsive prefixes (sm:, md:, etc.).
- 🔒 **Type-Safe** – Fully typed with TypeScript for safer variant usage.
- ⚡️ **Lightweight** – Zero dependencies, minimal runtime.

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

To use responsive variants, install the **optional plugins** for your framework. These plugins ensure Tailwind includes generated responsive classes during compilation.

<details>
<summary>Next.js</summary>

Install the Next.js plugin for atomic-variants as a development dependency:

```bash
npm install @atomic-variants/next-plugin -D
# --- or ---
yarn add @atomic-variants/next-plugin -D
# --- or ---
pnpm add @atomic-variants/next-plugin -D
# --- or ---
bun add @atomic-variants/next-plugin -D
```

Wrap your Next.js config with the Atomic Variants plugin to enable responsive variant.

```js
import type { NextConfig } from "next";
import withAtomicVariants from "@atomic-variants/next-plugin";

const nextConfig: NextConfig = {
  /* ... */
};

export default withAtomicVariants(nextConfig); // Wrap your config with the plugin
```

Add the generated `.atomic-variants` folder to your `.gitignore` to prevent it from being committed.

```txt
.atomic-variants
```

Finally, make Tailwind aware of the generated classes by importing the folder in your **global.css**.

```css
@import "tailwindcss";
@source "../atomic-variants";
```

This tells Tailwind to **scan** the generated variant files for class names during compilation, so those classes are recognized and compiled into your CSS.

</details>

<details>
<summary>Vite</summary>

Install the Next.js plugin for atomic-variants as a development dependency:

```bash
npm install @atomic-variants/vite-plugin -D
# --- or ---
yarn add @atomic-variants/vite-plugin -D
# --- or ---
pnpm add @atomic-variants/vite-plugin -D
# --- or ---
bun add @atomic-variants/vite-plugin -D
```

Update your vite.config.ts to include the Atomic Variants plugin.

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import atomicVariants from "@atomic-variants/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), atomicVariants()],
});
```

Add the generated `.atomic-variants` folder to your `.gitignore` to prevent it from being committed.

```txt
.atomic-variants
```

Finally, make Tailwind aware of the generated classes by importing the folder in your **global.css**.

```css
@import "tailwindcss";
@source "../atomic-variants";
```

This tells Tailwind to **scan** the generated variant files for class names during compilation, so those classes are recognized and compiled into your CSS.

</details>

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
