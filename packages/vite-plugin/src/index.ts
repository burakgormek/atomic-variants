import { transform } from "@swc/core";
import fs from "fs";
import type { Plugin } from "vite";
import { ATOMIC_REGEX, ATOMIC_TAG } from "@atomic-variants/constants";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const resolve = createRequire(import.meta.url).resolve;

interface Options {
  breakpoints?: string[];
}

export default function atomicVariants(
  options: Options = {
    breakpoints: ["sm", "md", "lg", "xl", "2xl"],
  },
): Plugin {
  const extracted = new Set<string>();
  let viteCacheRoot: string;

  return {
    name: "vite-plugin",
    configResolved(config) {
      viteCacheRoot = config.cacheDir;
    },
    async transform(code, id) {
      if (!/\.(t|j)sx?$/.test(id)) return null;

      const isTS = id.endsWith(".ts") || id.endsWith(".tsx");
      const isTSX = id.endsWith(".tsx");

      const swcOptions = {
        tag: ATOMIC_TAG,
        breakpoints: options.breakpoints,
      };

      const result = await transform(code, {
        filename: id,
        swcrc: false,
        sourceMaps: false,
        configFile: false,
        jsc: {
          parser: {
            syntax: isTS ? "typescript" : "ecmascript",
            tsx: isTSX,
          },
          target: "es2022",
          experimental: {
            plugins: [[resolve("@atomic-variants/swc-plugin"), swcOptions]],
            cacheRoot: path.join(viteCacheRoot ?? "node_modules/.vite", ".swc"),
          },
        },
      });

      const regex = new RegExp(ATOMIC_REGEX.source, ATOMIC_REGEX.flags);
      const match = regex.exec(result.code);
      if (match) {
        extracted.add((match?.[1] || "").trim());
        writeExtractedClasses(extracted);
      }

      return {
        code: result.code,
        map: result.map,
      };
    },

    buildEnd() {
      writeExtractedClasses(extracted);
    },
  };
}

const writeExtractedClasses = (extracted: Set<string>) => {
  if (extracted.size > 0) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    fs.writeFileSync(
      path.resolve(__dirname, "../atomic-variants.css"),
      `@source inline("${Array.from(extracted).join(" ")}");`,
    );
  }
};
