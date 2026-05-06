import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { kv } from "@vercel/kv";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  increment, 
  serverTimestamp, 
  getDocs, 
  collection,
  query,
  where,
  documentId
} from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

dotenv.config();

// Initialize Firebase Client SDK for Server-side use
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Simple in-memory fallback for KV (used for ephemeral live counts)
let kvStore = new Map<string, any>();
const kvFallback = {
  get: async (key: string) => kvStore.get(key) || null,
  set: async (key: string, value: any, options?: { ex?: number }) => {
    kvStore.set(key, value);
    if (options?.ex) {
      setTimeout(() => kvStore.delete(key), options.ex * 1000);
    }
    return "OK";
  },
  incr: async (key: string) => {
    const val = (kvStore.get(key) || 0) + 1;
    kvStore.set(key, val);
    return val;
  },
  keys: async (pattern: string) => {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return Array.from(kvStore.keys()).filter((k) => regex.test(k));
  },
  pipeline: () => {
    const commands: any[] = [];
    return {
      get: (key: string) => {
        commands.push(() => kvFallback.get(key));
        return this;
      },
      exec: async () => {
        const results = [];
        for (const cmd of commands) {
          results.push(await cmd());
        }
        return results;
      }
    };
  }
};

const isUpstashConfigured = process.env.KV_REST_API_TOKEN && 
                           process.env.KV_REST_API_URL && 
                           process.env.KV_REST_API_URL.startsWith('https');

const safeKv = isUpstashConfigured ? kv : kvFallback;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for View Counter (Get)
  app.get("/api/views/:movieId", async (req, res) => {
    try {
      const { movieId } = req.params;
      const movieDoc = await getDoc(doc(db, "movie_stats", movieId));
      const views = movieDoc.exists() ? movieDoc.data()?.views || 0 : 0;
      res.json({ views });
    } catch (error: any) {
      console.error("Firestore Error (get views):", error.message);
      res.json({ views: 0 });
    }
  });

  // API Route for View Counter (Increment)
  app.post("/api/views/:movieId/increment", async (req, res) => {
    try {
      const { movieId } = req.params;
      const movieRef = doc(db, "movie_stats", movieId);
      
      await setDoc(movieRef, {
        views: increment(1),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const updatedDoc = await getDoc(movieRef);
      res.json({ views: updatedDoc.data()?.views || 1 });
    } catch (error: any) {
      console.error("Firestore Error (incr views):", error.message);
      res.status(500).json({ error: "Failed to increment views" });
    }
  });

  // Bulk fetch views
  app.get("/api/bulk-views", async (req, res) => {
    try {
      const ids = (req.query.ids as string || "").split(",").filter(id => id.trim() !== "");
      if (!ids.length) return res.json({});

      const viewsMap: Record<string, number> = {};
      
      const q = query(collection(db, "movie_stats"), where(documentId(), "in", ids));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        viewsMap[doc.id] = doc.data().views || 0;
      });

      ids.forEach(id => {
        if (!(id in viewsMap)) viewsMap[id] = 0;
      });

      res.json(viewsMap);
    } catch (error: any) {
      console.error("Firestore Error (bulk-views):", error.message);
      res.json({});
    }
  });

  // Heartbeat for Live Visitors (Per Movie or Site)
  app.post("/api/live/heartbeat", async (req, res) => {
    try {
      const { sessionId, movieId } = req.body;
      if (!sessionId) return res.status(400).json({ error: "Session ID required" });
      
      const key = movieId ? `live:${movieId}:${sessionId}` : `session:${sessionId}`;
      await safeKv.set(key, "active", { ex: 180 });
      res.json({ success: true });
    } catch (error) {
      console.error("KV Error (heartbeat):", error);
      res.status(500).json({ error: "Failed to track session" });
    }
  });

  // Get Live Visitors count
  app.get("/api/live/count", async (req, res) => {
    try {
      const { movieId } = req.query;
      const pattern = movieId ? `live:${movieId}:*` : "session:*";
      const keys = await safeKv.keys(pattern);
      res.json({ count: Math.max(1, keys.length) });
    } catch (error) {
      console.error("KV Error (live count):", error);
      res.json({ count: 1 });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
