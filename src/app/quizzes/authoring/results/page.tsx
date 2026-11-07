import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { AuthoringWorkspace } from "@/features/quiz-authoring/authoring-workspace";

export default function GenerationResultsPage() {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header
        sections={[
          ["/quizzes/authoring", "퀴즈 만들기"],
          ["/quizzes/authoring/manage", "내 퀴즈"],
        ]}
      />
      <main className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-10 md:px-12">
        <AuthoringWorkspace mode="results" />
      </main>
      <Footer note="퀴즈 작성 · Mock 프로토타입" />
    </div>
  );
}
