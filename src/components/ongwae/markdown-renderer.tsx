"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-normal prose-headings:font-headline"
      components={{
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold font-headline mb-4" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-bold font-headline mb-3" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-semibold font-headline mb-2" {...props} />,
        p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
        li: ({node, ...props}) => <li className="mb-1" {...props} />,
        table: ({ node, ...props }) => (
          <div className="my-6 overflow-hidden rounded-lg border">
            <Table {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <TableHeader {...props} />,
        tbody: ({ node, ...props }) => <TableBody {...props} />,
        tr: ({ node, ...props }) => <TableRow {...props} />,
        th: ({ node, ...props }) => <TableHead className="font-bold" {...props} />,
        td: ({ node, ...props }) => <TableCell {...props} />,
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
          ) : (
            <code className="font-code rounded bg-muted px-1.5 py-1 text-sm" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
