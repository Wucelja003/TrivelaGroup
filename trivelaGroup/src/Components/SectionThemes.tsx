import { useEffect } from "react";

/**
 * Tema po sekciji.
 *
 * Pozadina sajta je jedna i fiksirana (vidi .site-bg) — ona "pliva" sve
 * vreme. Ova komponenta samo menja NJEN TON u zavisnosti od toga koja je
 * sekcija trenutno na sredini ekrana, upisujuci temu na <html>.
 *
 * Namerno NE koristi IntersectionObserver: u nekim okruzenjima
 * window.innerHeight vrati 0 pa IO nikad ne okine (dokumentovan problem u
 * ovom projektu). Ovde se racuna koja sekcija preseca sredinu ekrana, sa
 * fallback visinom — isto kao reveal animacije drugde na sajtu.
 *
 * Ako mehanizam iz bilo kog razloga zakaze, ostaje pocetna tema — nista se
 * ne sakriva, samo se ton ne menja.
 */
export default function SectionThemes() {
  useEffect(() => {
    const root = document.documentElement;

    const pick = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-theme]")
      );
      if (!sections.length) return;

      const vh =
        window.innerHeight || document.documentElement.clientHeight || 800;
      const mid = vh * 0.45;

      let active = sections[0];
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          active = s;
          break;
        }
        /* Ako je sekcija vec prosla iznad sredine, ona je (za sad) aktivna */
        if (r.top <= mid) active = s;
      }

      const theme = active.dataset.theme || "base";
      if (root.dataset.siteTheme !== theme) root.dataset.siteTheme = theme;
    };

    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    /* Rezerva ako smooth-scroll biblioteka ne salje scroll dogadjaje */
    const poll = window.setInterval(pick, 400);

    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
      window.clearInterval(poll);
      delete root.dataset.siteTheme;
    };
  }, []);

  return null;
}
