import { useEffect } from "react";
import "./nav.css";

const Nav = () => {
  useEffect(() => {
    const header = document.getElementById("siteHeader");
    if (!header) return;

    const COLLAPSE_AT = 80; // px

    // Trigger enter animations after first paint
    requestAnimationFrame(() => header.classList.add("isEntered"));

    let ticking = false;

    const update = () => {
      header.classList.toggle("isCollapsed", window.scrollY > COLLAPSE_AT);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="siteHeader" id="siteHeader">
      {/* This is the small sticky bar that appears after scroll */}
      <div className="compactBar" role="navigation" aria-label="Site">
        <div className="compactInner">
          <a className="brand" href="/" aria-label="Home">
            <span className="brandMark" aria-hidden="true">◎</span>
            <span className="brandText">Hippohonk</span>
          </a>

          <nav className="nav">
            <a className="navLink" href="/?tab=festivals">Festivals</a>
            <a className="navLink" href="/?tab=bands">Bands</a>
            <a className="navLink" href="/?tab=about">About</a>
          </nav>

          <div className="actions">
            <button className="btn" type="button">Sign in</button>
          </div>
        </div>
      </div>

      {/* Optional: a spacer so the sticky bar doesn't overlap content when it slides in.
         Keep it if you see layout jumping. */}
      <div className="compactSpacer" aria-hidden="true" />
    </header>
  );
};

export default Nav;
