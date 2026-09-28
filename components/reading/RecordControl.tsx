"use client";

import React from "react";
import Button from "../ui/Button";

export interface RecordControlProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export const RecordControl: React.FC<RecordControlProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled = false,
  isProcessing = false,
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        {isRecording ? (
          <Button
            variant="danger"
            onClick={onStopRecording}
            disabled={disabled || isProcessing}
            className="flex items-center gap-2 px-6 py-3 shadow-sm"
          >
            <span className="w-3 h-3 rounded-full bg-white animate-ping inline-block" />
            <span>Stop & Submit Recording</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onStartRecording}
            disabled={disabled || isProcessing}
            className="flex items-center gap-2 px-6 py-3 shadow-sm bg-blue-600 hover:bg-blue-700"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
            <span>{isProcessing ? "Processing Score..." : "Click to Speak"}</span>
          </Button>
        )}
      </div>

      <p className="text-xs text-slate-500">
        {isRecording
          ? "Speaking into mic... Click 'Stop & Submit' when you finish reading."
          : "Click the mic button to start recording. Read naturally at your own pace."}
      </p>
    </div>
  );
};

export default RecordControl;
