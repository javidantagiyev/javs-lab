
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-math"],
    rehypePlugins: ["rehype-slug", "rehype-katex"],
  },
});

export default withMDX(nextConfig);
