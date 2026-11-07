import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ProductArtwork } from "@/components/shop/artwork";

export function ProductPreview({
  productId,
  name,
}: {
  productId: string;
  name: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (
      !host.current ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting))
          return;
        observer.disconnect();
        import("@/components/shop/zdog/models")
          .then(({ productPreview }) => {
            if (!cancelled)
              setImage(productPreview(productId));
          })
          .catch(() => {
            /* Keep the accessible illustration on unsupported devices. */
          });
      },
      { rootMargin: "100px" },
    );
    observer.observe(host.current);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [productId]);
  return (
    <div ref={host} className="h-full w-full">
      {image ? (
        /* Runtime-rendered data URL; no server image optimization is needed. */ <Image
          unoptimized
          src={image}
          alt={name}
          width={480}
          height={320}
          className="h-full w-full object-contain"
        />
      ) : (
        <ProductArtwork productId={productId} name={name} />
      )}
    </div>
  );
}
