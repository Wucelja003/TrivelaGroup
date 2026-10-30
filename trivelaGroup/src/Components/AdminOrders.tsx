import { useEffect, useMemo, useState } from "react";
import {
  fetchOrders,
  setOrderStatus,
  NEXT_STATUS,
  ORDER_STATUSES,
  STATUS_LABEL,
  type AdminOrder,
  type OrderStatus,
} from "../data/adminOrders";

/*
 * Porudzbine u adminu: spisak, pretraga, filter po statusu i promena statusa.
 * Kartica se otvara na klik — tada se vide artikli, adresa i kontakt.
 */

const rsd = (v: number) =>
  new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 }).format(v) +
  " RSD";

/* "pre 2 h" je citljivije od punog datuma dok porudzbina jos nije otpremljena */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "upravo sada";
  if (min < 60) return `pre ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `pre ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "juče";
  if (d < 7) return `pre ${d} dana`;
  return new Date(iso).toLocaleDateString("sr-RS", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={`ord-pill ord-pill--${status}`}>
      <span className="ord-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

function OrderCard({
  order,
  open,
  onToggle,
  onStatus,
  busy,
}: {
  order: AdminOrder;
  open: boolean;
  onToggle: () => void;
  onStatus: (s: OrderStatus) => void;
  busy: boolean;
}) {
  const next = NEXT_STATUS[order.status];
  const pieces = order.items.reduce((s, it) => s + it.quantity, 0);

  return (
    <article className={`ord-card${open ? " is-open" : ""}`}>
      <button type="button" onClick={onToggle} className="ord-head">
        <span className="ord-head-main">
          <span className="ord-number">{order.number}</span>
          <span className="ord-customer">{order.customerName}</span>
        </span>
        <span className="ord-head-meta">
          <span className="ord-when" title={fullDate(order.createdAt)}>
            {timeAgo(order.createdAt)}
          </span>
          <span className="ord-pieces">
            {pieces} {pieces === 1 ? "kom" : "kom."}
          </span>
          <span className="ord-total">{rsd(order.total)}</span>
          <StatusPill status={order.status} />
          <span className={`ord-chev${open ? " is-open" : ""}`} aria-hidden="true">
            ▾
          </span>
        </span>
      </button>

      {open && (
        <div className="ord-body">
          <div className="ord-cols">
            {/* Artikli */}
            <div>
              <div className="ord-label">Artikli</div>
              <ul className="ord-items">
                {order.items.map((it) => (
                  <li key={it.id} className="ord-item">
                    <span className="ord-item-name">
                      {it.productName}
                      <span className="ord-item-sub">
                        {it.model}
                        {it.collectionName ? ` · ${it.collectionName}` : ""}
                      </span>
                    </span>
                    <span className="ord-item-qty">×{it.quantity}</span>
                    <span className="ord-item-price">{rsd(it.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="ord-sums">
                <span>Međuzbir</span>
                <span>{rsd(order.subtotal)}</span>
                <span>Dostava</span>
                <span>
                  {order.shipping > 0 ? rsd(order.shipping) : "Besplatno"}
                </span>
                <span className="ord-sum-strong">Ukupno</span>
                <span className="ord-sum-strong">{rsd(order.total)}</span>
              </div>
            </div>

            {/* Kupac i isporuka */}
            <div>
              <div className="ord-label">Kupac</div>
              <div className="ord-contact">
                <div className="ord-contact-name">{order.customerName}</div>
                <a href={`mailto:${order.customerEmail}`} className="ord-link">
                  {order.customerEmail}
                </a>
                {order.customerPhone && (
                  <a href={`tel:${order.customerPhone}`} className="ord-link">
                    {order.customerPhone}
                  </a>
                )}
              </div>

              <div className="ord-label ord-label--mt">Isporuka</div>
              <address className="ord-address">
                {order.address || "—"}
                <br />
                {[order.city, order.country].filter(Boolean).join(", ")}
              </address>

              <div className="ord-label ord-label--mt">Poručeno</div>
              <div className="ord-when-full">{fullDate(order.createdAt)}</div>
            </div>
          </div>

          {/* Promena statusa */}
          <div className="ord-actions">
            {next && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onStatus(next)}
                className="adm-btn adm-btn--primary"
              >
                Označi: {STATUS_LABEL[next]}
              </button>
            )}
            <label className="ord-select-wrap">
              <span className="ord-label">Status</span>
              <select
                value={order.status}
                disabled={busy}
                onChange={(e) => onStatus(e.target.value as OrderStatus)}
                className="adm-input ord-select"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </article>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setOrders(await fetchOrders());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Učitavanje nije uspelo");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders?.length ?? 0 };
    for (const s of ORDER_STATUSES) c[s] = 0;
    for (const o of orders ?? []) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  /* Promet se racuna bez otkazanih — to je ono sto je stvarno prodato. */
  const revenue = useMemo(
    () =>
      (orders ?? [])
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + o.total, 0),
    [orders],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (orders ?? []).filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.number.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.customerPhone ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  const changeStatus = async (o: AdminOrder, status: OrderStatus) => {
    setBusyId(o.id);
    /* Prikazi odmah, vrati ako baza odbije — admin ne ceka mrezu */
    setOrders((prev) =>
      (prev ?? []).map((x) => (x.id === o.id ? { ...x, status } : x)),
    );
    try {
      await setOrderStatus(o.id, status);
    } catch (e) {
      setOrders((prev) =>
        (prev ?? []).map((x) =>
          x.id === o.id ? { ...x, status: o.status } : x,
        ),
      );
      setError(e instanceof Error ? e.message : "Status nije sačuvan");
    } finally {
      setBusyId(null);
    }
  };

  if (orders === null && !error) {
    return <p className="adm-sub">Učitavam porudžbine…</p>;
  }

  return (
    <section className="ord-wrap">
      {/* Pregled */}
      <div className="ord-stats">
        <div className="ord-stat">
          <span className="ord-stat-num">{counts.all}</span>
          <span className="ord-stat-lbl">Porudžbina</span>
        </div>
        <div className="ord-stat">
          <span className="ord-stat-num ord-stat-num--accent">
            {counts.pending + counts.paid}
          </span>
          <span className="ord-stat-lbl">Čeka obradu</span>
        </div>
        <div className="ord-stat">
          <span className="ord-stat-num">{counts.shipped}</span>
          <span className="ord-stat-lbl">Poslato</span>
        </div>
        <div className="ord-stat">
          <span className="ord-stat-num">{rsd(revenue)}</span>
          <span className="ord-stat-lbl">Promet</span>
        </div>
      </div>

      {/* Filteri */}
      <div className="ord-toolbar">
        <div className="ord-filters">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`ord-chip${filter === "all" ? " is-on" : ""}`}
          >
            Sve ({counts.all})
          </button>
          {ORDER_STATUSES.filter((s) => counts[s] > 0).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`ord-chip${filter === s ? " is-on" : ""}`}
            >
              {STATUS_LABEL[s]} ({counts[s]})
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Broj, ime, email, telefon…"
          className="adm-input ord-search"
        />
      </div>

      {error && <p className="adm-error">{error}</p>}

      {visible.length === 0 ? (
        <p className="adm-sub ord-empty">
          {counts.all === 0
            ? "Još nema porudžbina. Čim neko poruči, pojaviće se ovde."
            : "Nema porudžbina koje odgovaraju filteru."}
        </p>
      ) : (
        <div className="ord-list">
          {visible.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              open={openId === o.id}
              onToggle={() => setOpenId(openId === o.id ? null : o.id)}
              onStatus={(s) => changeStatus(o, s)}
              busy={busyId === o.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
