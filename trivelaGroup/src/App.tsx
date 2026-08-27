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
/* Sve strane osim landinga su lazy — svaka ide u svoj chunk, pa glavni bundle
   ostaje mali i pocetno ucitavanje je brzo. Kod strane se skida tek kad se ona
   otvori (Business npr. tek tada povuce three.js/WebGL auroru). */
const Shop = lazy(() => import("./Pages/Shop"));
const Product = lazy(() => import("./Pages/Product"));
const Checkout = lazy(() => import("./Pages/Checkout"));
const Gallery = lazy(() => import("./Pages/Gallery"));
const GetInTouch = lazy(() => import("./Pages/GetInTouch"));
const Admin = lazy(() => import("./Pages/Admin"));
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
  /* Drop: svetla traka; dva dugmeta vode na Business + Group (Drop se krije) */
  if (isDrop(pathname))
    return <LandingNav immediate cart light current="drop" menu={false} />;
  /* Business: tamna traka; dva dugmeta vode na Drop + Group (Business se krije) */
  if (isBusiness(pathname))
    return <LandingNav immediate cart current="business" menu={false} />;
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
            <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/drop" element={<Shop />} />
              <Route path="/business" element={<Business />} />
              <Route path="/drop/:id" element={<Product />} />
              <Route path="/shop" element={<Navigate to="/drop" replace />} />
              <Route path="/shop/:id" element={<ProductRedirect />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/getInTouch" element={<GetInTouch />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
            </Suspense>
            <SiteFooter />
            <SiteNav />
            <SiteCart />
          </ReactLenis>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
