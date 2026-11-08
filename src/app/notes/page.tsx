import { Suspense } from "react";
import { ProductLayout } from "@/components/navigation/product-layout";
import { NotesListScreen } from "@/components/notes/notes-list-screen";
import { Skeleton } from "@/components/ui";

export default function Page() {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <NotesListScreen />
      </Suspense>
    </ProductLayout>
  );
}
