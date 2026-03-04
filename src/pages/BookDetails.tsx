import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Review = {
  id: string;
  objectId: string;
  userId: string;
  text: string;
  rating: number;
  createdAt: string;
};

export default function BookDetails() {
  const { id } = useParams(); // هذا هو objectId
  const nav = useNavigate();

  const objectId = useMemo(() => (id ? String(id) : ""), [id]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // add review
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number>(5);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  async function loadReviews() {
    if (!objectId) return;

    setError(null);
    setLoading(true);
    try {
      // ✅ endpoint العام (بدون توكن)
      const data = await apiFetch<Review[]>(`/reviews/object/${objectId}`, {
        method: "GET",
      });
      setReviews(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isLoggedIn) {
      nav("/login");
      return;
    }

    if (!text.trim()) {
      setError("Text is required");
      return;
    }

    setLoading(true);
    try {
      // ✅ محمي (لازم توكن)
      await apiFetch<Review>("/reviews", {
        method: "POST",
        body: JSON.stringify({
          objectId,
          text: text.trim(),
          rating: Number(rating),
        }),
      });

      setText("");
      setRating(5);

      await loadReviews();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/">← Back</Link>
        <h1 style={{ margin: 0 }}>Book: {objectId}</h1>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {/* Add review */}
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <h3>Add a review</h3>

        {!isLoggedIn ? (
          <p>
            You must <Link to="/login">login</Link> to add a review.
          </p>
        ) : (
          <form onSubmit={onCreate} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
            <textarea
              placeholder="Write your review..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />

            <input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />

            <button type="submit" disabled={loading}>
              Add review
            </button>
          </form>
        )}
      </div>

      {/* Reviews list */}
      <h3>All reviews</h3>
      {!loading && reviews.length === 0 && <p>No reviews for this book yet.</p>}

      {reviews.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <p style={{ margin: 0 }}>
            <b>Rating:</b> {r.rating}
          </p>
          <p style={{ marginTop: 8 }}>{r.text}</p>
          <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            User: {r.userId} — {new Date(r.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}