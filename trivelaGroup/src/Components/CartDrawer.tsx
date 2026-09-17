import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart, type CartItem } from "../context/CartContext";
import { formatPrice } from "../data/cases";
import "./CartDrawer.css";

/* ---------- Icons ---------- */
function Close({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function Trash({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
    </svg>
  );
}

function CartIcon({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="21" r="1.5" />
      <circle cx="18" cy="21" r="1.5" />
      <path d="M2.5 3h2l2.2 12.4a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21.5 7H6" />
    </svg>
  );
}

/* ---------- Case visual (thumbnail) ---------- */
function ItemVisual({ item }: { item: CartItem }) {
  if (item.image) {
    return (
      <img
        src={item.image}
        alt={item.name}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-full items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 35%, ${item.color}55, #08226c 78%)`,
      }}
    >
      <span className="text-2xl font-bold tracking-tight text-white drop-shadow">
        {item.badge}
      </span>
    </div>
  );
}

/* ---------- Row ---------- */
function CartRow({ item, index }: { item: CartItem; index: number }) {
  const { t } = useTranslation();
  const { updateQty, removeItem } = useCart();

  return (
    <li
      className="cart-row group flex gap-4 py-4"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-mastilo/12">
        <ItemVisual item={item} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-mastilo">
              {item.name}
            </h3>
            <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.15em] text-mastilo/65">
              {item.model}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("drop.cart.remove", { name: item.name })}
            onClick={() => removeItem(item.id, item.model)}
            className="rounded-full p-1.5 text-mastilo/65 transition-colors hover:bg-mastilo/6 hover:text-red-400"
          >
            <Trash />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          {/* Qty control */}
          <div className="inline-flex items-center overflow-hidden rounded-full border border-mastilo/20">
            <button
              type="button"
              aria-label={t("drop.cart.decrease")}
              onClick={() => updateQty(item.id, item.model, item.qty - 1)}
              className="flex h-8 w-8 items-center justify-center text-mastilo/70 transition-colors hover:bg-mastilo/6 hover:text-mastilo"
            >
              −
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-medium text-mastilo">
              {item.qty}
            </span>
            <button
              type="button"
              aria-label={t("drop.cart.increase")}
              onClick={() => updateQty(item.id, item.model, item.qty + 1)}
              className="flex h-8 w-8 items-center justify-center text-mastilo/70 transition-colors hover:bg-mastilo/6 hover:text-mastilo"
            >
              +
            </button>
          </div>

          <p className="text-sm font-bold text-mastilo">
            {formatPrice(item.price * item.qty)}
          </p>
        </div>
      </div>
    </li>
  );
}

/* ---------- Drawer ---------- */
export default function CartDrawer() {
  const { t } = useTranslation();
  const { items, isOpen, close, subtotal, count, clear } = useCart();
  const navigate = useNavigate();

  const goToCheckout = () => {
    close();
    navigate("/checkout");
  };

  return (
    <div
      className={`cart-portal fixed inset-0 z-[60] ${
        isOpen ? "" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-mastilo/45 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label={t("drop.cart.dialog")}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-mastilo/12 bg-white shadow-[-8px_0_60px_rgba(8,34,108,0.18)] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mastilo/12 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-[0.15em] text-mastilo">
              {t("drop.cart.title")}
            </h2>
            <p className="mt-0.5 text-xs text-mastilo/65">
              {/* Mnozina po jeziku: 1 artikal · 2 artikla · 5 artikala */}
              {t("drop.cart.count", { count })}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("drop.cart.close")}
            onClick={close}
            className="rounded-full border border-mastilo/12 p-2 text-mastilo/70 transition-colors hover:border-mastilo hover:text-mastilo"
          >
            <Close />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full border border-mastilo/12 p-6 text-mastilo/45">
              <CartIcon />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-mastilo">
              {t("drop.cart.emptyTitle")}
            </h3>
            <p className="mt-2 max-w-xs text-sm text-mastilo/70">
              {t("drop.cart.emptyBody")}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 rounded-full bg-mastilo px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-mastilo/85"
            >
              {t("drop.cart.continue")}
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-white/5 overflow-y-auto px-6">
              {items.map((item, i) => (
                <CartRow
                  key={`${item.id}::${item.model}`}
                  item={item}
                  index={i}
                />
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-mastilo/12 px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-mastilo/70">
                  {t("drop.cart.subtotal")}
                </span>
                <span className="text-xl font-bold text-mastilo">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={goToCheckout}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-mastilo py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(8,34,108,0.28)] transition-all duration-200 hover:shadow-[0_14px_38px_rgba(8,34,108,0.45)]"
              >
                {t("drop.cart.checkout")}
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </button>

              <div className="mt-3 flex justify-between text-xs text-mastilo/65">
                <button
                  type="button"
                  onClick={close}
                  className="transition-colors hover:text-mastilo"
                >
                  {t("drop.cart.continue")}
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="transition-colors hover:text-red-400"
                >
                  {t("drop.cart.clear")}
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
