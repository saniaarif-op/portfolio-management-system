import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { api } from "../api";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const MEDIA_BASE = API_BASE.replace(
  /\/api\/?$/,
  ""
);

function mediaUrl(url) {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${MEDIA_BASE}${url}`;
  }

  return url;
}

function safeArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      // Continue with comma-separated fallback
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function PublicPortfolio() {
  const { username } = useParams();

  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // IMAGE LIGHTBOX
  // =========================

  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setError("");

        const { data } = await api.get(
          `/portfolio/${username}`
        );

        setPortfolio(data.portfolio);
      } catch (e) {
        setError(
          "This portfolio could not be found."
        );
      }
    }

    loadPortfolio();
  }, [username]);

  // =========================
  // CLOSE IMAGE WITH ESCAPE
  // =========================

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setLightbox(null);
      }

      if (
        lightbox &&
        event.key === "ArrowRight"
      ) {
        showNextImage();
      }

      if (
        lightbox &&
        event.key === "ArrowLeft"
      ) {
        showPreviousImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [lightbox]);

  // =========================
  // OPEN IMAGE
  // =========================

  function openLightbox(
    project,
    imageIndex,
    projectImages
  ) {
    setLightbox({
      projectTitle: project.title,
      images: projectImages,
      currentIndex: imageIndex,
    });
  }

  // =========================
  // CLOSE IMAGE
  // =========================

  function closeLightbox() {
    setLightbox(null);
  }

  // =========================
  // NEXT IMAGE
  // =========================

  function showNextImage() {
    if (!lightbox) return;

    const total = lightbox.images.length;

    if (total <= 1) return;

    setLightbox((current) => ({
      ...current,
      currentIndex:
        (current.currentIndex + 1) % total,
    }));
  }

  // =========================
  // PREVIOUS IMAGE
  // =========================

  function showPreviousImage() {
    if (!lightbox) return;

    const total = lightbox.images.length;

    if (total <= 1) return;

    setLightbox((current) => ({
      ...current,
      currentIndex:
        (current.currentIndex - 1 + total) %
        total,
    }));
  }

  // =========================
  // NOT FOUND
  // =========================

  if (error) {
    return (
      <div className="not-found">
        <Sparkles size={32} />

        <h1>Portfolio not found</h1>

        <p>{error}</p>

        <Link
          className="primary-button"
          to="/"
        >
          Go home
        </Link>
      </div>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (!portfolio) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        Loading portfolio...
      </div>
    );
  }

  // =========================
  // SAFE DATA
  // =========================

  const socials = safeArray(
    portfolio.socials
  );

  const skills = safeArray(
    portfolio.skills
  );

  const projects = Array.isArray(
    portfolio.projects
  )
    ? portfolio.projects
    : [];

  return (
    <div className="public-page">

      {/* =========================
          NAVIGATION
      ========================= */}

      <nav className="portfolio-nav container">

        <Link
          className="brand"
          to="/"
        >
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>

          Portfolia

          <span className="dot">
            .
          </span>
        </Link>

        <div>

          <span className="nav-handle">
            @{portfolio.username}
          </span>

          {portfolio.resumeUrl && (
            <a
              className="mini-nav-button"
              href={mediaUrl(
                portfolio.resumeUrl
              )}
              target="_blank"
              rel="noreferrer"
            >
              Resume
              <Download size={14} />
            </a>
          )}

        </div>

      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="container public-main">

        {/* =========================
            HERO
        ========================= */}

        <section className="public-hero">

          <div className="public-avatar-wrap">

            {portfolio.avatarUrl ? (
              <img
                src={mediaUrl(
                  portfolio.avatarUrl
                )}
                alt={
                  portfolio.name ||
                  "Profile"
                }
              />
            ) : (
              <div className="profile-placeholder">
                <User size={70} />
              </div>
            )}

            <span className="status-dot"></span>

          </div>

          <div className="public-intro">

            <div className="eyebrow">

              <span className="live-dot"></span>

              AVAILABLE FOR OPPORTUNITIES

            </div>

            <h1>

              {portfolio.name}

              <span className="dot">
                .
              </span>

            </h1>

            <h2>
              {portfolio.title}
            </h2>

            <p>
              {portfolio.bio}
            </p>

            <div className="location">

              <MapPin size={16} />

              {portfolio.location ||
                "Pakistan"}

            </div>

            {/* SOCIAL LINKS */}

            <div className="socials">

              {socials.map(
                (social, index) => (
                  <a
                    key={`${social.label}-${index}`}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                  >

                    {social.label ===
                    "GitHub" ? (
                      <Github size={17} />
                    ) : social.label ===
                      "LinkedIn" ? (
                      <Linkedin size={17} />
                    ) : (
                      <ArrowUpRight
                        size={17}
                      />
                    )}

                    {social.label}

                  </a>
                )
              )}

              {portfolio.email && (
                <a
                  href={`mailto:${portfolio.email}`}
                >
                  <Mail size={17} />
                  Email
                </a>
              )}

            </div>

          </div>

        </section>

        {/* =========================
            PROJECTS
        ========================= */}

        <section className="public-section">

          <div className="public-section-head">

            <div>

              <span className="section-kicker">
                SELECTED WORK
              </span>

              <h2>
                Projects that solve real
                problems.
              </h2>

            </div>

            <span className="project-count">

              {String(
                projects.length
              ).padStart(2, "0")}{" "}
              PROJECTS

            </span>

          </div>

          <div className="portfolio-grid">

            {projects.map(
              (project, index) => {

                // =========================
                // PROJECT IMAGES
                // =========================

                let projectImages = [];

                if (
                  Array.isArray(
                    project.images
                  )
                ) {
                  projectImages =
                    project.images
                      .map((image) =>
                        typeof image ===
                        "string"
                          ? image
                          : image?.imageUrl
                      )
                      .filter(Boolean);
                }

                if (
                  projectImages.length === 0 &&
                  Array.isArray(
                    project.imageUrls
                  )
                ) {
                  projectImages =
                    project.imageUrls.filter(
                      Boolean
                    );
                }

                if (
                  projectImages.length === 0 &&
                  project.imageUrl
                ) {
                  projectImages = [
                    project.imageUrl,
                  ];
                }

                // =========================
                // TECHNOLOGIES
                // =========================

                const technologies =
                  safeArray(
                    project.technologies
                  );

                return (
                  <article
                    className={
                      project.featured
                        ? "portfolio-card featured-card"
                        : "portfolio-card"
                    }
                    key={project.id}
                  >

                    {/* =========================
                        PROJECT IMAGES
                    ========================= */}

                    <div className="portfolio-images">

                      {projectImages.length >
                      0 ? (
                        <div className="project-image-grid">

                          {projectImages.map(
                            (
                              image,
                              imageIndex
                            ) => (
                              <button
                                type="button"
                                className="project-image-item"
                                key={`${image}-${imageIndex}`}
                                onClick={() =>
                                  openLightbox(
                                    project,
                                    imageIndex,
                                    projectImages
                                  )
                                }
                                aria-label={`View ${
                                  project.title
                                } image ${
                                  imageIndex + 1
                                }`}
                              >

                                <img
                                  src={mediaUrl(
                                    image
                                  )}
                                  alt={`${project.title} ${
                                    imageIndex + 1
                                  }`}
                                />

                                <span className="image-view-hint">
                                  Click to enlarge
                                </span>

                              </button>
                            )
                          )}

                        </div>
                      ) : (
                        <div className="project-image-placeholder">

                          <Sparkles
                            size={40}
                          />

                          <span>
                            No project image
                          </span>

                        </div>
                      )}

                      <div className="project-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      {project.featured && (
                        <span className="featured-badge">
                          FEATURED
                        </span>
                      )}

                    </div>

                    {/* =========================
                        PROJECT BODY
                    ========================= */}

                    <div className="portfolio-card-body">

                      {/* TECHNOLOGIES */}

                      {technologies.length >
                        0 && (
                        <div className="project-technologies">

                          <span className="project-meta-label">
                            TECHNOLOGIES
                          </span>

                          <div className="tags">

                            {technologies.map(
                              (
                                technology,
                                technologyIndex
                              ) => (
                                <span
                                  key={`${technology}-${technologyIndex}`}
                                >
                                  {technology}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                      <h3>
                        {project.title}
                      </h3>

                      <p>
                        {project.description}
                      </p>

                      <div className="project-links">

                        {project.projectUrl && (
                          <a
                            href={mediaUrl(
                              project.projectUrl
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Live project

                            <ArrowUpRight
                              size={16}
                            />
                          </a>
                        )}

                        {project.githubUrl && (
                          <a
                            href={mediaUrl(
                              project.githubUrl
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Github
                              size={15}
                            />

                            Source
                          </a>
                        )}

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        </section>

        {/* =========================
            SKILLS
        ========================= */}

        <section className="skills-section">

          <div>

            <span className="section-kicker">
              TOOLKIT
            </span>

            <h2>
              Skills & technologies
            </h2>

            <p className="skills-description">
              Tools and technologies used
              across my projects and work.
            </p>

          </div>

          <div className="skill-cloud">

            {skills.length > 0 ? (
              skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                )
              )
            ) : (
              <span>
                No skills added yet.
              </span>
            )}

          </div>

        </section>

        {/* =========================
            CONTACT
        ========================= */}

        <section className="contact-banner">

          <div>

            <span className="section-kicker">
              LET'S CONNECT
            </span>

            <h2>
              Have a project in mind?
            </h2>

            <p>
              Let's turn the next idea
              into something useful and
              memorable.
            </p>

          </div>

          {portfolio.email && (
            <a
              className="primary-button"
              href={`mailto:${portfolio.email}`}
            >
              Get in touch
              <Mail size={17} />
            </a>
          )}

        </section>

      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer public-footer">

        <div className="container">

          Designed & built with Portfolia
          {" · "}
          @{portfolio.username}

        </div>

      </footer>

      {/* =========================
          FULLSCREEN IMAGE VIEWER
      ========================= */}

      {lightbox && (
        <div
          className="image-lightbox"
          onClick={closeLightbox}
        >

          <button
            type="button"
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close image viewer"
          >
            <X size={28} />
          </button>

          <div
            className="lightbox-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {lightbox.images.length > 1 && (
              <button
                type="button"
                className="lightbox-arrow lightbox-prev"
                onClick={showPreviousImage}
                aria-label="Previous image"
              >
                <ArrowLeft size={28} />
              </button>
            )}

            <img
              className="lightbox-image"
              src={mediaUrl(
                lightbox.images[
                  lightbox.currentIndex
                ]
              )}
              alt={`${lightbox.projectTitle} ${
                lightbox.currentIndex + 1
              }`}
            />

            {lightbox.images.length > 1 && (
              <button
                type="button"
                className="lightbox-arrow lightbox-next"
                onClick={showNextImage}
                aria-label="Next image"
              >
                <ArrowRight size={28} />
              </button>
            )}

            <div className="lightbox-caption">

              <strong>
                {lightbox.projectTitle}
              </strong>

              <span>
                {lightbox.currentIndex + 1} /{" "}
                {lightbox.images.length}
              </span>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}