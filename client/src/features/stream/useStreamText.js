import { useCallback, useEffect, useRef, useState } from "react";
import { apiBase } from "../../api/client";

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export function useStreamText() {
  const [visibleText, setVisibleText] = useState("");
  const [fullText, setFullText] = useState("");
  const [status, setStatus] = useState("idle");
  const controllerRef = useRef(null);

  const stopStream = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus("stopped");
  }, []);

  useEffect(() => stopStream, [stopStream]);

  const startStream = useCallback(async () => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setVisibleText("");
    setFullText("");
    setStatus("streaming");

    try {
      const response = await fetch(`${apiBase}/api/stream`, {
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Unable to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completeText = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        completeText += chunk;

        for (const char of chunk) {
          if (controller.signal.aborted) return;

          setVisibleText((current) => current + char);
          await wait(8, controller.signal);
        }
      }

      if (!controller.signal.aborted) {
        setFullText(completeText);
        setVisibleText(completeText);
        setStatus("complete");
      }
    } catch (error) {
      if (controller.signal.aborted) return;

      setStatus("error");
      setVisibleText(error.message || "Unable to read stream");
    }
  }, []);

  return {
    visibleText,
    fullText,
    status,
    startStream,
    stopStream
  };
}