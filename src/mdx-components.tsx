import type { MDXComponents } from "mdx/types";

export function useMDXComponents(): MDXComponents {
  return {
    h2: (props) => <h2 className="javs-mdx-h2" {...props} />,
    h3: (props) => <h3 className="javs-mdx-h3" {...props} />,
    p: (props) => <p className="javs-mdx-p" {...props} />,
    ul: (props) => <ul className="javs-mdx-list" {...props} />,
    ol: (props) => <ol className="javs-mdx-list javs-mdx-numbered" {...props} />,
    li: (props) => <li className="javs-mdx-li" {...props} />,
    a: (props) => <a className="javs-mdx-link" {...props} />,
    blockquote: (props) => <blockquote className="javs-mdx-quote" {...props} />,
    code: (props) => <code className="javs-mdx-code" {...props} />,
    pre: (props) => <pre className="javs-mdx-pre" {...props} />,
  };
}
