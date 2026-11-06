import { styles } from "@/components/ui/styles";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const fence = "`".repeat(
    Math.max(
      2,
      ...(code.match(/`+/g) ?? []).map((run) => run.length),
    ) + 1,
  );
  const safeLanguage = /^[a-zA-Z0-9_+-]+$/.test(language)
    ? language
    : "text";

  return (
    <div className={styles["ui-code"]}>
      <div>
        {language}
        <span>CODE</span>
      </div>
      <Markdown
        skipHtml
        rehypePlugins={[
          [
            rehypeHighlight,
            { detect: false, ignoreMissing: true },
          ],
        ]}
      >{`${fence}${safeLanguage}\n${code}\n${fence}`}</Markdown>
    </div>
  );
}
