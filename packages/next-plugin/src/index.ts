import { ATOMIC_TAG } from "@atomic-variants/constants";
import AtomicVariantsPlugin from "@atomic-variants/webpack-plugin";
import type { NextConfig } from "next";
import path from "path";

export function withAtomicVariants(nextConfig: NextConfig) {
  return {
    ...nextConfig,
    webpack: (webpackConfig, options) => {
      webpackConfig.plugins?.push(
        new AtomicVariantsPlugin({
          filePath: path.resolve(__dirname, "atomic-variants.css"),
        })
      );

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(webpackConfig, options);
      }

      return webpackConfig;
    },
    experimental: {
      ...nextConfig.experimental,
      swcPlugins: [
        ...(nextConfig.experimental?.swcPlugins || []),
        ["@atomic-variants/swc-plugin", { tag: ATOMIC_TAG }],
      ],
    },
  } satisfies NextConfig;
}
