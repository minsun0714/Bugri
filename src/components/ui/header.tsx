import { ProductHeader } from "@/components/navigation/product-header";
import Link from "next/link";
import { Badge } from "@/components/ui/index";
import { MobileNavigation } from "@/components/ui/mobile-navigation";

export function ShowcaseHeader({
  sections,
}: {
  sections: string[][];
}) {
  return (
    <header className="relative z-20 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1220px] items-center justify-between gap-4 px-5 py-3.5 sm:py-5 md:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.25 text-[29px] font-extrabold tracking-[-1.5px] text-primary"
          aria-label="Bugri 홈"
        >
          <span className="grid h-7.75 w-7.25 -rotate-8 place-items-center rounded-[10px] bg-primary font-serif text-[23px] font-bold text-lime">
            b.
          </span>
          bugri
          <span className="-ml-1 mt-2 self-start text-[8px] text-coral">
            ●
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-muted sm:block">
            Design workspace · 0.1
          </span>
          <span className="hidden sm:inline-flex">
            <Badge tone="success">● LIVE PREVIEW</Badge>
          </span>
          <MobileNavigation sections={sections} />
        </div>
      </div>
      <nav
        aria-label="컴포넌트 섹션"
        className="mx-auto hidden max-w-[1220px] gap-2 overflow-x-auto px-4 pb-3 sm:flex md:px-10"
      >
        {sections.map(([id, label], i) => (
          <a
            href={id.startsWith("/") ? id : `#${id}`}
            key={id}
            className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2.5 text-xs text-muted transition-colors hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10"
          >
            <span className="font-mono text-[10px] text-primary/60">
              0{i + 1}
            </span>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export function Header({
  sections,
}: {
  sections?: string[][];
}) {
  return sections ? (
    <ShowcaseHeader sections={sections} />
  ) : (
    <ProductHeader />
  );
}
