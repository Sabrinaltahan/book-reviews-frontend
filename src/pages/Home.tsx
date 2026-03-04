import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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

  async function loadMyReviews() {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<Review[]>("/reviews/my", { method: "GET" });
      setReviews(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load reviews";
      setError(msg);

      // إذا التوكن مو موجود/منتهي: روحي على login
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
    // حماية الصفحة: إذا ما في token لا تفوت
    const token = localStorage.getItem("token");
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

      // reset form
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

  function logout() {
    localStorage.removeItem("token");
    nav("/login");
  }

  return (
    <div style={{ padding: 16, maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Reviews</h1>
        <button onClick={logout}>Logout</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {/* Create review */}
      <form onSubmit={onCreate} style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <input
            placeholder="Book id (objectId)"
            value={objectId}
            onChange={(e) => setObjectId(e.target.value)}
          />

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
        </div>
      </form>

      {/* List */}
      {!loading && reviews.length === 0 && <p>No reviews yet</p>}

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
          <h3>Book: {r.objectId}</h3>

          {editingId === r.id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                style={{ width: "100%", marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={editRating}
                  onChange={(e) => setEditRating(Number(e.target.value))}
                />
                <button type="button" onClick={() => onSaveEdit(r.id)}>
                  Save
                </button>
                <button type="button" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{r.text}</p>
              <p>Rating: {r.rating}</p>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" onClick={() => onDelete(r.id)}>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}