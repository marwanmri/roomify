import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useState } from "react";
import { useOutletContext } from "react-router";
import {
  UPLOAD_INTERVAL_MS,
  PROGRESS_INCREMENT,
  REDIRECT_DELAY_MS,
} from "../../../lib/constants";

interface UploadProps {
  onComplete: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSignedIn } = useOutletContext<AuthContext>();

  // ─── Core processing ────────────────────────────────────────────────────────

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      // Simulate upload / analysis progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + PROGRESS_INCREMENT;

          if (next >= 100) {
            clearInterval(interval);

            // Wait before handing off so the user sees "Redirecting …"
            setTimeout(() => {
              onComplete(base64);
            }, REDIRECT_DELAY_MS);

            return 100;
          }

          return next;
        });
      }, UPLOAD_INTERVAL_MS);
    };

    reader.readAsDataURL(selectedFile);
  };

  // ─── Input onChange ──────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  // ─── Drag-and-drop handlers ──────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isSignedIn) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg, .jpeg, .png"
            disabled={!isSignedIn}
            onChange={handleChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or just drag and drop"
                : "Sign in or Sign up with puter to upload"}
            </p>

            <p className="help">Maximum file size 10MB.</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-content">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />

              <p className="status-text">
                {progress < 100
                  ? "Analyzing floor plan ..."
                  : "Redirecting ..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
