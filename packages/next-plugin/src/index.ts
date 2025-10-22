import { ATOMIC_TAG } from "@atomic-variants/constants";
import AtomicVariantsPlugin from "@atomic-variants/webpack-plugin";
import type { NextConfig } from "next";
import type { Configuration } from "webpack";

type WebpackOptionsType = Parameters<NonNullable<NextConfig["webpack"]>>["1"];

export function withAtomicVariants(nextConfig: NextConfig) {
  return {
    ...nextConfig,
    webpack: (webpackConfig: Configuration, options: WebpackOptionsType) => {
      webpackConfig.plugins?.push(new AtomicVariantsPlugin());

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
  };
}
