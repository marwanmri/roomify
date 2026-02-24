import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import type { Route } from "./+types/home";
import { useNavigate } from "react-router";

import { Button } from "~/components/ui/Button";
import Navbar from "@/components/Navbar";
import Upload from "~/components/ui/Upload";
import { useState } from "react";

import { createProject } from "lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);

  const handleOpenProject = (
    id: string,
    name: string,
    sourceImage: string,
    renderedImage?: string | null,
  ) => {
    sessionStorage.setItem(
      `visualizer:${id}`,
      JSON.stringify({
        initialImage: sourceImage,
        initialRenderedImage: renderedImage || null,
        name,
      }),
    );
    navigate(`/visualizer/${id}`);
  };

  const handleUploadComplete = async (base64: string) => {
    const newId = Date.now().toString();
    const name = `Residence ${newId}`;

    const newItem = {
      id: newId,
      name,
      sourceImage: base64,
      renderedImage: undefined,
      timestamp: Date.now(),
    };

    const saved = await createProject({ item: newItem, visibility: "private" });
    if (!saved) {
      console.error("Failed to create project");
      return false;
    }

    setProjects((prev) => [{ ...newItem, ...saved }, ...prev]);

    sessionStorage.setItem(
      `visualizer:${newId}`,
      JSON.stringify({
        initialImage: saved.sourceImage,
        initialRenderedImage: saved.renderedImage || null,
        name: saved.name,
      }),
    );
    navigate(`/visualizer/${newId}`);
  };

  return (
    <div className="home">
      <Navbar />
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing Roomify 2.0</p>
        </div>

        <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

        <p className="subtitle">
          Roomify is an AI-first environment that helps you visualize, render,
          and ship, architectural projects faster than even
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start Building <ArrowRight className="icon" />
          </a>
          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG, formats up to 10Mb</p>
            </div>
            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>
                Your latest work and shared community projects, all in one place
              </p>
            </div>
          </div>
          <div className="projects-grid">
            {projects.map(
              ({ id, name, renderedImage, sourceImage, timestamp }) => (
                <div
                  key={id}
                  className="project-card group"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    handleOpenProject(
                      id,
                      name ?? "",
                      sourceImage,
                      renderedImage,
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (e.key === " ") e.preventDefault();
                      handleOpenProject(
                        id,
                        name ?? "",
                        sourceImage,
                        renderedImage,
                      );
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="preview">
                    <img src={renderedImage || sourceImage} alt="project" />

                    <div className="badge">
                      <span>Community</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div>
                      <h3>{name}</h3>
                      <div className="meta">
                        <Clock size={12} />
                        <span>{new Date(timestamp).toLocaleDateString()}</span>
                        <span>By JS Mastery</span>
                      </div>
                    </div>
                    <div className="arrow">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
