"use client";

import { useState, useEffect } from "react";

export function useTypewriter(text: string, enabled: boolean, speed = 15) {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);

  useEffect(() => {
    if (enabled) {
      setDisplayedText(""); // Reset text to start typing
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i > text.length) {
          clearInterval(intervalId);
        }
      }, speed);

      return () => clearInterval(intervalId);
    } else {
      setDisplayedText(text);
    }
  }, [text, enabled, speed]);

  const isTyping = enabled && text && displayedText.length < text.length;

  return displayedText + (isTyping ? '▋' : '');
}
