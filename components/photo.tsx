"use client";

import Image from "next/image";
import { createPngDataUri } from "unlazy/thumbhash";

const EMPTY_IMAGE_URL =
  "https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png";

export function Photo({
  src,
  title,
  thumbhash,
  priority = false,
  sizes = "(min-width: 1536px) 13vw, (min-width: 1280px) 16vw, (min-width: 768px) 22vw, (min-width: 640px) 30vw, 46vw",
}: {
  src: string | null;
  title: string;
  thumbhash: string | null;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src || src === EMPTY_IMAGE_URL) {
    return <MissingCover title={title} />;
  }

  const blur = thumbhash ? createPngDataUri(thumbhash) : undefined;

  return (
    <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-[1.1rem] shadow-[0_12px_30px_-18px_rgba(28,40,33,0.7)] transition duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_22px_38px_-18px_rgba(28,40,33,0.75)]">
      <Image
        alt={`Cover of ${title}`}
        src={src}
        blurDataURL={blur}
        placeholder={blur ? "blur" : "empty"}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/8 ring-inset" />
    </div>
  );
}

function MissingCover({ title }: { title: string }) {
  return (
    <div className="relative flex aspect-[2/3] overflow-hidden rounded-[1.1rem] bg-[#23483e] p-[12%] text-[#f5efdc] shadow-[0_12px_30px_-18px_rgba(28,40,33,0.7)] transition duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_22px_38px_-18px_rgba(28,40,33,0.75)]">
      <div className="absolute inset-y-0 left-[8%] w-px bg-white/15" />
      <div className="absolute inset-x-0 top-[9%] h-px bg-white/15" />
      <div className="absolute inset-x-0 bottom-[9%] h-px bg-white/15" />
      <p className="font-serif text-balance relative my-auto text-lg leading-tight font-semibold sm:text-xl">
        {title}
      </p>
      <span className="absolute right-[12%] bottom-[12%] text-[9px] tracking-[0.2em] uppercase opacity-60">
        Book Inventory
      </span>
    </div>
  );
}
