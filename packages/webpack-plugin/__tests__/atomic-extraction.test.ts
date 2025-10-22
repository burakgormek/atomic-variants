import fs from "fs";
import path from "path";
import webpack from "webpack";
import AtomicVariantsPlugin from "../src";
import { OUTPUT_FILE_DIR } from "@atomic-variants/constants";

process.on("warning", (warning) => {
  if (!warning.name.includes("DeprecationWarning")) {
    console.warn(warning);
  }
});

test("extracts __atomic_generated classes", (done) => {
  const compiler = webpack({
    mode: "development",
    entry: path.resolve(__dirname, "mock-entry.js"),
    output: { path: path.resolve(__dirname, "dist"), filename: "bundle.js" },
    plugins: [new AtomicVariantsPlugin()],
  });

  compiler?.run((err, stats) => {
    if (err) return done(err);

    expect(stats?.hasErrors()).toBe(false);
    expect(fs.existsSync(OUTPUT_FILE_DIR)).toBe(true);

    const content = fs.readFileSync(OUTPUT_FILE_DIR, "utf8");
    expect(content.trim()).toBe("bg-red-500 text-xl");

    compiler.close(done);
  });
});
