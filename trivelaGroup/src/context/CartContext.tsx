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

export interface CartItem {
  id: string; // product slug
  name: string;
  model: string;
  price: number;
  badge: string;
  color: string;
  image?: string;
  qty: number;
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
  removeItem: (id: string, model: string) => void;
  updateQty: (id: string, model: string, qty: number) => void;
  clear: () => void;
}

const STORAGE_KEY = "trivela.cart.v1";
const CartContext = createContext<CartContextValue | null>(null);

function keyOf(id: string, model: string) {
  return `${id}::${model}`;
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
      const k = keyOf(input.id, input.model);
      const idx = prev.findIndex((it) => keyOf(it.id, it.model) === k);
      if (idx === -1) {
        return [...prev, { ...input, qty }];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      return next;
    });
    setBumpKey((k) => k + 1);
  }, []);

  const removeItem = useCallback((id: string, model: string) => {
    const k = keyOf(id, model);
    setItems((prev) => prev.filter((it) => keyOf(it.id, it.model) !== k));
  }, []);

  const updateQty = useCallback((id: string, model: string, qty: number) => {
    const k = keyOf(id, model);
    setItems((prev) => {
      if (qty <= 0) return prev.filter((it) => keyOf(it.id, it.model) !== k);
      return prev.map((it) =>
        keyOf(it.id, it.model) === k ? { ...it, qty } : it
      );
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
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
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
