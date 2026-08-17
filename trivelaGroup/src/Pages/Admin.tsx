import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/cases";
import {
  createProduct,
  deleteProduct,
  fetchAdminProducts,
  fetchCollections,
  setActive,
  updateProduct,
  uploadImage,
  type AdminProduct,
  type Collection,
  type ProductInput,
} from "../data/adminProducts";
import "./Admin.css";

/* ---------- Prijava ---------- */
function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setError(error);
  };

  return (
    <div className="adm-center">
      <form onSubmit={submit} className="adm-card adm-login">
        <h1 className="adm-title">Trivela Admin</h1>
        <p className="adm-sub">Prijava za upravljanje maskicama.</p>

        <label className="adm-label">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="adm-input"
          />
        </label>

        <label className="adm-label">
          Lozinka
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="adm-input"
          />
        </label>

        {error && <p className="adm-error">{error}</p>}

        <button type="submit" disabled={busy} className="adm-btn adm-btn--primary">
          {busy ? "Prijava…" : "Prijavi se"}
        </button>
      </form>
    </div>
  );
}

/* ---------- Prazna forma ---------- */
const emptyForm: ProductInput = {
  name: "",
  collectionId: "",
  price: 0,
  description: "",
  badge: "",
  color: "#7cc4ff",
  imageUrl: null,
};

/* ---------- Forma za maskicu (dodavanje i izmena) ---------- */
function ProductForm({
  collections,
  editing,
  onDone,
  onCancel,
  existingSlugs,
}: {
  collections: Collection[];
  editing: AdminProduct | null;
  onDone: () => void;
  onCancel: () => void;
  existingSlugs: string[];
}) {
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [priceText, setPriceText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Napuni formu kad se menja postojeca; isprazni za novu.
     setState u efektu je ovde namerno — forma se resetuje kad se spolja
     promeni koja se maskica menja (kontrolisan reset, ne izvedeno stanje). */
  useEffect(() => {
    const next: ProductInput = editing
      ? {
          name: editing.name,
          collectionId: editing.collectionId,
          price: editing.price,
          description: editing.description,
          badge: editing.badge,
          color: editing.color,
          imageUrl: editing.imageUrl,
        }
      : { ...emptyForm, collectionId: collections[0]?.id ?? "" };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(next);
    setPriceText(editing ? String(editing.price) : "");
    setError(null);
  }, [editing, collections]);

  const patch = (p: Partial<ProductInput>) => setForm((f) => ({ ...f, ...p }));

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      patch({ imageUrl: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Slika nije otpremljena");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceText.replace(",", "."));
    if (!form.name.trim()) return setError("Ime je obavezno.");
    if (!form.collectionId) return setError("Izaberi kolekciju.");
    if (!Number.isFinite(price) || price <= 0)
      return setError("Cena mora biti broj veći od nule.");

    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, price };
      if (editing) await updateProduct(editing.id, payload);
      else await createProduct(payload, existingSlugs);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Čuvanje nije uspelo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="adm-card adm-form">
      <div className="adm-form-head">
        <h2 className="adm-h2">{editing ? "Izmeni maskicu" : "Nova maskica"}</h2>
        {editing && (
          <button type="button" onClick={onCancel} className="adm-btn adm-btn--ghost">
            Otkaži izmenu
          </button>
        )}
      </div>

      <div className="adm-grid">
        {/* Slika */}
        <div>
          <span className="adm-label-txt">Slika (9:16)</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="adm-drop"
          >
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="" className="adm-thumb" />
            ) : (
              <span className="adm-drop-hint">
                {uploading ? "Otpremam…" : "Klikni da otpremiš sliku"}
              </span>
            )}
          </button>
          {form.imageUrl && (
            <button
              type="button"
              onClick={() => patch({ imageUrl: null })}
              className="adm-btn adm-btn--ghost adm-mt"
            >
              Ukloni sliku
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>

        {/* Polja */}
        <div className="adm-fields">
          <label className="adm-label">
            Ime
            <input
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="adm-input"
              placeholder="npr. Serbia"
            />
          </label>

          <div className="adm-row">
            <label className="adm-label">
              Kolekcija
              <select
                value={form.collectionId}
                onChange={(e) => patch({ collectionId: e.target.value })}
                className="adm-input"
              >
                {collections.length === 0 && <option value="">—</option>}
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="adm-label">
              Cena (€)
              <input
                inputMode="decimal"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                className="adm-input"
                placeholder="24.90"
              />
            </label>
          </div>

          <div className="adm-row">
            <label className="adm-label">
              Boja akcenta
              <span className="adm-color">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="adm-color-swatch"
                />
                <input
                  value={form.color}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="adm-input"
                />
              </span>
            </label>

            <label className="adm-label">
              Badge (ako nema slike)
              <input
                value={form.badge}
                onChange={(e) => patch({ badge: e.target.value })}
                className="adm-input"
                placeholder="🇷🇸 ili RM"
              />
            </label>
          </div>

          <label className="adm-label">
            Opis (opciono)
            <textarea
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              className="adm-input adm-textarea"
              rows={3}
            />
          </label>
        </div>
      </div>

      {error && <p className="adm-error">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="adm-btn adm-btn--primary"
      >
        {saving
          ? "Čuvam…"
          : editing
            ? "Sačuvaj izmene"
            : "Dodaj maskicu"}
      </button>
    </form>
  );
}

/* ---------- Kontrolna tabla ---------- */
function Dashboard() {
  const { signOut } = useAuth();
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        fetchAdminProducts(),
        fetchCollections(),
      ]);
      setProducts(p);
      setCollections(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Učitavanje nije uspelo");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const existingSlugs = useMemo(
    () => (products ?? []).map((p) => p.slug),
    [products]
  );

  const afterSave = () => {
    setEditing(null);
    load();
  };

  const onToggle = async (p: AdminProduct) => {
    await setActive(p.id, !p.active);
    load();
  };

  const onDelete = async (p: AdminProduct) => {
    if (!window.confirm(`Obrisati "${p.name}"? Ovo se ne može vratiti.`)) return;
    await deleteProduct(p.id);
    load();
  };

  return (
    <div className="adm-wrap">
      <header className="adm-top">
        <h1 className="adm-title">Trivela Admin</h1>
        <button onClick={signOut} className="adm-btn adm-btn--ghost">
          Odjavi se
        </button>
      </header>

      <ProductForm
        collections={collections}
        editing={editing}
        onDone={afterSave}
        onCancel={() => setEditing(null)}
        existingSlugs={existingSlugs}
      />

      <section className="adm-card">
        <h2 className="adm-h2">
          Maskice {products ? `(${products.length})` : ""}
        </h2>

        {error && <p className="adm-error">{error}</p>}
        {!products && !error && <p className="adm-sub">Učitavam…</p>}
        {products && products.length === 0 && (
          <p className="adm-sub">Još nema nijedne maskice.</p>
        )}

        <div className="adm-list">
          {(products ?? []).map((p) => (
            <div key={p.id} className={`adm-item${p.active ? "" : " is-off"}`}>
              <div className="adm-item-media" style={{ background: p.color }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" />
                ) : (
                  <span>{p.badge || "?"}</span>
                )}
              </div>
              <div className="adm-item-info">
                <div className="adm-item-name">{p.name}</div>
                <div className="adm-item-meta">
                  {p.collectionName} · {formatPrice(p.price)}
                  {!p.active && <span className="adm-tag">sakriveno</span>}
                </div>
              </div>
              <div className="adm-item-actions">
                <button onClick={() => onToggle(p)} className="adm-btn adm-btn--ghost">
                  {p.active ? "Sakrij" : "Prikaži"}
                </button>
                <button onClick={() => setEditing(p)} className="adm-btn adm-btn--ghost">
                  Izmeni
                </button>
                <button onClick={() => onDelete(p)} className="adm-btn adm-btn--danger">
                  Obriši
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- Ulaz ---------- */
export default function Admin() {
  const { session, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="adm-center">
        <p className="adm-sub">Učitavam…</p>
      </div>
    );
  }

  if (!session) return <LoginForm />;

  if (!isAdmin) {
    return (
      <div className="adm-center">
        <div className="adm-card adm-login">
          <h1 className="adm-title">Nemaš pristup</h1>
          <p className="adm-sub">
            Ovaj nalog nije admin. Dodaj ga u <code>admins</code> tabelu u
            Supabase-u pa se prijavi ponovo.
          </p>
          <button onClick={signOut} className="adm-btn adm-btn--ghost">
            Odjavi se
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
