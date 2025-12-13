import fs from "fs";
import path from "path";
import webpack from "webpack";
import AtomicVariantsPlugin from "../src";

process.on("warning", (warning) => {
  if (!warning.name.includes("DeprecationWarning")) {
    console.warn(warning);
  }
});

const filePath = path.resolve(__dirname, "atomic-variants.css");

test("extracts __atomic_generated classes", (done) => {
  const compiler = webpack({
    mode: "development",
    entry: path.resolve(__dirname, "mock-entry.js"),
    output: { path: path.resolve(__dirname, "dist"), filename: "bundle.js" },
    plugins: [
      new AtomicVariantsPlugin({
        filePath,
      }),
    ],
  });

  compiler?.run((err, stats) => {
    if (err) return done(err);

    expect(stats?.hasErrors()).toBe(false);
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf8");
    expect(content.trim()).toBe(`@source inline("bg-red-500 text-xl");`);

    fs.rmSync(filePath);
    compiler.close(done);
  });
});
