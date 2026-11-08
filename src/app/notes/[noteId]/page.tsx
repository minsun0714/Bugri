import { Suspense } from "react";
import { ProductLayout } from "@/components/navigation/product-layout";
import { NoteDetailScreen } from "@/components/notes/note-detail-screen";
import { Skeleton } from "@/components/ui";

async function Content({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;

  return <NoteDetailScreen noteId={noteId} />;
}

export default function Page(props: {
  params: Promise<{ noteId: string }>;
}) {
  return (
    <ProductLayout>
      <Suspense fallback={<Skeleton />}>
        <Content {...props} />
      </Suspense>
    </ProductLayout>
  );
}
