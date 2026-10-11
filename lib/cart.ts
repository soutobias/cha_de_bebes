export const CART_STORAGE_KEY = "cha-dos-gemeos-cart";
export const MAX_ITEM_QUANTITY = 20;

export type CartItem = {
  id: number;
  quantity: number;
};

export type Gift = {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  link: string;
};

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
