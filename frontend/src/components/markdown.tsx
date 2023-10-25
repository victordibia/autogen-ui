'use client';

import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface CodeProps {
  node?: any;
  inline?: any;
  className?: any;
  children?: React.ReactNode;
}

export default function MarkdownView({ data }: { data: string }) {
  function processString(inputString: string): string {
    inputString = inputString.replace(/\n/g, '  \n');
    const markdownPattern = /```markdown\s+([\s\S]*?)\s+```/g;
    return inputString?.replace(markdownPattern, (match, content) => content);
  }

  return (
    <div
      className={`   w-full chatbox prose dark:prose-invert text-primary rounded p-2 `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={atomDark}
                language={language}
                className="rounded"
                PreTag="div"
                wrapLongLines={true}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          }
        }}
      >
        {processString(data)}
      </ReactMarkdown>
    </div>
  );
}
