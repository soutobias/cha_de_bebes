import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative z-10 -mt-10 border-t border-white/50 bg-[#edf0d3]/60 backdrop-blur-[2px]">
      <div className="relative mx-auto h-15 w-[min(1160px,calc(100%-40px))] max-sm:h-9 max-sm:w-[calc(100%-28px)]">
        <Image
          src="/images/text-footer.png"
          className="absolute top-0 left-1/2 h-auto w-full max-w-160 -translate-x-1/2 -translate-y-[20%]"
          width={2118}
          height={246}
          alt="Texto do rodapé"
        />
      </div>
    </footer>
  );
}
