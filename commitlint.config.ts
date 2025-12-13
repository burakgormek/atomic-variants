import { UserConfig } from "@commitlint/types";

/**
 * @type {import('@commitlint/types').UserConfig}
 */
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "core",
        "swc-plugin",
        "webpack-plugin",
        "next-plugin",
        "vite-plugin",
        "examples",
        "docs",
        "website",
      ],
    ],
  },
};

export default config;
