import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ReactLenis } from "lenis/react";
/* Lenis-ov stylesheet je OBAVEZAN. Bez njega se klase (lenis, lenis-smooth)
   postavljaju na <html> ali nemaju nikakav efekat, pa skrol ostaje nativan —
   izgleda kao da smooth scroll ne radi iako je biblioteka ucitana. */
import "lenis/dist/lenis.css";
import LenisScrollSync from "./Components/LenisScrollSync";
import HashScroll from "./Components/HashScroll";
import ScrollToTop from "./Components/ScrollToTop";
import LandingNav from "./Components/LandingNav";
import Intro from "./Components/Intro";
import CartDrawer from "./Components/CartDrawer";
import Home from "./Pages/Home";
import Shop from "./Pages/Shop";
import Product from "./Pages/Product";
import Checkout from "./Pages/Checkout";
import Gallery from "./Pages/Gallery";
import GetInTouch from "./Pages/GetInTouch";
import Admin from "./Pages/Admin";
/* Business povlaci three.js (WebGL aurora) — lazy da ne uleti u glavni bundle
   i ne uspori ostale strane; three se skida tek kad se otvori /business. */
const Business = lazy(() => import("./Pages/Business"));
import Footer from "./Components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

/* Sve strane nose istu traku: logo levo, dva dugmeta na sredini, korpa i
   meni desno. Stari Header vise ne postoji. */
const isDrop = (p: string) => p === "/drop" || p.startsWith("/drop/");
const isBusiness = (p: string) => p === "/business";

/* Admin je zaseban alat — bez trake, footera, korpe i uvodne animacije. */
const isBare = (p: string) => p.startsWith("/admin");

/* Obelezi <html> da CSS zna koja je tema: drop = svetla (bela podloga),
   business = tamno siva (aurora). Ostalo = podrazumevano teget. */
function PageTheme() {
  const { pathname } = useLocation();
  useEffect(() => {
    const el = document.documentElement;
    if (isDrop(pathname)) el.dataset.page = "drop";
    else if (isBusiness(pathname)) el.dataset.page = "business";
    else delete el.dataset.page;
    return () => {
      delete el.dataset.page;
    };
  }, [pathname]);
  return null;
}

function SiteNav() {
  const { pathname } = useLocation();
  if (isBare(pathname)) return null;
  /* Landing ceka sekvencu (intro -> hero -> traka); svuda drugde ulazi odmah.
     Drop je svetla tema, nema meni i drugo dugme vraca na Trivela Group. */
  if (pathname === "/") return <LandingNav />;
  if (isDrop(pathname))
    return <LandingNav immediate cart light backToGroup menu={false} />;
  /* Business: tamna traka (zeleni akcenat), drugo dugme vraca na Trivela Group */
  if (isBusiness(pathname))
    return <LandingNav immediate cart backToGroup menu={false} />;
  return <LandingNav immediate cart />;
}

/* Footer stoji svuda osim na admin alatu */
function SiteFooter() {
  const { pathname } = useLocation();
  if (isBare(pathname)) return null;
  return <Footer />;
}

/* Fioka korpe — svuda osim na admin alatu (tamo nema kupovine) */
function SiteCart() {
  const { pathname } = useLocation();
  if (isBare(pathname)) return null;
  return <CartDrawer />;
}

/* Prodavnica se preselila sa /shop na /drop (Trivela Drop). Stare rute
   ostaju kao preusmerenje da vec podeljene veze ne puknu. */
function ProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/drop/${id}`} replace />;
}

/* Uvodna animacija — samo na landingu ("/"). */
function SiteIntro() {
  const { pathname } = useLocation();
  if (pathname !== "/") return null;
  return <Intro />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ReactLenis root options={{ lerp: 0.1 }}>
            <LenisScrollSync />
            <ScrollToTop />
            <HashScroll />
            <SiteIntro />
            <PageTheme />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/drop" element={<Shop />} />
              <Route
                path="/business"
                element={
                  <Suspense fallback={null}>
                    <Business />
                  </Suspense>
                }
              />
              <Route path="/drop/:id" element={<Product />} />
              <Route path="/shop" element={<Navigate to="/drop" replace />} />
              <Route path="/shop/:id" element={<ProductRedirect />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/getInTouch" element={<GetInTouch />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
            <SiteFooter />
            <SiteNav />
            <SiteCart />
          </ReactLenis>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
