"use client";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { Send, Image as ImageIcon, MessageSquare, ThumbsUp, ShieldCheck, Award } from "lucide-react";
import ConnectButton from "../ConnectButton";

export default function NetworkFeedWidget({ widget }) {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    // Real-time listener for the global feed
    const q = query(collection(db, "feed_posts"), orderBy("createdAt", "desc"), limit(25));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;
    
    setIsPosting(true);
    try {
      await addDoc(collection(db, "feed_posts"), {
        content: newPost,
        authorId: user.uid,
        authorName: profile?.name || user.displayName || "User",
        authorRole: profile?.role || "user",
        authorPhoto: user.photoURL || null,
        isVerified: profile?.isVerified || false,
        isPremium: profile?.tier?.includes("paid") || false, // Premium badge
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0
      });
      setNewPost("");
    } catch (err) {
      console.error("Failed to post:", err);
      alert("Failed to publish your post.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <section style={{ marginBottom: "40px", maxWidth: "680px", margin: "0 auto 40px auto" }}>
      
      {/* Create Post Box */}
      {user ? (
        <div className="glass-card" style={{ padding: "20px", marginBottom: "24px", border: "1px solid var(--border-primary)" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--primary-light)", flexShrink: 0, overflow: "hidden" }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--primary)" }}>
                  {(profile?.name || user.displayName || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <form onSubmit={handlePost} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              <textarea 
                className="form-input"
                placeholder="Share an update, ask a question, or post a job requirement..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                style={{ height: "80px", resize: "none", background: "var(--bg-tertiary)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>
                  <ImageIcon size={18} /> Add Media
                </button>
                <button type="submit" disabled={isPosting || !newPost.trim()} className="btn-primary" style={{ padding: "8px 20px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {isPosting ? "Posting..." : <><Send size={14} /> Post</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "24px", marginBottom: "24px", textAlign: "center", border: "1px dashed var(--border-secondary)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Join the Conversation</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>Log in to connect with verified institutions and students on the EduConnect Network.</p>
          <Link href="/dashboard" className="btn-primary" style={{ display: "inline-block" }}>Log In to Post</Link>
        </div>
      )}

      {/* The Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {posts.length > 0 ? posts.map((post) => (
          <div key={post.id} className="glass-card" style={{ padding: "20px", border: post.isPremium ? "1px solid var(--warning)" : "1px solid var(--border-primary)" }}>
            
            {/* Post Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--bg-tertiary)", overflow: "hidden", border: post.isPremium ? "2px solid var(--warning)" : "none" }}>
                  {post.authorPhoto ? (
                    <img src={post.authorPhoto} alt="Author" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--text-muted)" }}>
                      {post.authorName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h4 style={{ fontWeight: "700", fontSize: "1.05rem", color: "var(--text-primary)", margin: 0 }}>
                      {post.authorName}
                    </h4>
                    {post.isVerified && <ShieldCheck size={14} style={{ color: "var(--success)" }} title="Verified User" />}
                    {post.isPremium && <Award size={14} style={{ color: "var(--warning)" }} title="Premium Member" />}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "capitalize", display: "block" }}>
                    {post.authorRole} • {post.createdAt?.toDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(post.createdAt.toDate()) : "Just now"}
                  </span>
                </div>
              </div>
              
              <ConnectButton targetUserId={post.authorId} targetName={post.authorName} />
            </div>

            {/* Post Content */}
            <div style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "16px", whiteSpace: "pre-wrap" }}>
              {post.content}
            </div>

            {/* Engagement Bar */}
            <div style={{ display: "flex", gap: "24px", borderTop: "1px solid var(--border-secondary)", paddingTop: "12px" }}>
              <button style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color="var(--primary)"} onMouseOut={e=>e.currentTarget.style.color="var(--text-muted)"}>
                <ThumbsUp size={16} /> {post.likes} Likes
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color="var(--primary)"} onMouseOut={e=>e.currentTarget.style.color="var(--text-muted)"}>
                <MessageSquare size={16} /> {post.comments} Comments
              </button>
            </div>
            
          </div>
        )) : (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px dashed var(--border-secondary)" }}>
            <MessageSquare size={48} style={{ opacity: 0.2, margin: "0 auto 16px auto" }} />
            <p>The network feed is currently quiet. Be the first to start a conversation!</p>
          </div>
        )}
      </div>

    </section>
  );
}
