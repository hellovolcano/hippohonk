import { useEffect, useState } from "react";
import "./home.css";
import Hero from "../../components/hero";
import PrettyView from "../../components/pretty-view";

const Home = () => {
  // get top 5 rated bands
  const [topBands, setTopBands] = useState([]);

  // get 3 festivals by date (upcoming or recent past)
  const [displayFestivals, setDisplayFestivals] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/bands?limit=10", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setTopBands(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setTopBands([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/festivals", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return;

        const festivals = Array.isArray(data) ? data : [];
        const today = new Date().toISOString().slice(0, 10);

        // Soonest upcoming first, then most recent past, up to 3 total
        const upcoming = festivals
          .filter((f) => f.date && f.date >= today)
          .sort((a, b) => (a.date < b.date ? -1 : 1));

        const recentPast = festivals
          .filter((f) => f.date && f.date < today)
          .sort((a, b) => (a.date > b.date ? -1 : 1));

        setDisplayFestivals([...upcoming, ...recentPast].slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setDisplayFestivals([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <section className="first-view">
        <PrettyView />
      </section>
      <section className="festival-hero">
        <Hero
          title="Upcoming Festivals"
          items={displayFestivals}
          getHref={(festival) => `/festivals/${festival.slug}`}
        />
      </section>
      <section className="top-bands-hero">
        <Hero
          title="Top-Rated Bands"
          items={topBands}
          getHref={(band) => `/band/${band.band_id}`}
        />
      </section>
    </main>
  );
};

export default Home;
