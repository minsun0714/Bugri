import { LocalizedText } from "@/components/ui/localized-text";
import { ProductLayout } from "@/components/navigation/product-layout";
import { ThemeSettings } from "@/components/ui/theme-settings";
import { pageTitle } from "@/components/ui/styles";

export default function Page() {
  return (
    <ProductLayout>
      <h1 className={pageTitle}>
        <LocalizedText message="화면 설정" />
      </h1>
      <div className="mt-8">
        <ThemeSettings />
      </div>
    </ProductLayout>
  );
}
