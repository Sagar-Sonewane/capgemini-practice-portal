"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => string;
  getLatestTranscript: () => string;
  resetTranscript: () => void;
  error: string | null;
}

export function useSpeechRecognition(onFinalTranscript?: (text: string) => void): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let accumulated = "";
          for (let i = 0; i < event.results.length; i++) {
            accumulated += event.results[i][0].transcript + " ";
          }
          const trimmed = accumulated.trim();
          finalTranscriptRef.current = trimmed;
          setTranscript(trimmed);
        };

        recognition.onerror = (event: any) => {
          // 'no-speech' is a common browser event if silent, don't treat as fatal error
          if (event.error !== "no-speech") {
            setError(event.error || "Speech recognition error");
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (onFinalTranscript && finalTranscriptRef.current) {
            onFinalTranscript(finalTranscriptRef.current);
          }
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }
  }, [onFinalTranscript]);

  const start = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      finalTranscriptRef.current = "";
      setTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        // If already started, set state
        if (err.name === "InvalidStateError") {
          setIsListening(true);
        } else {
          setError(err.message || "Could not start speech recognition");
        }
      }
    }
  }, [isListening]);

  const stop = useCallback((): string => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err: any) {
        setError(err.message || "Failed to stop speech recognition");
      }
      setIsListening(false);
    }
    return finalTranscriptRef.current;
  }, [isListening]);

  const getLatestTranscript = useCallback((): string => {
    return finalTranscriptRef.current;
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    start,
    stop,
    getLatestTranscript,
    resetTranscript,
    error,
  };
}
