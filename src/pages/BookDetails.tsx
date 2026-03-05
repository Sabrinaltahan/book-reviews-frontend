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
  const { id } = useParams();
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
    <div className="grid" style={{ gap: 16 }}>
      {/* Header */}
      <div className="row" style={{ alignItems: "baseline" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/" className="btn">
            ← Back
          </Link>
          <h1 className="h1" style={{ margin: 0 }}>
            Book: {objectId}
          </h1>
        </div>

        <button className="btn" type="button" onClick={loadReviews} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
      {loading && <p className="muted" style={{ margin: 0 }}>Loading...</p>}

      {/* Layout: left form + right list */}
      <div className="grid twoCols">
        {/* Add review card */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add a review</h3>

          {!isLoggedIn ? (
            <p className="muted">
              You must <Link to="/login">login</Link> to add a review.
            </p>
          ) : (
            <form onSubmit={onCreate} className="grid" style={{ maxWidth: 520 }}>
              <textarea
                className="textarea"
                placeholder="Write your review..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
              />

              <input
                className="input"
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />

              <button className="btn btnPrimary" type="submit" disabled={loading}>
                Add review
              </button>
            </form>
          )}
        </div>

        {/* Reviews card */}
        <div className="card">
          <div className="row">
            <h3 style={{ margin: 0 }}>All reviews</h3>
            <span className="muted">{reviews.length} total</span>
          </div>

          {!loading && reviews.length === 0 && (
            <p className="muted" style={{ marginTop: 12 }}>
              No reviews for this book yet.
            </p>
          )}

          <div className="list">
            {reviews.map((r) => (
              <div key={r.id} className="reviewCard">
                <div className="row" style={{ gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>Rating: {r.rating}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>

                <p style={{ marginTop: 10, marginBottom: 8 }}>{r.text}</p>

                <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                  User: {r.userId}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}