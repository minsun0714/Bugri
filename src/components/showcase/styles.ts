// Static Tailwind utility classes; no runtime CSS generation.
export const styles = {
  wordmark:
    "wordmark flex items-center gap-2.25 font-extrabold text-[29px] tracking-[-1.5px] text-primary",
  "brand-symbol":
    "brand-symbol grid place-items-center w-7.25 h-7.75 [font:700_23px_Georgia] bg-primary text-lime rounded-[10px] [transform:rotate(-8deg)]",
  "brand-dot":
    "brand-dot text-[8px] text-coral ml-[-4px] [align-self:flex-start] mt-2",
  "design-content":
    "design-content max-w-[1220px] m-auto py-0 px-11.5 min-[1450px]:py-0 min-[1450px]:px-15 max-[1100px]:py-0 max-[1100px]:px-7 max-[760px]:py-0 max-[760px]:px-5.5 max-[400px]:py-0 max-[400px]:px-4",
  "design-intro":
    "design-intro flex justify-between items-center py-8.5 px-7 gap-7.5 mt-6 rounded-[24px] bg-[#eee7ff] border border-[#e5d9fb] [&_h1]:[font-size:clamp(25px,_3vw,_38px)] [&_h1]:font-extrabold [&_h1]:tracking-[-1.8px] [&_h1]:mt-5 [&_h1]:mx-0 [&_h1]:mb-4.25 [&_h1]:leading-[1.35] [&_p]:text-[13px] [&_p]:leading-[1.9] [&_p]:text-muted max-[760px]:py-8.75 max-[760px]:px-0 max-[760px]:[&_h1]:text-[27px] max-[760px]:py-6 max-[760px]:px-4.5 max-[760px]:gap-3 max-[760px]:[&_h1]:text-[25px]",
  overline: "[font:9px_monospace] tracking-[2px] text-[#7a57cb] font-semibold",
  "intro-tags":
    "intro-tags flex gap-2 [font:9px_monospace] text-[#9380aa] mt-6.25 flex-wrap max-[760px]:gap-2.5 max-[760px]:text-[8px] [&_span]:py-1.75 [&_span]:px-2.5 [&_span]:bg-[#ffffffa8] [&_span]:rounded-[20px] [&_span]:text-[#7b5e9c]",
  "intro-art":
    "intro-art relative min-w-[210px] grid place-items-center h-47.5 [background:radial-gradient(ellipse,_#e1d4ff_0,_transparent_66%)] max-[1100px]:min-w-[160px] max-[760px]:min-w-[95px] max-[760px]:w-23.75 max-[760px]:h-35 max-[760px]:[&_.bugri-pet]:[zoom:0.7] max-[400px]:hidden",
  "art-caption":
    "art-caption [font:italic_14px_Georgia] text-[#7e51ba] [transform:rotate(-8deg)] absolute bottom-1 max-[760px]:hidden",
  "art-spark":
    "art-spark absolute text-[#ff925c] [&.one]:left-1.5 [&.one]:top-6.75 [&.one]:text-[36px] [&.one]:text-[#fa8d9e] [&.one]:[transform:rotate(12deg)] [&.two]:right-3 [&.two]:bottom-11 [&.two]:text-[30px] [&.two]:text-[#8a59dc] max-[760px]:hidden",
  "bugri-pet":
    'bugri-pet relative w-29 h-25.75 bg-[#c5ed66] border-2 border-[#503a85] [border-radius:45%_45%_38%_38%] [box-shadow:inset_-10px_-7px_0_#a7d34c,_4px_5px_0_#503a851a] [transform:rotate(-7deg)] border-3 [&_>_i]:absolute [&_>_i]:top-[-19px] [&_>_i]:left-6.25 [&_>_i]:w-0.75 [&_>_i]:h-6 [&_>_i]:bg-[#503a85] [&_>_i]:[transform:rotate(-25deg)] [&_>_i:nth-child(2)]:left-auto [&_>_i:nth-child(2)]:right-6.25 [&_>_i:nth-child(2)]:[transform:rotate(25deg)] [&_>_i::before]:[content:""] [&_>_i::before]:absolute [&_>_i::before]:top-[-3px] [&_>_i::before]:left-[-3px] [&_>_i::before]:w-2.25 [&_>_i::before]:h-2.25 [&_>_i::before]:rounded-full [&_>_i::before]:bg-[#503a85] [&.small]:[zoom:0.6]',
  "pet-eye":
    "pet-eye absolute top-9.75 w-1.75 h-2.5 bg-[#463065] rounded-[8px] [&.left]:left-8 [&.right]:right-8",
  "pet-mouth":
    "pet-mouth absolute top-13.5 left-12.25 w-3.5 h-2.25 border-b-2 border-b-[#463065] rounded-full",
  "pet-cheek":
    "pet-cheek absolute top-13.5 left-5.25 w-3.75 h-1.75 rounded-full bg-[#ff969e] [box-shadow:54px_0_#ff969e]",
  "preview-note":
    "preview-note flex items-center gap-2.25 border-t border-t-line border-b border-b-line py-3.75 px-0 text-[11px] text-[#6c5487] mt-6 [&_>_span:last-child]:ml-auto [&_>_span:last-child]:text-[#8e7d9e] [&_>_span:last-child]:text-[10px] max-[760px]:[&_>_span:last-child]:hidden",
  "status-dot": "status-dot w-1.25 h-1.25 rounded-full bg-[#8054dc]",
  "showcase-section":
    "showcase-section pt-10.75 scroll-mt-[20px] max-[760px]:pt-8",
  "section-title":
    "section-title flex gap-3.75 items-start mb-5 [&_>_span]:[font:10px_monospace] [&_>_span]:text-[#7750bd] [&_>_span]:pt-1 [&_>_span]:bg-[#eaddff] [&_>_span]:p-1.75 [&_>_span]:rounded-[8px] [&_>_span]:[transform:rotate(-5deg)] [&_h2]:text-[19px] [&_h2]:tracking-[-0.5px] [&_p]:text-[11px] [&_p]:text-muted [&_p]:mt-2 [&_p]:leading-[1.7] max-[760px]:[&_p]:text-[11px]",
  "grid-two":
    "grid-two grid [grid-template-columns:1fr_1fr] gap-4.5 max-[760px]:[grid-template-columns:1fr]",
  "foundation-grid":
    "foundation-grid grid [grid-template-columns:1.25fr_1fr] gap-4.5 max-[1100px]:[grid-template-columns:1fr]",
  "grid-three":
    "grid-three items-start grid [grid-template-columns:repeat(3,_1fr)] gap-4.5 max-[1100px]:[grid-template-columns:1fr_1fr] max-[1100px]:[&_>_.ui-card:last-child]:[grid-column:1/-1] max-[1100px]:[&_>_.ui-card:last-child]:grid max-[1100px]:[&_>_.ui-card:last-child]:[grid-template-columns:180px_1fr] max-[1100px]:[&_>_.ui-card:last-child]:gap-x-6.25 max-[1100px]:[&_.product-art]:[grid-row:1/4] max-[1100px]:[&_.product-art]:h-full max-[1100px]:[&_.product-title]:mt-0 max-[1100px]:[&_.card-footer]:mt-2.5 max-[760px]:[grid-template-columns:1fr] max-[760px]:[&_>_.ui-card:last-child]:block max-[760px]:[&_>_.ui-card:last-child]:[grid-column:auto] max-[760px]:[&_.product-art]:h-40 max-[760px]:[&_.product-title]:mt-5",
  "sample-title": "sample-title text-xs font-semibold text-muted mb-5",
  swatches:
    "swatches grid [grid-template-columns:repeat(5,_1fr)] gap-2.5 [&_>_div]:flex [&_>_div]:flex-col [&_span]:h-14.5 [&_span]:border [&_span]:border-[#00000007] [&_span]:rounded-[12px] [&_span]:mb-2.75 [&_strong]:[font:10px_sans-serif] [&_strong]:font-semibold [&_small]:[font:9px_monospace] [&_small]:text-[#9982ad] [&_small]:mt-1.25 max-[400px]:gap-1.75 [&_>_div:nth-child(2)_span]:[transform:rotate(3deg)] [&_>_div:nth-child(4)_span]:[transform:rotate(-3deg)]",
  "type-display": "type-display text-[27px] tracking-[-1px] font-[650]",
  "type-body": "type-body text-[12px] text-muted my-3.5 mx-0",
  "type-meta": "type-meta [font:9px_monospace] text-[#9982ad]",
  row: "row flex gap-2.25 items-center flex-wrap",
  spaced: "spaced mt-5",
  stack: "stack flex flex-col gap-4.5",
  "card-top": "card-top flex items-center justify-between gap-2",
  "card-footer":
    "card-footer flex items-center justify-between gap-2 border-t border-t-line mt-5.5 pt-4.25",
  "content-title":
    "content-title text-[18px] leading-[1.6] tracking-[-0.5px] mt-5 mx-0 mb-5",
  "body-copy": "body-copy text-[12px] text-muted leading-[1.9] mb-5",
  tiny: "tiny text-[10px] text-[#887398]",
  person: "person flex items-center gap-1.75 text-[11px]",
  "product-art":
    "product-art h-33.5 bg-[#ffe7ee] rounded-[14px] relative grid place-items-center [&_>_.ui-badge]:absolute [&_>_.ui-badge]:top-2.5 [&_>_.ui-badge]:left-2.5 [&_>_.ui-badge]:text-[8px]",
  "product-title": "product-title text-[16px] mt-4.75 mx-0 mb-1.75",
  plant:
    "plant relative w-16.5 h-25 [&_i]:absolute [&_i]:bottom-0 [&_i]:left-3 [&_i]:w-10.75 [&_i]:h-10.75 [&_i]:bg-[#c98061] [&_i]:[border-radius:4px_4px_15px_15px] [&_i]:border-t-6 [&_i]:border-t-[#d5977c] [&_i]:[box-shadow:inset_-8px_0_#b76d52] [&_span]:absolute [&_span]:bottom-9.5 [&_span]:w-5.5 [&_span]:h-12 [&_span]:bg-[#7e9664] [&_span]:[border-radius:100%_0_100%_0] [&_span]:left-3.75 [&_span]:[transform:rotate(-30deg)] [&_span:nth-child(2)]:left-8 [&_span:nth-child(2)]:[transform:rotate(20deg)] [&_span:nth-child(2)]:bottom-10.5 [&_span:nth-child(2)]:bg-[#536f48] [&_span:nth-child(3)]:left-6.5 [&_span:nth-child(3)]:[transform:rotate(-5deg)] [&_span:nth-child(3)]:bottom-9.5 [&_span:nth-child(3)]:h-15 [&_span:nth-child(3)]:bg-[#6d8553]",
  options:
    "options [border:0] grid gap-2.25 mt-5 [&_legend]:text-[10px] [&_legend]:text-muted [&_legend]:mb-3.25",
  "tab-example":
    "tab-example flex gap-2.5 items-center justify-between text-[11px] max-[760px]:flex-wrap",
  "desk-card":
    "desk-card [&.desk-card]:bg-[#eee4ff] flex justify-between items-center gap-5 min-h-[179px] [&_h3]:text-[19px] [&_h3]:tracking-[-0.7px] [&_h3]:mt-3.5 [&_h3]:mx-0 [&_h3]:mb-2.25 [&_p]:text-[11px] [&_p]:text-muted [&_.bugri-pet]:shrink-0 max-[400px]:gap-2.5 max-[400px]:[&_h3]:text-[16px]",
  "modal-actions": "modal-actions justify-end",
} as const;
