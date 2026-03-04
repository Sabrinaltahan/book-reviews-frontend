import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Review = {
  id: string;
  objectId: string;
  userId: string;
  text: string;
  rating: number;
  createdAt: string;
};

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [objectId, setObjectId] = useState("book123");
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number>(5);

  async function loadMyReviews() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Review[]>("/reviews/my");
      setReviews(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyReviews();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await apiFetch<Review>("/reviews", {
        method: "POST",
        body: JSON.stringify({ objectId, text, rating }),
      });

      setText("");
      setRating(5);

      await loadMyReviews(); // refresh
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>My Reviews</h1>

      <form onSubmit={onCreate} style={{ marginBottom: 16 }}>
        <div>
          <input
            placeholder="objectId (book id)"
            value={objectId}
            onChange={(e) => setObjectId(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <textarea
            placeholder="Write your review..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            style={{ width: 320 }}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
        </div>

        <button style={{ marginTop: 8 }} type="submit">
          Add review
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && reviews.length === 0 && <p>No reviews yet</p>}

      {reviews.map((r) => (
        <div key={r.id} style={{ border: "1px solid #ddd", padding: 8, marginBottom: 8 }}>
          <h3>Book: {r.objectId}</h3>
          <p>{r.text}</p>
          <p>Rating: {r.rating}</p>
        </div>
      ))}
    </div>
  );
}