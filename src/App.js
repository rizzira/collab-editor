import React, { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import Quill from "quill";
import { QuillBinding } from "y-quill";
import "quill/dist/quill.snow.css";

function generateDocId() {
  return Math.random().toString(36).substring(2, 10);
}

function getDocIdFromUrl() {
  let docId = null;
  const parts = window.location.pathname.split("/");
  if (parts.length >= 3 && parts[1] === "doc" && parts[2]) {
    docId = parts[2];
  } else {
    const params = new URLSearchParams(window.location.search);
    docId = params.get("doc");
  }
  return docId;
}

export default function App() {
  const editorRef = useRef(null);
  const [docId, setDocId] = useState(null);

  useEffect(() => {
    // Get docId from the URL or generate one
    let currentId = getDocIdFromUrl();
    if (!currentId) {
      currentId = generateDocId();
      const newUrl = `${window.location.origin}/doc/${currentId}`;
      window.history.replaceState(null, null, newUrl);
    }
    setDocId(currentId);
  }, []);

  useEffect(() => {
    if (!editorRef.current || !docId) return;

    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      "wss://demos.yjs.dev", // Public demo server, not always reliable!
      docId,
      ydoc
    );
    const ytext = ydoc.getText("quill");
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
      },
    });
    const binding = new QuillBinding(ytext, quill, provider.awareness);

    return () => {
      binding.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [docId]);

  if (!docId) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ margin: "20px" }}>
      <h2>📝 Collaborative Text Editor</h2>
      <p>
        Share this link to collaborate:<br />
        <code>{window.location.href}</code>
      </p>
      <div
        ref={editorRef}
        style={{ height: "400px", backgroundColor: "white", border: "1px solid #ccc" }}
      />
    </div>
  );
}
