"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { normalizeCat, normalizeLang, synthesizeSmartReview } from "@/lib/reviews";
import {
  categories,
  googleReviewUrl,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  shop,
  vcard,
  whatsappUrl,
} from "@/lib/shop";

const USED_IDS_KEY = `mobile-exchange-wala-${shop.area.toLowerCase().replace(/\s+/g, "-")}-used-reviews`;
const USED_TEXTS_KEY = `mobile-exchange-wala-${shop.area.toLowerCase().replace(/\s+/g, "-")}-used-review-texts`;

const copy = {
  en: {
    lbl: "Customer Review",
    sub: "Tap a topic & share your experience",
    copy: "Copy & Paste on Google",
    done: "Copied! Opening Google…",
    hint: "Tap to copy your review, then paste it on Google.",
    hint2: "Copied! Paste it in the review box on Google.",
    disc: "You can edit the review before posting.",
  },
  hi: {
    lbl: "Aapka Review",
    sub: "Apna experience share karein",
    copy: "Copy Karein & Google Pe Paste Karein",
    done: "Copy ho gaya! Google khul raha hai…",
    hint: "Review copy karein, phir Google par paste karein.",
    hint2: "Copy ho gaya! Google ke review box mein paste karein.",
    disc: "Post karne se pehle ise apne hisaab se badal sakte hain.",
  },
  mr: {
    lbl: "तुमचा रिव्ह्यू",
    sub: "तुमचा अनुभव शेअर करा",
    copy: "कॉपी करा आणि Google वर पेस्ट करा",
    done: "कॉपी झाले! Google उघडत आहे…",
    hint: "रिव्ह्यू कॉपी करण्यासाठी टॅप करा, नंतर Google वर पेस्ट करा.",
    hint2: "कॉपी झाले! Google च्या रिव्ह्यू बॉक्समध्ये पेस्ट करा.",
    disc: "पोस्ट करण्यापूर्वी तुमच्या अनुभवानुसार यात बदल करू शकता.",
  },
};

type ReviewPayload = { review: string; id: string; source: "ai" };

function readList(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, items: string[], limit: number) {
  try {
    const next = [...new Set(items)].slice(-limit);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore storage quota errors */
  }
}

export default function Page() {
  const [cat, setCat] = useState("all");
  const [lang, setLang] = useState<"en" | "hi" | "mr">("en");
  const [review, setReview] = useState("");
  const [shown, setShown] = useState("");
  const [hint, setHint] = useState(copy.en.hint);
  const [copied, setCopied] = useState(false);
  const [spin, setSpin] = useState(false);
  const [typing, setTyping] = useState(false);
  const token = useRef(0);
  const raf = useRef<number | null>(null);
  const t = copy[lang];

  const typeText = useCallback((text: string) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const dur = Math.min(1300, Math.max(450, text.length * 8));
    let t0: number | null = null;
    setTyping(true);
    const step = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur);
      setShown(text.slice(0, Math.floor(p * text.length)));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else {
        setShown(text);
        setTyping(false);
        raf.current = null;
      }
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  const generateNext = useCallback((): ReviewPayload => {
    const usedIds = new Set(readList(USED_IDS_KEY));
    const usedTexts = readList(USED_TEXTS_KEY);
    const result = synthesizeSmartReview(
      normalizeCat(cat),
      normalizeLang(lang === "hi" ? "hinglish" : lang === "mr" ? "mr" : "en"),
      usedIds,
      usedTexts
    );
    writeList(USED_IDS_KEY, [...usedIds, result.id], 500);
    writeList(USED_TEXTS_KEY, [...usedTexts, result.text], 80);
    return { review: result.text, id: result.id, source: "ai" };
  }, [cat, lang]);

  const load = useCallback(() => {
    const my = ++token.current;
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    setTyping(false);
    setCopied(false);
    setHint(copy[lang].hint);

    const data = generateNext();
    if (my !== token.current) return;
    setReview(data.review);
    typeText(data.review);
  }, [lang, generateNext, typeText]);

  useEffect(() => {
    load();
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
    };
  }, [load]);

  function saveContact() {
    const url = URL.createObjectURL(new Blob([vcard()], { type: "text/vcard" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${shop.contactName.replace(/[^A-Za-z0-9]+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  /**
   * 100% Reliable Copy + Open Google Review on both iOS (Safari / in-app browsers) & Android:
   * - Uses a real `<a href={googleReviewUrl()}>` element so iOS Safari, Instagram in-app browser,
   *   and WhatsApp in-app browser NEVER block navigation.
   * - Copies review text synchronously inside the exact tap gesture via `execCommand('copy')`
   *   plus `navigator.clipboard.writeText` before the native anchor navigation proceeds.
   */
  function onCopy() {
    let syncCopied = false;
    try {
      const ta = document.createElement("textarea");
      ta.value = review;
      ta.setAttribute("readonly", "");
      ta.style.cssText =
        "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, review.length);
      syncCopied = document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {
      /* fallback to clipboard API below */
    }

    if (!syncCopied && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(review).catch(() => {});
    }

    setCopied(true);
    setHint(t.hint2);
  }

  const phoneReady = !shop.phoneTel.includes("X");
  const wa = whatsappUrl();
  const reviewUrl = googleReviewUrl();

  return (
    <>
      <div className="bar" />

      <main className="page">
        {/* Clean Brand Hero Stage Designed Specifically for the PNG Logo */}
        <header className="hero-stage">
          <Logo />

          <h1 className="sr">{shop.name}</h1>

          <div className="stars" aria-label="5 out of 5 stars">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
          <p className="sub">{t.sub}</p>
        </header>

        {/* Original Clean Category Filter Chips */}
        <div className="cats">
          <div className="row">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip${cat === c.id ? " on" : ""}`}
                onClick={() => setCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Original Language Selector */}
        <div className="lang">
          <button
            type="button"
            className={lang === "en" ? "on" : ""}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            type="button"
            className={lang === "hi" ? "on" : ""}
            onClick={() => setLang("hi")}
          >
            Hinglish
          </button>
          <button
            type="button"
            className={lang === "mr" ? "on" : ""}
            onClick={() => setLang("mr")}
          >
            मराठी
          </button>
        </div>

        {/* Main Review Card */}
        <section className="card" aria-label="Review generator">
          <div className="lbl">
            <span>{t.lbl}</span>
            <span className="verified-tag">5.0 ★ Google Review</span>
          </div>

          <div id="rv" className={typing ? "typing" : ""}>
            {shown}
          </div>

          <div className="div" />

          <div className="btns">
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`cta${copied ? " ok" : ""}`}
              onClick={onCopy}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copied ? t.done : t.copy}</span>
            </a>

            <button
              type="button"
              className={`new${spin ? " spin" : ""}`}
              title="Generate another review"
              aria-label="Generate another review"
              onClick={() => {
                setSpin(true);
                setTimeout(() => setSpin(false), 450);
                load();
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>

          <div className="hint">{hint}</div>
          <div className="disc">{t.disc}</div>
        </section>

        {/* Clean 3-Pillar Highlight Strip */}
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-num">Upto 50%</span>
            <span className="stat-lbl">Unused Demo Discount</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">Instant ₹</span>
            <span className="stat-lbl">Cash on Old Phones</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">6 Months</span>
            <span className="stat-lbl">Brand Warranty</span>
          </div>
        </div>

        {/* Social & Quick Actions */}
        <nav className="icons" aria-label="Quick contact links">
          <a className="ib" href={shop.instagram} target="_blank" rel="noopener noreferrer">
            <i>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </i>
            Instagram
          </a>

          <a className="ib" href={wa} target={wa === "#" ? undefined : "_blank"} rel="noopener noreferrer">
            <i>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.85-1.47A10 10 0 1 0 12 2zm0 18.15a8.1 8.1 0 0 1-4.15-1.14l-.298-.177-3.08.933.94-2.98-.194-.307A8.15 8.15 0 1 1 12 20.15z" />
              </svg>
            </i>
            WhatsApp
          </a>

          <a className="ib" href={phoneReady ? `tel:${shop.phoneTel}` : "#"}>
            <i>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </i>
            Call Us
          </a>

          <a className="ib" href={mapsDirectionsUrl()} target="_blank" rel="noopener noreferrer">
            <i>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </i>
            Directions
          </a>

          <button type="button" className="ib" onClick={saveContact} aria-label="Save Contact">
            <i>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </i>
            Save Contact
          </button>
        </nav>

        {/* Bottom Grid: What We Offer + Store Location */}
        <div className="bottom-grid">
          <div className="info">
            <div className="info-badge">BUY ● SELL ● EXCHANGE</div>
            <h3>Why Choose Us</h3>
            <ul>
              {shop.offers.map((item) => (
                <li key={item}>
                  <span className="chk">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="map-card">
            <div className="loc-top">
              <div className="loc-badge-row">
                <span className="info-badge">VISIT OUR SHOWROOM</span>
                <span className="open-pill">
                  <span className="open-dot" />
                  Open Daily
                </span>
              </div>

              <div className="loc-header">
                <div className="loc-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="loc-meta">
                  <h3>{shop.area}, {shop.city}</h3>
                  <p>{shop.address}</p>
                </div>
              </div>
            </div>

            <div className="loc-info-grid">
              <a href={`tel:${shop.phoneTel}`} className="loc-info-item">
                <span className="lii-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="lii-text">
                  <small>Call / WhatsApp</small>
                  <strong>{shop.phoneDisplay}</strong>
                </span>
              </a>

              <div className="loc-info-item">
                <span className="lii-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <span className="lii-text">
                  <small>Store Timings</small>
                  <strong>10:00 AM – 10:00 PM</strong>
                </span>
              </div>
            </div>

            <div className="map">
              <iframe
                src={mapsEmbedUrl()}
                title={`${shop.name} ${shop.area} Location`}
                loading="lazy"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <div className="loc-actions">
              <a className="loc-btn primary" href={mapsDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                Get Directions
              </a>
              <a className="loc-btn secondary" href={`tel:${shop.phoneTel}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call Store
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Single-Line Clean Footer as Requested */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand-row">
            <strong>{shop.name}</strong>
            <span>•</span>
            <span>
              {shop.area}, {shop.city}
            </span>
            <span>•</span>
            <a href={`tel:${shop.phoneTel}`}>{shop.phoneDisplay}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
