import Image from "next/image";
import type { ReactNode } from "react";

type DetailCardProps = {
  label: string;
  title: string;
  text: string;
  image: string;
  children?: ReactNode;
  className?: string;
};

export function DetailCard({
  label,
  title,
  text,
  image,
  children,
  className = "",
}: DetailCardProps) {
  return (
    <article
      className={`flex min-h-44 items-center gap-6 rounded-2xl border border-forest/15 bg-[#fffef7]/85 px-7 py-5 shadow-[0_10px_30px_rgba(58,77,50,.08)] backdrop-blur-[2px] max-sm:min-h-0 max-sm:flex-col max-sm:gap-1.5 max-sm:rounded-xl max-sm:px-3 max-sm:py-4 max-sm:text-center ${className}`}
    >
      <Image
        src={image}
        className="size-28 shrink-0 object-contain max-sm:size-10"
        width={224}
        height={224}
        alt=""
        aria-hidden="true"
      />
      <div className="min-w-0 max-sm:w-full">
        <span className="font-display text-2xl leading-none font-semibold text-forest max-sm:text-base">
          {label}
        </span>
        <h3 className="my-2 text-base leading-snug font-medium text-ink max-sm:my-1.5 max-sm:text-sm">
          {title}
        </h3>
        <p className="m-0 text-sm text-muted max-sm:text-xs">{text}</p>
        {children}
      </div>
    </article>
  );
}
