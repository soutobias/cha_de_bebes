import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/50 bg-[#edf0d3]/65 py-3 backdrop-blur-xs">
      <div className="mx-auto flex w-[min(1160px,calc(100%-40px))] items-center justify-center gap-2 text-center text-sm text-[#53604f] max-sm:w-[calc(100%-28px)]">
        <Image
          src="/images/text-footer.png"
          className="h-auto w-full max-w-160"
          width={2172}
          height={50}
          alt="Texto do rodapé"
        />
      </div>
    </footer>
  );
}
