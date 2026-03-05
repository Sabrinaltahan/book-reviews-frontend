import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Review = {
  id: string;
  objectId: string;
  userId: string;
  text: string;
  rating: number;
  createdAt: string;
};

type CreateReviewBody = {
  objectId: string;
  text: string;
  rating: number;
};

export default function Home() {
  const nav = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form add review
  const [objectId, setObjectId] = useState("book123");
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number>(5);

  // edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState<number>(5);

  const token = useMemo(() => localStorage.getItem("token"), []);

  async function loadMyReviews() {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<Review[]>("/reviews/my", { method: "GET" });
      setReviews(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load reviews";
      setError(msg);

      if (
        typeof msg === "string" &&
        (msg.toLowerCase().includes("token") ||
          msg.toLowerCase().includes("unauthorized") ||
          msg.toLowerCase().includes("forbidden"))
      ) {
        nav("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }
    loadMyReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!objectId.trim() || !text.trim() || !rating) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const body: CreateReviewBody = {
        objectId: objectId.trim(),
        text: text.trim(),
        rating: Number(rating),
      };

      await apiFetch<Review>("/reviews", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setText("");
      setRating(5);

      await loadMyReviews();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    setError(null);

    try {
      await apiFetch(`/reviews/${id}`, { method: "DELETE" });
      await loadMyReviews();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  function startEdit(r: Review) {
    setEditingId(r.id);
    setEditText(r.text);
    setEditRating(r.rating);
  }

  async function onSaveEdit(id: string) {
    setError(null);

    if (!editText.trim()) {
      setError("Text is required");
      return;
    }

    try {
      await apiFetch(`/reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          text: editText.trim(),
          rating: Number(editRating),
        }),
      });

      setEditingId(null);
      await loadMyReviews();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <div className="stack">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0 }}>My Reviews</h1>
            <p className="muted" style={{ marginTop: 6 }}>
              Add, edit, and manage your book reviews.
            </p>
          </div>

          <span className="badge">{reviews.length} reviews</span>
        </div>

        {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
        {loading && <p className="muted" style={{ marginTop: 12 }}>Loading...</p>}
      </div>

      <div className="grid">
        {/* Create review */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Add review</h2>

          <form onSubmit={onCreate} className="stack">
            <input
              className="input"
              placeholder="Book id (objectId)"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
            />

            <textarea
              className="textarea"
              placeholder="Write your review..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
            />

            <div className="row">
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
            </div>
          </form>
        </div>

        {/* List */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Your reviews</h2>

          {!loading && reviews.length === 0 && <p className="muted">No reviews yet</p>}

          <div className="list">
            {reviews.map((r) => (
              <div key={r.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0 }}>
                    <Link to={`/books/${r.objectId}`}>Book: {r.objectId}</Link>
                  </h3>
                  <span className="badge">⭐ {r.rating}/5</span>
                </div>

                {editingId === r.id ? (
                  <>
                    <textarea
                      className="textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                    />

                    <div className="actions">
                      <input
                        className="input"
                        style={{ maxWidth: 140 }}
                        type="number"
                        min={1}
                        max={5}
                        value={editRating}
                        onChange={(e) => setEditRating(Number(e.target.value))}
                      />

                      <button className="btn btnPrimary" type="button" onClick={() => onSaveEdit(r.id)}>
                        Save
                      </button>

                      <button className="btn" type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ marginTop: 10, marginBottom: 8 }}>{r.text}</p>
                    <p className="muted" style={{ marginTop: 0, marginBottom: 10 }}>
                      Created: {new Date(r.createdAt).toLocaleString()}
                    </p>

                    <div className="actions">
                      <button className="btn" type="button" onClick={() => startEdit(r)}>
                        Edit
                      </button>

                      <button className="btn btnDanger" type="button" onClick={() => onDelete(r.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}