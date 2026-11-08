import { notFound } from "next/navigation";
import DesignShowcase from "@/components/showcase/design-showcase";

export default function UiPreviewPage() {
  if (process.env.BUGRI_UI_PREVIEW !== "1") notFound();

  return <DesignShowcase />;
}
