import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { generate3DView } from "lib/ai.action";
import { Box, Download, RefreshCcw, Share, X } from "lucide-react";
import { Button } from "~/components/ui/Button";
export default function Visualizer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastSeenId = useRef<string | null>(null);

  const handleBack = () => {
    navigate("/");
  };

  useEffect(() => {
    setError(false);
    setImage(null);

    if (!id) {
      setError(true);
      return;
    }

    const stored = sessionStorage.getItem(`visualizer:${id}`);

    if (!stored) {
      setError(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!parsed.initialImage) {
        setError(true);
        return;
      }
      if (lastSeenId.current === id) {
        return;
      }
      setImage(parsed.initialImage);

      if (parsed.initialRenderedImage) {
        setCurrentImage(parsed.initialRenderedImage);
        lastSeenId.current = id;
        return;
      }

      lastSeenId.current = id;
      runGeneration(parsed.initialImage);
    } catch (e) {
      setError(true);
    }
  }, [id]);

  if (error) {
    return (
      <div className="visualizer-error">
        <h2>Floor plan not found</h2>
        <p>
          This session may have expired or the link is invalid. Please upload
          your floor plan again.
        </p>
        <button onClick={() => navigate("/")}>Go back home</button>
      </div>
    );
  }

  const runGeneration = async (targetImage: string) => {
    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: targetImage });
      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);
        lastSeenId.current = id ?? null;
      }
    } catch (error) {
      console.error("Error generating 3D view:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">Roomify</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{"untitled project"}</h2>
              <p className="note">created by you</p>
            </div>
            <div className="panel-action">
              <Button
                size="sm"
                onClick={undefined}
                className="export"
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button size="sm" onClick={undefined} disabled className="share">
                <Share className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img
                src={currentImage}
                alt="Rendered 3D view"
                className="render-img"
              />
            ) : (
              <div className="render-placeholder">
                {image && (
                  <img
                    src={image}
                    alt="Original uploaded floor plan"
                    className="render-fallback"
                  />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Rendering ...</span>
                  <span className="subtitle">
                    Generating your 3D visualization
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
