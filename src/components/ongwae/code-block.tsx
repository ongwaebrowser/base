"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setHasCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "The code has been copied successfully.",
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-300">
        <span className="font-sans">{language}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-300 hover:bg-zinc-700 hover:text-white"
          onClick={handleCopy}
        >
          {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: "1rem", borderRadius: "0 0 0.5rem 0.5rem", background: '#1e1e1e' }}
        codeTagProps={{
          className: "font-code text-sm",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
