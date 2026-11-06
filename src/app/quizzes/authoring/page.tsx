import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { AuthoringWorkspace } from "@/features/quiz-authoring/authoring-workspace";

export default function AuthoringPage() {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header
        sections={[
          ["generate", "퀴즈 생성"],
          ["my-quizzes", "내 퀴즈"],
        ]}
      />
      <main className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-10 md:px-12">
        <AuthoringWorkspace />
      </main>
      <Footer note="퀴즈 작성 · Mock 프로토타입" />
    </div>
  );
}
