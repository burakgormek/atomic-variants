&nbsp;

<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset=".github/assets/logo-light.svg" >
      <img alt="Atomic Variants logo" src=".github/assets/logo-dark.svg">
    </picture>
</p>

<p align="center">Tailwind-ready responsive, type-safe variants.</p>

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

Finally, import _@atomic-variants/vite-plugin_ in the same CSS file where **Tailwind** is imported.

```css
@import "tailwindcss";
@import "@atomic-variants/next-plugin";
```

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

Finally, import _@atomic-variants/vite-plugin_ in the same CSS file where **Tailwind** is imported.

```css
@import "tailwindcss";
@import "@atomic-variants/vite-plugin";
```

</details>

<details>
<summary>Tailwind Merge (optional)</summary>

By default, **atomic-variants does not handle class conflicts**, so using [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) is recommended if you want automatic conflict resolution.

```bash
npm install @tailwind-merge
# --- or ---
yarn add @tailwind-merge
# --- or ---
pnpm add @tailwind-merge
# --- or ---
bun add @tailwind-merge
```

After installing, configure it globally using the default config:

```js
import { config } from "atomic-variants";
import { twMerge } from "tailwind-merge";

config.finalize = twMerge;
```

This ensures automatic conflict resolution for Tailwind CSS classes in the final result.

</details>

## ⚙️ API

### `atomic(config)`

Creates a **type-safe, composable variant function**.

| Property               | Type                                                | Description                                                                                                                                         |
| ---------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **base**               | `string`                                            | Base classes applied by default.                                                                                                                    |
| **override**           | `string`                                            | Classes that take precedence over **base** and **variant** classes.                                                                                 |
| **variants**           | `Record<string, Record<string \| boolean, string>>` | Defines available variants and their corresponding class names.<br><br>Supports both string and boolean variant values.                             |
| **responsiveVariants** | `boolean \| string[]`                               | Enables responsive variant support.<br><br>- `true` applies responsiveness to all variants.<br>- An array applies it only to specific variant keys. |

```ts
import { atomic } from "atomic-variants";

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
```

> **Note:** Classes passed via **className** take priority over `override`, which takes priority over `base` and `variants`.

### Responsive Variants

You can also enable **responsive variants**, allowing you to apply different variant values at specific breakpoints. This can be done for all variants or only for specific variant keys.

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

> **Note:** The **xs** value is treated as default (no prefix), and other breakpoints (**sm**, **md**, **lg**, etc.) automatically get their respective prefixes.

> To use **responsive variants**, install the optional plugins for your framework. These plugins ensure Tailwind includes generated responsive classes during compilation.

### Customizable Breakpoints

By default, Atomic Variants uses Tailwind's standard breakpoints: `sm`, `md`, `lg`, `xl`, and `2xl`. You can customize these by passing a `breakpoints` array to the plugin options.

<details>
<summary>Next.js</summary>

```ts
import type { NextConfig } from "next";
import withAtomicVariants from "@atomic-variants/next-plugin";

const nextConfig: NextConfig = {
  /* ... */
};

// Pass custom breakpoints to the plugin
export default withAtomicVariants(nextConfig, {
  breakpoints: ["tablet", "desktop", "wide"],
});
```

</details>

<details>
<summary>Vite</summary>

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import atomicVariants from "@atomic-variants/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    atomicVariants({
      breakpoints: ["tablet", "desktop", "wide"],
    }),
  ],
});
```

</details>

Ideally, you should configure the base breakpoint globally using the default config. The base breakpoint determines which breakpoint value is applied without a media query prefix (default: "xs"). For example, setting it to "mobile" makes classes for that breakpoint apply without the `mobile:` prefix:

```js
import { config } from "atomic-variants";

config.baseBreakpoint = "mobile";
```

To make TypeScript aware of your custom breakpoints, you can override the `AtomicBreakpoints` interface using module augmentation. Create a `*.d.ts` file in your project and add the following:

```ts
// atomic-variants.d.ts
declare module "atomic-variants" {
  export interface AtomicBreakpoints {
    tablet: true;
    desktop: true;
    wide: true;
  }
}
```

This ensures type-safety when using responsive variants with your custom breakpoints.

## Acknowledgements

[cva](https://github.com/joe-bell/cva) [tailwind-variants](https://github.com/heroui-inc/tailwind-variants)

These projects were the main inspiration for Atomic Variants. They’re both mature, well-tested, and excellent libraries that have greatly influenced this project.

This library was created as an alternative that supports responsive variants. For **Tailwind** v4, the only way to implement responsive variants is through a custom plugin.
PR wasn’t ideal because the existing libraries are already quite complex and difficult to maintain, so it was developed as a separate experiment.

## License

This library is licensed under [The MIT License](LICENSE).
