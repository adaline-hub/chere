"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface RecipientAudio {
  muted: boolean;
  setMuted: (m: boolean) => void;
  toggle: () => void;
}

const Context = createContext<RecipientAudio | null>(null);
const STORAGE_KEY = "chere:recipient-muted";

export function RecipientAudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setMutedState(true);
    } catch {}
  }, []);

  useEffect(() => {
    const syncNode = (node: Node) => {
      if (node instanceof HTMLAudioElement) node.muted = muted;
      if (node instanceof Element) {
        node.querySelectorAll("audio").forEach((audio) => {
          audio.muted = muted;
        });
      }
    };

    document.querySelectorAll("audio").forEach((audio) => {
      audio.muted = muted;
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(syncNode);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [muted]);

  const setMuted = (m: boolean) => {
    setMutedState(m);
    try {
      window.localStorage.setItem(STORAGE_KEY, m ? "1" : "0");
    } catch {}
  };

  const toggle = () => setMuted(!muted);

  return <Context.Provider value={{ muted, setMuted, toggle }}>{children}</Context.Provider>;
}

export function useRecipientAudio(): RecipientAudio {
  const ctx = useContext(Context);
  if (!ctx) return { muted: false, setMuted: () => {}, toggle: () => {} };
  return ctx;
}
