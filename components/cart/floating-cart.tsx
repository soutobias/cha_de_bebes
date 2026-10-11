"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { CartIcon } from "./cart-icon";
import { useCart } from "./cart-provider";

type Position = { x: number; y: number };

export function FloatingCart() {
  const { itemCount, attentionVersion, isReady } = useCart();
  const [position, setPosition] = useState<Position | null>(null);
  const drag = useRef({
    pointerX: 0,
    pointerY: 0,
    elementX: 0,
    elementY: 0,
    moved: false,
  });

  if (!isReady || itemCount === 0) return null;

  function handlePointerDown(event: PointerEvent<HTMLAnchorElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    drag.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      elementX: rect.left,
      elementY: rect.top,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const deltaX = event.clientX - drag.current.pointerX;
    const deltaY = event.clientY - drag.current.pointerY;
    drag.current.moved ||= Math.abs(deltaX) + Math.abs(deltaY) > 5;

    const buttonSize = event.currentTarget.offsetWidth;
    setPosition({
      x: Math.min(
        window.innerWidth - buttonSize - 8,
        Math.max(8, drag.current.elementX + deltaX),
      ),
      y: Math.min(
        window.innerHeight - buttonSize - 8,
        Math.max(8, drag.current.elementY + deltaY),
      ),
    });
  }

  return (
    <Link
      key={attentionVersion}
      className="cart-attention fixed z-50 grid size-16 cursor-grab touch-none select-none place-items-center rounded-full bg-forest text-white shadow-[0_12px_35px_rgba(37,55,41,.35)] transition-shadow hover:shadow-[0_16px_42px_rgba(37,55,41,.45)] active:cursor-grabbing"
      href="/carrinho"
      aria-label={`Abrir carrinho com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
      style={
        position
          ? { left: position.x, top: position.y }
          : { bottom: 24, right: 24 }
      }
      onClick={(event) => {
        if (drag.current.moved) {
          event.preventDefault();
          drag.current.moved = false;
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) =>
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    >
      <CartIcon className="size-7.5" />
      <span className="absolute -top-1 -right-1 z-10 grid min-h-6 min-w-6 place-items-center rounded-full bg-[#edf0d3] px-1 text-xs font-black text-forest ring-2 ring-white">
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    </Link>
  );
}
