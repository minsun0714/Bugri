import Markdown from "react-markdown";
import { CodeBlock } from "@/components/ui/code-block";

export function QuizText({
  children,
}: {
  children: string;
}) {
  return (
    <div className="space-y-3 break-words [&_pre]:overflow-x-auto [&_a]:text-primary [&_p]:whitespace-pre-wrap">
      <Markdown
        skipHtml
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ children, className }) => {
            const text = String(children);
            const language = /language-([\w+-]+)/.exec(
              className ?? "",
            )?.[1];
            return language || text.includes("\n") ? (
              <CodeBlock
                code={text.replace(/\n$/, "")}
                language={language ?? "text"}
              />
            ) : (
              <code>{children}</code>
            );
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
