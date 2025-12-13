import fs from "fs";
import type { Compiler, Compilation, sources } from "webpack";
import { ATOMIC_REGEX } from "@atomic-variants/constants";

export default class AtomicVariantsPlugin {
  private extractedClasses = new Set<string>();
  private debug: boolean = false;
  private filePath?: string;

  constructor(options: { filePath?: string; debug?: boolean } = {}) {
    this.debug &&= options.debug as boolean;
    this.filePath = options.filePath;
  }

  private log(...args: any[]) {
    if (this.debug) {
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

        if (this.filePath) {
          fs.writeFileSync(
            this.filePath,
            `@source inline("${Array.from(this.extractedClasses).join(" ")}");`
          );
        }
      } else {
        this.log("\n🎨 No atomic classes found in build");
      }
    });
  }
}
