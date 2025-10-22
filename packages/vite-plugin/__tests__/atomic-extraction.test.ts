import fs from "fs";
import atomicVariantsPlugin from "../src";
import {
  ATOMIC_TAG,
  OUTPUT_DIR,
  OUTPUT_FILE_DIR,
} from "@atomic-variants/constants";

describe("atomicVariantsPlugin (Vite)", () => {
  let plugin: ReturnType<typeof atomicVariantsPlugin>;

  beforeEach(() => {
    plugin = atomicVariantsPlugin();
    if (fs.existsSync(OUTPUT_FILE_DIR)) fs.unlinkSync(OUTPUT_FILE_DIR);
    if (fs.existsSync(OUTPUT_DIR))
      fs.rmdirSync(OUTPUT_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(OUTPUT_DIR))
      fs.rmdirSync(OUTPUT_DIR, { recursive: true });
  });

  it("collects __atomic_generated classes and writes to .atomic-variants/.extracted", async () => {
    const input = `
      import { atomic } from "atomic-variants";
      /* ${ATOMIC_TAG}: text-blue-500 */
      const btn = atomic({ base: "text-blue-500" });
    `;
    const transformFn = plugin.transform as (
      code: string,
      id: string
    ) => Promise<{ code: string; map?: any }>;
    const buildEndFn = plugin.buildEnd as () => void;

    // Manually call transform() like Vite does
    const result = await transformFn(input, "Button.tsx");
    expect(result?.code).toContain(ATOMIC_TAG);

    // Trigger buildEnd() hook to write file
    buildEndFn();

    expect(fs.existsSync(OUTPUT_FILE_DIR)).toBe(true);
    const contents = fs.readFileSync(OUTPUT_FILE_DIR, "utf8");
    expect(contents.trim()).toContain("text-blue-500");
  });

  it("does not create extracted file when no __atomic_generated classes exist", async () => {
    const input = `const x = 1;`;
    const transformFn = plugin.transform as (
      code: string,
      id: string
    ) => Promise<{ code: string; map?: any }>;
    const buildEndFn = plugin.buildEnd as () => void;

    await transformFn(input, "Noop.ts");
    buildEndFn();

    expect(fs.existsSync(OUTPUT_FILE_DIR)).toBe(false);
  });
});
