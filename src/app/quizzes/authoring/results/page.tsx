import { ProductLayout } from "@/components/navigation/product-layout";
import { AuthoringWorkspace } from "@/features/quiz-authoring/authoring-workspace";

export default function GenerationResultsPage() {
  return (
    <ProductLayout>
      <AuthoringWorkspace mode="results" />
    </ProductLayout>
  );
}
