import { ProductLayout } from "@/components/navigation/product-layout";
import { AuthoringWorkspace } from "@/features/quiz-authoring/authoring-workspace";

export default function AuthoringPage() {
  return (
    <ProductLayout>
      <AuthoringWorkspace />
    </ProductLayout>
  );
}
