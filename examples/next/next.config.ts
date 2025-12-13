import type { NextConfig } from "next";
import { withAtomicVariants } from "@atomic-variants/next-plugin";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withAtomicVariants(nextConfig);
