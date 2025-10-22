import fs from "fs";
import type { Compiler, Compilation, sources } from "webpack";
import {
  OUTPUT_DIR,
  OUTPUT_FILE_DIR,
  ATOMIC_REGEX,
} from "@atomic-variants/constants";

export default class AtomicVariantsPlugin {
  private extractedClasses: Set<string>;

  constructor(private _options: { debug?: boolean } = {}) {
    this.extractedClasses = new Set<string>();
  }

  private log(...args: any[]) {
    if (this._options.debug) {
      console.log(...args);
    }
  }

  apply(compiler: Compiler): void {
    compiler.hooks.emit.tapAsync(
      "AtomicVariantsPlugin",
      (compilation: Compilation, callback: (error?: Error) => void) => {
        for (const module of compilation.modules) {
          const anyModule = module as any;
          const source: sources.Source | undefined = anyModule._source;

          if (source && typeof source.source === "function") {
            const sourceCode = String(source.source());

            const match = ATOMIC_REGEX.exec(sourceCode);
            if (match) {
              this.extractedClasses.add((match?.[1] || "").trim());
            }
          }
        }

        callback();
      }
    );

    compiler.hooks.done.tap("AtomicVariantsPlugin", (stats) => {
      if (this.extractedClasses.size > 0) {
        this.log(
          "\n🎨 TOTAL Found atomic classes:",
          Array.from(this.extractedClasses)
        );

        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        // Write results to file
        fs.writeFileSync(
          OUTPUT_FILE_DIR,
          Array.from(this.extractedClasses).join("\n")
        );
      } else {
        this.log("\n🎨 No atomic classes found in build");
      }
    });
  }
}
