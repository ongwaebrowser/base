"use client";

import { useState, useEffect } from "react";

export function useTypewriter(text: string, enabled: boolean, speed = 20) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (enabled) {
      setDisplayedText("");
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
        if (i > text.length -1) {
          clearInterval(intervalId);
        }
      }, speed);

      return () => clearInterval(intervalId);
    } else {
      setDisplayedText(text);
    }
  }, [text, speed, enabled]);

  return displayedText;
}
