import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { FaInstagram, FaTiktok } from "react-icons/fa6";
import "./Footer.css";

const socials = [
  {
    label: "Instagram",
    Icon: FaInstagram,
    href: "https://www.instagram.com/trivelagroup",
  },
  {
    label: "TikTok",
    Icon: FaTiktok,
    href: "https://www.tiktok.com/@trivelagroup",
  },
];

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/#what-we-do", label: "What we do" },
  { to: "/gallery", label: "Gallery" },
  { to: "/drop", label: "Trivela Drop" },
  { to: "/getInTouch", label: "Get In Touch" },
];

export default function Footer() {
  const { pathname } = useLocation();
  const onDrop = pathname === "/drop" || pathname.startsWith("/drop/");

  return (
    <footer className="tg-footer relative z-[2] mt-24 w-full overflow-hidden border-t px-4 pb-10 pt-14 sm:px-6 lg:px-8">
      {/* Suptilan zeleni glow iza wordmark-a */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 f-glow" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-8"
        >
          {/* Brand */}
          <div className="flex items-start gap-5">
            <Link
              to="/"
              className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border f-logo-ring"
            >
              <img
                src="/Trivela_Logo.svg"
                alt="Trivela Group"
                className="f-logo h-12 w-12 object-contain"
              />
            </Link>
            <h3 className="text-2xl font-semibold uppercase leading-[1.05] tracking-tight f-ink sm:text-3xl">
              Trivela
              <br />
              <span className="f-accent">{onDrop ? "Drop" : "Group"}</span>
            </h3>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-[0.2em] f-accent">
              Navigation
            </h4>
            <ul className="flex flex-col gap-2 text-xl f-ink sm:text-2xl">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="transition-colors duration-300 hover:f-accent-h"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Who We Are */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-[0.2em] f-accent">
              Who We Are
            </h4>
            <p className="text-xl leading-tight f-ink sm:text-2xl">
              A marketing, PR &amp; consulting studio
              <br />
              crafting football cases with care
            </p>
            <div className="flex flex-col gap-1 text-sm f-muted">
              <a
                href="mailto:info@trivelagroup.com"
                className="transition-colors duration-300 hover:f-accent-h"
              >
                info@trivelagroup.com
              </a>
              <a
                href="mailto:contact@trivelagroup.com"
                className="transition-colors duration-300 hover:f-accent-h"
              >
                contact@trivelagroup.com
              </a>
            </div>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-[0.2em] f-accent">
              Socials
            </h4>
            <div className="flex items-center gap-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="f-accent transition-all duration-300 hover:scale-110 hover:[filter:drop-shadow(0_0_14px_rgba(150,255,0,0.7))]"
                >
                  <s.Icon className="h-10 w-10" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom row — centriran legal tekst */}
        <div className="mt-16 flex flex-col items-center gap-2 border-t f-rule pt-8 text-center text-xs f-muted sm:text-sm">
          <p>
            © {new Date().getFullYear()} • Trivela Group • Marketing, PR &amp;
            consulting.
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/terms"
              className="transition-colors duration-300 hover:f-accent-h"
            >
              Privacy Policy
            </Link>
            <span className="f-faint">•</span>
            <Link
              to="/terms"
              className="transition-colors duration-300 hover:f-accent-h"
            >
              Terms of Service
            </Link>
            <span className="f-faint">•</span>
            <Link
              to="/terms"
              className="transition-colors duration-300 hover:f-accent-h"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
