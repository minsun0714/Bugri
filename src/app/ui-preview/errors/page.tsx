import { notFound } from "next/navigation";
import { ErrorPreview } from "@/components/errors/error-preview";

export default function ErrorsPreviewPage() {
  if (process.env.BUGRI_UI_PREVIEW !== "1") notFound();

  return <ErrorPreview />;
}
