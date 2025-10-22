import { transform } from "@swc/core";
import fs from "fs";
import type { Plugin } from "vite";
import {
  OUTPUT_DIR,
  OUTPUT_FILE_DIR,
  ATOMIC_REGEX,
  ATOMIC_TAG,
} from "@atomic-variants/constants";

export default function atomicVariants(): Plugin {
  const extracted = new Set<string>();

  return {
    name: "vite-plugin",

    async transform(code, id) {
      if (!/\.(t|j)sx?$/.test(id)) return null;

      const isTS = id.endsWith(".ts") || id.endsWith(".tsx");
      const isTSX = id.endsWith(".tsx");

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
            plugins: [["@atomic-variants/swc-plugin", { tag: ATOMIC_TAG }]],
          },
        },
      });

      const match = ATOMIC_REGEX.exec(result.code);
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
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE_DIR, Array.from(extracted).join("\n"), "utf8");
  }
};
