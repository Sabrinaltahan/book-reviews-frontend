import { useEffect, useState, type FormEvent } from "react";
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

type BookItem = {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
  };
};

function isAuthError(msg: string) {
  const lower = msg.toLowerCase();
  return (
    lower.includes("token") ||
    lower.includes("unauthorized") ||
    lower.includes("forbidden")
  );
}

function clampRating(n: number) {
  if (Number.isNaN(n)) return 1;
  return Math.min(5, Math.max(1, n));
}

export default function Home() {
  const nav = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [objectId, setObjectId] = useState("book123");
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number>(5);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState<number>(5);

  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<BookItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function safeCall<T>(fn: () => Promise<T>) {
    try {
      return await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setError(msg);

      if (isAuthError(msg)) {
        localStorage.removeItem("token");
        nav("/login");
      }

      throw e;
    }
  }

  async function loadMyReviews() {
    setError(null);
    setLoading(true);

    try {
      const data = await safeCall(() =>
        apiFetch<Review[]>("/reviews/my", { method: "GET" })
      );
      setReviews(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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
    if (loading) return;

    setError(null);

    const obj = objectId.trim();
    const txt = text.trim();
    const rat = clampRating(Number(rating));

    if (!obj || !txt) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const body: CreateReviewBody = {
        objectId: obj,
        text: txt,
        rating: rat,
      };

      await safeCall(() =>
        apiFetch<Review>("/reviews", {
          method: "POST",
          body: JSON.stringify(body),
        })
      );

      setText("");
      setRating(5);

      await loadMyReviews();
    } finally {
      setLoading(false);
    }
  }

  function startEdit(r: Review) {
    setEditingId(r.id);
    setEditText(r.text);
    setEditRating(r.rating);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    setEditRating(5);
  }

  async function onSaveEdit(id: string) {
    if (loading) return;

    setError(null);

    const txt = editText.trim();
    const rat = clampRating(Number(editRating));

    if (!txt) {
      setError("Text is required");
      return;
    }

    setLoading(true);
    try {
      await safeCall(() =>
        apiFetch(`/reviews/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            text: txt,
            rating: rat,
          }),
        })
      );

      cancelEdit();
      await loadMyReviews();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (loading) return;
    if (!confirm("Delete this review?")) return;

    setError(null);
    setLoading(true);

    try {
      await safeCall(() => apiFetch(`/reviews/${id}`, { method: "DELETE" }));
      await loadMyReviews();
    } finally {
      setLoading(false);
    }
  }

  async function searchBooks(e: FormEvent) {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchError("Please enter a book title");
      setBooks([]);
      return;
    }

    setSearchError(null);
    setSearchLoading(true);

    try {
      const data = await apiFetch<{ items?: BookItem[] }>(
        `/books/search?q=${encodeURIComponent(trimmedQuery)}`
      );

      setBooks(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Failed to fetch books");
      setBooks([]);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="row">
        <h1 className="h1" style={{ margin: 0 }}>
          My Reviews
        </h1>

        <button className="btn" type="button" onClick={loadMyReviews} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
      {loading && <p className="muted" style={{ margin: 0 }}>Loading...</p>}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Search books</h3>

        <form onSubmit={searchBooks} className="grid">
          <input
            className="input"
            placeholder="Search by title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button className="btn btnPrimary" type="submit" disabled={searchLoading}>
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {searchError && (
          <p style={{ color: "var(--danger)", marginTop: 12 }}>{searchError}</p>
        )}

        {books.length > 0 && (
          <div className="list" style={{ marginTop: 16 }}>
            {books.map((book) => (
              <div key={book.id} className="reviewCard">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  <img
                    src={
                      book.volumeInfo.imageLinks?.thumbnail ||
                      "https://via.placeholder.com/90x130?text=No+Image"
                    }
                    alt={book.volumeInfo.title || "Book cover"}
                    style={{ width: 90, borderRadius: 8 }}
                  />

                  <div>
                    <h4 style={{ margin: "0 0 8px 0" }}>
                      {book.volumeInfo.title || "Untitled"}
                    </h4>

                    <p className="muted" style={{ margin: "0 0 8px 0" }}>
                      {book.volumeInfo.authors?.join(", ") || "Unknown author"}
                    </p>

                    <Link to={`/books/${book.id}`} className="btn btnPrimary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid twoCols">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add review</h3>

          <form onSubmit={onCreate} className="grid">
            <input
              className="input"
              placeholder="Book id (objectId)"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              disabled={loading}
            />

            <textarea
              className="textarea"
              placeholder="Write your review..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              disabled={loading}
            />

            <input
              className="input"
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(clampRating(Number(e.target.value)))}
              disabled={loading}
            />

            <button className="btn btnPrimary" type="submit" disabled={loading}>
              Add review
            </button>
          </form>
        </div>

        <div className="card">
          <div className="row">
            <h3 style={{ margin: 0 }}>Your reviews</h3>
            <span className="muted">{reviews.length} total</span>
          </div>

          {!loading && reviews.length === 0 && (
            <p className="muted" style={{ marginTop: 12 }}>
              No reviews yet
            </p>
          )}

          <div className="list">
            {reviews.map((r) => (
              <div key={r.id} className="reviewCard">
                <div className="row" style={{ alignItems: "baseline" }}>
                  <h4 style={{ margin: 0 }}>
                    <Link to={`/books/${r.objectId}`}>Book: {r.objectId}</Link>
                  </h4>

                  <span className="muted" style={{ fontSize: 12 }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>

                {editingId === r.id ? (
                  <>
                    <textarea
                      className="textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                      style={{ marginTop: 10 }}
                      disabled={loading}
                    />

                    <div className="row" style={{ gap: 10, marginTop: 10 }}>
                      <input
                        className="input"
                        style={{ maxWidth: 110 }}
                        type="number"
                        min={1}
                        max={5}
                        value={editRating}
                        onChange={(e) =>
                          setEditRating(clampRating(Number(e.target.value)))
                        }
                        disabled={loading}
                      />

                      <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
                        <button
                          className="btn btnPrimary"
                          type="button"
                          onClick={() => onSaveEdit(r.id)}
                          disabled={loading}
                        >
                          Save
                        </button>

                        <button
                          className="btn"
                          type="button"
                          onClick={cancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ marginTop: 10, marginBottom: 8 }}>{r.text}</p>

                    <p className="muted" style={{ marginTop: 0 }}>
                      Rating: <b>{r.rating}</b>
                    </p>

                    <div
                      className="row"
                      style={{ gap: 8, marginTop: 12, justifyContent: "flex-end" }}
                    >
                      <button
                        className="btn"
                        type="button"
                        onClick={() => startEdit(r)}
                        disabled={loading}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btnDanger"
                        type="button"
                        onClick={() => onDelete(r.id)}
                        disabled={loading}
                      >
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