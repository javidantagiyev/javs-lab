import type { MDXComponents } from "mdx/types";

export function useMDXComponents(): MDXComponents {
  return {
    h2: (props) => <h2 className="mt-12 mb-5 scroll-mt-24 text-2xl font-bold tracking-tight text-white" {...props} />,
    h3: (props) => <h3 className="mt-8 mb-3 scroll-mt-24 text-xl font-semibold text-white" {...props} />,
    p: (props) => <p className="mb-5 leading-8 text-slate-300" {...props} />,
    ul: (props) => <ul className="mb-6 list-disc space-y-2 pl-6 text-slate-300" {...props} />,
    ol: (props) => <ol className="mb-6 list-decimal space-y-2 pl-6 text-slate-300" {...props} />,
    li: (props) => <li className="pl-1" {...props} />,
    a: (props) => <a className="cursor-pointer text-blue-400 underline underline-offset-4 hover:text-blue-300" {...props} />,
    blockquote: (props) => <blockquote className="my-6 border-l-4 border-blue-500 bg-slate-900 p-4 text-slate-300" {...props} />,
    code: (props) => <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-blue-300" {...props} />,
    pre: (props) => <pre className="my-6 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm" {...props} />,
  };
}
