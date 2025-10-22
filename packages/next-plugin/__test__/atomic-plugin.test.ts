import type { Configuration } from "webpack";
import { withAtomicVariants } from "../src";
import AtomicVariantsPlugin from "@atomic-variants/webpack-plugin";
import { ATOMIC_TAG } from "@atomic-variants/constants";

describe("withAtomicVariants", () => {
  const mockWebpackConfig: Configuration = {
    plugins: [],
  };
  const mockOptions = {} as any;

  it("adds AtomicVariantsPlugin to webpack plugins", () => {
    const config = withAtomicVariants({});
    config.webpack(mockWebpackConfig, mockOptions);

    const pluginInstance = mockWebpackConfig.plugins?.find(
      (plugin) => plugin instanceof AtomicVariantsPlugin
    );

    expect(pluginInstance).toBeInstanceOf(AtomicVariantsPlugin);
  });

  it("adds @atomic-variants/swc-plugin to experimental.swcPlugins", () => {
    const config = withAtomicVariants({});

    expect(config.experimental?.swcPlugins).toContainEqual([
      "@atomic-variants/swc-plugin",
      { tag: ATOMIC_TAG },
    ]);
  });

  it("preserves existing swcPlugins", () => {
    const config = withAtomicVariants({
      experimental: {
        swcPlugins: [["existing-plugin", { option: true }]],
      },
    });

    expect(config.experimental?.swcPlugins).toEqual([
      ["existing-plugin", { option: true }],
      ["@atomic-variants/swc-plugin", { tag: ATOMIC_TAG }],
    ]);
  });

  it("calls user-defined webpack function if present", () => {
    const mockUserWebpack = jest.fn((config) => config);

    const config = withAtomicVariants({
      webpack: mockUserWebpack,
    });

    config.webpack(mockWebpackConfig, mockOptions);

    expect(mockUserWebpack).toHaveBeenCalledWith(
      mockWebpackConfig,
      mockOptions
    );
  });
});
