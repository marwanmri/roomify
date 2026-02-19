import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

export default function Visualizer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      return;
    }

    const stored = sessionStorage.getItem(`visualizer:${id}`);

    if (!stored) {
      setError(true);
      return;
    }

    setImage(stored);
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

  if (!image) {
    return (
      <div className="visualizer-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="visualizer">
      <img src={image} alt="Uploaded floor plan" className="visualizer-image" />
    </div>
  );
}
