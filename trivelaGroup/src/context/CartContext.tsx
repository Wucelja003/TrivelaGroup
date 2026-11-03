import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { GIFT_BOX_PRICE } from "../data/cases";

export interface CartItem {
  id: string; // product slug
  name: string;
  model: string;
  price: number;
  badge: string;
  color: string;
  image?: string;
  qty: number;
  /* Poklon kutija uz ovu maskicu (doplata GIFT_BOX_PRICE po komadu) */
  giftBox?: boolean;
}

/* Cena jedne stavke sa svim doplatama */
export function lineUnitPrice(it: Pick<CartItem, "price" | "giftBox">) {
  return it.price + (it.giftBox ? GIFT_BOX_PRICE : 0);
}

interface AddItemInput extends Omit<CartItem, "qty"> {
  qty?: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  bumpKey: number; // menja se svaki put kad se doda stavka — okida animaciju na ikoni
  open: () => void;
  close: () => void;
  addItem: (input: AddItemInput) => void;
  removeItem: (item: CartItem) => void;
  updateQty: (item: CartItem, qty: number) => void;
  clear: () => void;
}

const STORAGE_KEY = "trivela.cart.v1";
const CartContext = createContext<CartContextValue | null>(null);

/* Ista maskica sa kutijom i bez nje su DVE stavke — zato kutija ulazi
   u kljuc, inace bi se spojile i doplata bi se izgubila. */
function keyOf(it: Pick<CartItem, "id" | "model" | "giftBox">) {
  return `${it.id}::${it.model}::${it.giftBox ? "box" : "plain"}`;
}

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is CartItem =>
        !!x &&
        typeof x.id === "string" &&
        typeof x.model === "string" &&
        typeof x.price === "number" &&
        typeof x.qty === "number"
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage());
  const [isOpen, setIsOpen] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const firstRender = useRef(true);

  // Persist to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Zaključaj scroll dok je drawer otvoren
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Zatvori na Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const addItem = useCallback((input: AddItemInput) => {
    const qty = Math.max(1, input.qty ?? 1);
    setItems((prev) => {
      const k = keyOf(input);
      const idx = prev.findIndex((it) => keyOf(it) === k);
      if (idx === -1) {
        return [...prev, { ...input, qty }];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      return next;
    });
    setBumpKey((k) => k + 1);
  }, []);

  const removeItem = useCallback((item: CartItem) => {
    const k = keyOf(item);
    setItems((prev) => prev.filter((it) => keyOf(it) !== k));
  }, []);

  const updateQty = useCallback((item: CartItem, qty: number) => {
    const k = keyOf(item);
    setItems((prev) => {
      if (qty <= 0) return prev.filter((it) => keyOf(it) !== k);
      return prev.map((it) => (keyOf(it) === k ? { ...it, qty } : it));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Prvi render ne treba da "bump"-uje (bump je za novo dodavanje)
  useEffect(() => {
    firstRender.current = false;
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, it) => n + it.qty, 0);
    const subtotal = items.reduce((s, it) => s + lineUnitPrice(it) * it.qty, 0);
    return {
      items,
      count,
      subtotal,
      isOpen,
      bumpKey,
      open,
      close,
      addItem,
      removeItem,
      updateQty,
      clear,
    };
  }, [items, isOpen, bumpKey, open, close, addItem, removeItem, updateQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
