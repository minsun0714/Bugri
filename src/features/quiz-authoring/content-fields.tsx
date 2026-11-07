import { Tooltip } from "@/components/ui/tooltip";
import type { Hashtag, QuizContent } from "@/api/contracts";
import {
  Button,
  Checkbox,
  Choice,
  TextField,
} from "@/components/ui";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { TagInput } from "@/components/ui/tag-input";
import { styles } from "@/features/quiz-authoring/styles";

export function ContentFields({
  content,
  source,
  tags,
  errors,
  onChange,
  onSource,
  showSource = true,
}: {
  showSource?: boolean;
  content: QuizContent;
  source: string;
  tags: Hashtag[];
  errors: Record<string, string>;
  onChange: (content: QuizContent) => void;
  onSource: (source: string) => void;
}) {
  const { question, answer } = content;

  function fieldError(key: string) {
    return errors[key] ? (
      <p
        className="text-sm text-coral"
        id={`review-${key}-error`}
      >
        {errors[key]}
      </p>
    ) : null;
  }

  return (
    <div className={styles.stack}>
      <TextField
        label="제목"
        value={content.title}
        error={errors.title}
        onChange={(event) =>
          onChange({
            ...content,
            title: event.target.value,
          })
        }
      />
      {showSource && (
        <div>
          <MarkdownEditor
            label="원래 학습 내용"
            value={source}
            preserveOverflow
            onChange={onSource}
          />
          {fieldError("source")}
        </div>
      )}
      <div>
        <MarkdownEditor
          label="문제"
          value={question.prompt}
          limit={Infinity}
          onChange={(prompt) =>
            onChange({
              ...content,
              question: { ...question, prompt },
            })
          }
        />
        {fieldError("prompt")}
      </div>
      {"choices" in question && (
        <fieldset
          aria-describedby={
            errors.choices
              ? "review-choices-error"
              : undefined
          }
          className={styles.stack}
        >
          <legend className="mb-3 font-bold">
            선택지와 정답
          </legend>
          {question.choices.map((choice, index) => (
            <div
              key={choice.id}
              className="grid gap-3 rounded-xl border border-line p-4"
            >
              <TextField
                label={`선택지 ${index + 1}`}
                value={choice.text}
                error={errors.choices}
                onChange={(event) =>
                  onChange({
                    ...content,
                    question: {
                      ...question,
                      choices: question.choices.map(
                        (item) =>
                          item.id === choice.id
                            ? {
                                ...item,
                                text: event.target.value,
                              }
                            : item,
                      ),
                    },
                  })
                }
              />
              {answer.type === "SINGLE_CHOICE" && (
                <Choice
                  label={`정답 선택지 ${index + 1}`}
                  name="correct-choice"
                  value={choice.id}
                  checked={answer.choiceId === choice.id}
                  onChange={() =>
                    onChange({
                      ...content,
                      answer: {
                        ...answer,
                        choiceId: choice.id,
                      },
                    })
                  }
                />
              )}
              {answer.type === "MULTIPLE_CHOICE" && (
                <Checkbox
                  label={`정답 선택지 ${index + 1}`}
                  checked={answer.choiceIds.includes(
                    choice.id,
                  )}
                  onChange={(event) =>
                    onChange({
                      ...content,
                      answer: {
                        ...answer,
                        choiceIds: event.target.checked
                          ? [...answer.choiceIds, choice.id]
                          : answer.choiceIds.filter(
                              (id) => id !== choice.id,
                            ),
                      },
                    })
                  }
                />
              )}
              <Button
                variant="ghost"
                disabled={question.choices.length <= 2}
                onClick={() =>
                  onChange({
                    ...content,
                    question: {
                      ...question,
                      choices: question.choices.filter(
                        ({ id }) => id !== choice.id,
                      ),
                    },
                  })
                }
              >{`선택지 ${index + 1} 삭제`}</Button>
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() =>
              onChange({
                ...content,
                question: {
                  ...question,
                  choices: [
                    ...question.choices,
                    { id: crypto.randomUUID(), text: "" },
                  ],
                },
              })
            }
          >
            선택지 추가
          </Button>
          {fieldError("choices")}
        </fieldset>
      )}
      {answer.type === "TRUE_FALSE" && (
        <fieldset>
          <legend className="mb-3 font-bold">
            OX 정답
          </legend>
          <div className={styles.actions}>
            {[true, false].map((value) => (
              <Choice
                key={String(value)}
                name="correct-ox"
                value={String(value)}
                label={value ? "O" : "X"}
                checked={answer.value === value}
                onChange={() =>
                  onChange({
                    ...content,
                    answer: { ...answer, value },
                  })
                }
              />
            ))}
          </div>
        </fieldset>
      )}
      {answer.type === "SHORT_ANSWER" && (
        <div className="grid grid-cols-[1fr_auto] items-start gap-2">
          <TextField
            label="단답 정답"
            value={answer.text}
            error={errors.answer}
            onChange={(event) =>
              onChange({
                ...content,
                answer: {
                  ...answer,
                  text: event.target.value,
                },
              })
            }
          />
          <Tooltip label="단답 정답 도움말">
            양끝 공백은 제외하고 대소문자를 구분합니다.
          </Tooltip>
        </div>
      )}
      {fieldError("answer")}
      <div>
        <MarkdownEditor
          label="해설"
          value={content.explanation}
          limit={Infinity}
          onChange={(explanation) =>
            onChange({ ...content, explanation })
          }
        />
        {fieldError("explanation")}
      </div>
      <div>
        <TagInput
          value={content.hashtagIds.map(
            (id) =>
              tags.find((tag) => tag.id === id)?.name ?? id,
          )}
          onChange={(names) =>
            onChange({
              ...content,
              hashtagIds: names.map(
                (name) =>
                  tags.find(
                    (tag) =>
                      tag.name.toLowerCase() ===
                        name.toLowerCase() ||
                      tag.id === name,
                  )?.id ?? name,
              ),
            })
          }
        />
        <div className={styles.actions}>
          {tags.map(({ id, name }) => (
            <Button
              key={id}
              size="sm"
              variant="ghost"
              disabled={
                content.hashtagIds.includes(id) ||
                content.hashtagIds.length >= 3
              }
              onClick={() =>
                onChange({
                  ...content,
                  hashtagIds: [...content.hashtagIds, id],
                })
              }
            >
              #{name} 추가
            </Button>
          ))}
        </div>
        {fieldError("tags")}
      </div>
    </div>
  );
}
