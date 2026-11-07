import Markdown from "react-markdown";
import { CodeBlock } from "@/components/ui/code-block";

export function MarkdownContent({
  children,
}: {
  children: string;
}) {
  return (
    <div className="min-w-0 break-words text-sm leading-7 [&_a]:text-primary [&_a]:underline [&_pre]:overflow-x-auto [&_pre]:whitespace-pre [&_ul]:list-inside [&_ul]:list-disc">
      <Markdown
        components={{
          img: ({ alt }) => (
            <span>[이미지: {alt ?? ""}]</span>
          ),
          pre: ({ children }) => (
            <div className="my-3">{children}</div>
          ),
          code: ({ children, className }) => {
            const language = className?.replace(
              /^language-/,
              "",
            );
            return language ? (
              <CodeBlock
                code={String(children).replace(/\n$/, "")}
                language={language}
              />
            ) : (
              <code className="whitespace-pre-wrap rounded bg-canvas px-1 font-mono">
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
