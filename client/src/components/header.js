import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth";
import hippoLogo from "../hippohonk.png";
import "./header.css";

const Header = () => {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

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
      <div className="compactBar" role="navigation" aria-label="Site" ref={menuRef}>
        <div className="compactInner">
          <a className="brand" href="/" aria-label="Home">
            <img className="brandLogo" src={hippoLogo} alt="Hippohonk" />
          </a>

          <div className="actions">
            <button
              className="hamburgerBtn"
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="hamburgerBar" />
              <span className="hamburgerBar" />
              <span className="hamburgerBar" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="menuPanel" aria-label="Site">
            {isLoggedIn && (
              <a
                className="menuGreeting"
                href={`/profile/${user?.id}`}
                onClick={() => setMenuOpen(false)}
              >
                Hi, {user?.first_name}
              </a>
            )}

            <a className="navLink" href="/festivals" onClick={() => setMenuOpen(false)}>Festivals</a>
            <a className="navLink" href="/bands" onClick={() => setMenuOpen(false)}>Bands</a>
            <a className="navLink" href="/about" onClick={() => setMenuOpen(false)}>About</a>

            {isAdmin && (
              <>
                <div className="menuDivider" role="separator" />
                <a className="navLink" href="/admin/users" onClick={() => setMenuOpen(false)}>Manage Reviewers</a>
                <a className="navLink" href="/admin/festivals" onClick={() => setMenuOpen(false)}>Manage Festivals</a>
              </>
            )}

            <div className="menuDivider" role="separator" />

            {isLoggedIn ? (
              <button
                className="navLink menuActionLink"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            ) : (
              <a className="navLink" href="/signup" onClick={() => setMenuOpen(false)}>Signup or Login</a>
            )}
          </nav>
        )}
      </div>

      {/* Optional: a spacer so the sticky bar doesn't overlap content when it slides in.
         Keep it if you see layout jumping. */}
      <div className="compactSpacer" aria-hidden="true" />
    </header>
  );
};

export default Header;
