import { ATOMIC_TAG } from "@atomic-variants/constants";
import AtomicVariantsPlugin from "@atomic-variants/webpack-plugin";
import type { NextConfig } from "next";

interface Options {
  breakpoints?: string[];
}

export function withAtomicVariants(
  nextConfig: NextConfig,
  options: Options = {
    breakpoints: ["sm", "md", "lg", "xl", "2xl"],
  },
) {
  const swcOptions = {
    tag: ATOMIC_TAG,
    breakpoints: options.breakpoints,
  };

  return {
    ...nextConfig,
    webpack: (webpackConfig, webpackOptions) => {
      webpackConfig.plugins?.push(
        new AtomicVariantsPlugin({
          filePath: new URL("../atomic-variants.css", import.meta.url).pathname,
        }),
      );

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(webpackConfig, webpackOptions);
      }

      return webpackConfig;
    },
    experimental: {
      ...nextConfig.experimental,
      swcPlugins: [
        ...(nextConfig.experimental?.swcPlugins || []),
        ["@atomic-variants/swc-plugin", swcOptions],
      ],
    },
  } satisfies NextConfig;
}
