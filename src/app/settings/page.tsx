import { ProductLayout } from "@/components/navigation/product-layout";
import { ThemeSettings } from "@/components/ui/theme-settings";

export default function Page() {
  return (
    <ProductLayout>
      <h1 className="text-3xl font-semibold">화면 설정</h1>
      <div className="mt-8">
        <ThemeSettings />
      </div>
    </ProductLayout>
  );
}
