import { useState, useEffect } from "react";

const Festivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/festivals")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setFestivals(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err.message);
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Festivals</h2>

      {festivals.length === 0 ? (
        <p>No festivals found</p>
      ) : (
        <ul>
          {festivals.map((festival) => (
            <li key={festival.id}>
              <a href={`/festivals/${festival.slug}`}>{festival.name}</a>
              {festival.date && ` — ${festival.date}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Festivals;
