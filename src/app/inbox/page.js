"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, serverTimestamp, doc, updateDoc, getDoc, setDoc 
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Send, UserCircle, MessageSquare, Clock, ArrowLeft } from "lucide-react";

function InboxContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get("chat");

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(initialChatId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Ensure user is logged in
  useEffect(() => {
    if (!user && !loading) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Fetch all chats where user is a participant
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, "chats"), 
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChats = [];
      snapshot.forEach((doc) => {
        fetchedChats.push({ id: doc.id, ...doc.data() });
      });
      setChats(fetchedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, initialChatId]);

  // Fetch messages for the active chat
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "chats", activeChatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [activeChatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !user) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Optimistic clear

    try {
      // 1. Add message to subcollection
      await addDoc(collection(db, "chats", activeChatId, "messages"), {
        senderId: user.uid,
        text: messageText,
        timestamp: serverTimestamp()
      });

      // 2. Update the parent chat document with lastMessage and updatedAt
      await updateDoc(doc(db, "chats", activeChatId), {
        lastMessage: messageText,
        updatedAt: serverTimestamp()
      });

    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat || !chat.participantsData || !user) return { name: "Unknown", role: "User" };
    const otherId = chat.participants.find(id => id !== user.uid);
    return chat.participantsData[otherId] || { name: "Unknown", role: "User" };
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid var(--border-primary)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </main>
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg-secondary)" }}>
      
      <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "24px", height: "calc(100vh - 70px)" }}>
        <div style={{ width: "100%", maxWidth: "1200px", display: "flex", gap: "24px", height: "100%" }}>
          
          {/* Sidebar: Chat List */}
          <div className="glass-card" style={{ width: "350px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-primary)", background: "var(--bg-tertiary)" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageSquare size={24} style={{ color: "var(--primary)" }} /> Inbox
              </h2>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {chats.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                  <UserCircle size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                  You have no active conversations yet.
                </div>
              ) : (
                chats.map(chat => {
                  const otherUser = getOtherParticipant(chat);
                  const isActive = activeChatId === chat.id;
                  
                  return (
                    <div 
                      key={chat.id} 
                      onClick={() => setActiveChatId(chat.id)}
                      style={{ 
                        padding: "16px", 
                        borderRadius: "12px", 
                        cursor: "pointer",
                        marginBottom: "8px",
                        background: isActive ? "var(--primary-light)" : "transparent",
                        border: `1px solid ${isActive ? "var(--primary)" : "transparent"}`,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = "var(--bg-tertiary)" }}
                      onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = "transparent" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "1.2rem", flexShrink: 0 }}>
                          {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                            <h4 style={{ fontWeight: "700", fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{otherUser.name}</h4>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>{formatTime(chat.updatedAt)}</span>
                          </div>
                          <p style={{ fontSize: "0.85rem", color: isActive ? "var(--primary)" : "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                            {chat.lastMessage || "Start of conversation"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Area: Active Chat */}
          <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            {activeChatId ? (
              <>
                {/* Chat Header */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-primary)", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "1.1rem" }}>
                    {getOtherParticipant(chats.find(c => c.id === activeChatId)).name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "2px" }}>
                      {getOtherParticipant(chats.find(c => c.id === activeChatId)).name}
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "100px" }}>
                      {getOtherParticipant(chats.find(c => c.id === activeChatId)).role}
                    </span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {messages.length === 0 ? (
                    <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)" }}>
                      No messages yet. Send the first message!
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMine = msg.senderId === user.uid;
                      return (
                        <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                          <div style={{
                            maxWidth: "70%",
                            padding: "12px 16px",
                            borderRadius: "16px",
                            borderBottomRightRadius: isMine ? "4px" : "16px",
                            borderBottomLeftRadius: !isMine ? "4px" : "16px",
                            background: isMine ? "var(--primary)" : "var(--bg-tertiary)",
                            color: isMine ? "#fff" : "var(--text-primary)",
                            border: isMine ? "none" : "1px solid var(--border-primary)",
                            fontSize: "0.95rem",
                            lineHeight: "1.5"
                          }}>
                            {msg.text}
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: "20px", borderTop: "1px solid var(--border-primary)", background: "var(--bg-tertiary)" }}>
                  <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "12px" }}>
                    <input 
                      type="text" 
                      placeholder="Type your message..." 
                      className="form-input" 
                      style={{ flex: 1, borderRadius: "100px", padding: "12px 20px" }}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ width: "48px", height: "48px", borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} disabled={!newMessage.trim()}>
                      <Send size={20} style={{ marginLeft: "4px" }} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                <MessageSquare size={64} style={{ marginBottom: "24px", opacity: 0.3 }} />
                <h3 style={{ fontSize: "1.5rem", marginBottom: "8px", color: "var(--text-secondary)" }}>Your Inbox</h3>
                <p>Select a conversation from the sidebar or start a new one from a public profile.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Inbox...</div>}>
      <InboxContent />
    </Suspense>
  );
}
