import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./home.css";
import Hero from "../../components/hero";
import PrettyView from "../../components/pretty-view";
import { PersonTable } from "../../components/rating-table/table";

const DEFAULT_FESTIVAL_SLUG = "sxsw-2026";

const Home = () => {
  const [searchParams] = useSearchParams();


  // get top 5 rated bands
  const [topBands, setTopBands] = useState([]);

  // get 3 festivals by date (upcoming or recent past)
  const [displayFestivals, setDisplayFestivals] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/bands?limit=5", { credentials: "include" })
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


  // Header controls these via query params
  const festivalSlug = searchParams.get("festival_slug") || DEFAULT_FESTIVAL_SLUG;
  const genreId = searchParams.get("genre_id") || "";
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [bands, setBands] = useState([]);

  // 1) Load festival by slug -> get festival_id + title
  // 2) Load lineup by festival_id -> get bands for table
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const festRes = await fetch(`/api/festivals/${festivalSlug}`, {
          credentials: "include",
        });

        if (!festRes.ok) throw new Error("Failed to load festival");
        const fest = await festRes.json();

        if (!fest?.id) throw new Error("Festival not found");
        if (cancelled) return;

        setTitle(fest.name);

        const lineupRes = await fetch(`/api/lineups/${fest.id}`, {
          credentials: "include",
        });
        if (!lineupRes.ok) throw new Error("Failed to load lineup");

        const lineupBands = await lineupRes.json();
        if (cancelled) return;

        setBands(Array.isArray(lineupBands) ? lineupBands : []);
      } catch (err) {
        console.log(err.message);
        if (!cancelled) {
          setTitle("");
          setBands([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [festivalSlug]);

  // Filter bands for the table based on genre + search
  const filteredBands = useMemo(() => {
    let result = Array.isArray(bands) ? bands : [];

    if (genreId) {
      // Your API might return genre_id on the band objects
      result = result.filter((b) => String(b.genre_id) === String(genreId));
    }

    if (q) {
      result = result.filter((b) => {
        const name = (b.name || "").toLowerCase();
        const location = (b.location || "").toLowerCase();
        const desc = (b.description || "").toLowerCase();
        const genreName = (b.genre_name || "").toLowerCase();

        return (
          name.includes(q) ||
          location.includes(q) ||
          desc.includes(q) ||
          genreName.includes(q)
        );
      });
    }

    return result;
  }, [bands, genreId, q]);
  // Design of homepage is:
  // Left side of of huge header is the hippo's face, with Hippohonk at the top 
  return (
    <main>
        <section className="first-view">
            <PrettyView />

        </section>
        <section className="festival-hero">
            <Hero title="Upcoming Festivals" items={displayFestivals} />
        </section>
        <section className="top-bands-hero">
            <Hero title="Top-Rated Bands" items={topBands} />
        </section>
    </main>
  );
};

export default Home;
