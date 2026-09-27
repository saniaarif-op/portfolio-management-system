import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ExternalLink,
  GripVertical,
  ImagePlus,
  LogOut,
  Pencil,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { api, clearSession } from "../api";

const emptyProject = {
  title: "",
  description: "",
  projectUrl: "",
  githubUrl: "",
  technologies: [],
  featured: false,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PROJECT_IMAGES = 5;

function mediaUrl(url) {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const base =
    api.defaults?.baseURL ||
    "http://localhost:5000/api";

  const serverBase = base.replace(
    /\/api\/?$/,
    ""
  );

  return `${serverBase}${url}`;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState(null);
  const [profile, setProfile] = useState(null);

  const [project, setProject] = useState({
    ...emptyProject,
  });

  const [editingId, setEditingId] = useState(null);

  const [profileImageFile, setProfileImageFile] =
    useState(null);

  const [profileImagePreview, setProfileImagePreview] =
    useState("");

  const [projectImageFiles, setProjectImageFiles] =
    useState([]);

  const [projectImagePreviews, setProjectImagePreviews] =
    useState([]);

  const [editingProjectImages, setEditingProjectImages] =
    useState([]);

  const [skillInput, setSkillInput] = useState("");
  const [techInput, setTechInput] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] =
    useState(false);

  // IMPORTANT:
  // This reference allows the custom upload button
  // to open the real file picker.
  const profileInputRef = useRef(null);

  async function load() {
    try {
      setError("");

      const { data } = await api.get(
        "/portfolio/me"
      );

      const portfolioData = data.portfolio;

      setPortfolio({
        ...portfolioData,
        projects:
          portfolioData.projects || [],
      });

      setProfile({
        name: portfolioData.name || "",
        username:
          portfolioData.username || "",
        title: portfolioData.title || "",
        bio: portfolioData.bio || "",
        location:
          portfolioData.location || "",
        avatarUrl:
          portfolioData.avatarUrl || "",
        resumeUrl:
          portfolioData.resumeUrl || "",
        skills:
          portfolioData.skills || [],
        socials:
          portfolioData.socials || [],
      });
    } catch (e) {
      if (e.response?.status === 401) {
        clearSession();
        navigate("/login");
        return;
      }

      setError(
        e.response?.data?.message ||
          "Could not load your portfolio."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      projects:
        portfolio?.projects?.length || 0,
      skills:
        profile?.skills?.length || 0,
      links:
        profile?.socials?.length || 0,
    }),
    [portfolio, profile]
  );

  function flash(msg) {
    setMessage(msg);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  // =====================================
  // PROFILE IMAGE UPLOAD
  // =====================================

  async function handleProfileImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        "Profile image must be 5MB or smaller."
      );

      event.target.value = "";
      return;
    }

    const preview =
      URL.createObjectURL(file);

    setProfileImageFile(file);
    setProfileImagePreview(preview);

    const formData = new FormData();

    formData.append(
      "profileImage",
      file
    );

    setUploadingProfile(true);

    try {
      const { data } = await api.post(
        "/portfolio/profile/image",
        formData
      );

      setProfile((current) => ({
        ...current,
        avatarUrl:
          data.avatarUrl,
      }));

      setProfileImageFile(null);
      setProfileImagePreview("");

      URL.revokeObjectURL(preview);

      flash(
        "Profile picture uploaded."
      );

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not upload profile picture."
      );

      setProfileImagePreview("");
      setProfileImageFile(null);

      URL.revokeObjectURL(preview);
    } finally {
      setUploadingProfile(false);

      event.target.value = "";
    }
  }

  // =====================================
  // REMOVE PROFILE IMAGE
  // =====================================

  async function removeProfileImage() {
    try {
      setError("");

      await api.delete(
        "/portfolio/profile/image"
      );

      setProfile((current) => ({
        ...current,
        avatarUrl: "",
      }));

      setProfileImageFile(null);
      setProfileImagePreview("");

      flash(
        "Profile picture removed."
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not remove profile picture."
      );
    }
  }

  // =====================================
  // SAVE PROFILE
  // =====================================

  async function saveProfile(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const { data } = await api.put(
        "/portfolio/profile",
        {
          name: profile.name,
          username:
            profile.username,
          title: profile.title,
          bio: profile.bio,
          location:
            profile.location,
          resumeUrl:
            profile.resumeUrl,
          skills:
            profile.skills,
          socials:
            profile.socials,
        }
      );

      const updatedPortfolio =
        data.portfolio;

      setPortfolio({
        ...updatedPortfolio,
        projects:
          updatedPortfolio.projects ||
          [],
      });

      setProfile({
        name:
          updatedPortfolio.name ||
          "",
        username:
          updatedPortfolio.username ||
          "",
        title:
          updatedPortfolio.title ||
          "",
        bio:
          updatedPortfolio.bio ||
          "",
        location:
          updatedPortfolio.location ||
          "",
        avatarUrl:
          updatedPortfolio.avatarUrl ||
          "",
        resumeUrl:
          updatedPortfolio.resumeUrl ||
          "",
        skills:
          updatedPortfolio.skills ||
          [],
        socials:
          updatedPortfolio.socials ||
          [],
      });

      flash(
        "Profile saved successfully."
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================
  // PROJECT IMAGE SELECTION
  // =====================================

  function handleProjectImages(event) {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    setError("");

    const currentCount =
      editingProjectImages.length +
      projectImageFiles.length;

    if (
      currentCount + files.length >
      MAX_PROJECT_IMAGES
    ) {
      setError(
        `A project can have a maximum of ${MAX_PROJECT_IMAGES} images.`
      );

      event.target.value = "";
      return;
    }

    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(
          "Only image files can be uploaded."
        );
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError(
          `${file.name} is larger than 5MB.`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    const newPreviews =
      validFiles.map((file) => ({
        file,
        preview:
          URL.createObjectURL(file),
      }));

    setProjectImageFiles(
      (current) => [
        ...current,
        ...validFiles,
      ]
    );

    setProjectImagePreviews(
      (current) => [
        ...current,
        ...newPreviews,
      ]
    );

    event.target.value = "";
  }

  // =====================================
  // REMOVE NEW PROJECT IMAGE
  // =====================================

  function removeNewProjectImage(index) {
    const preview =
      projectImagePreviews[index];

    if (preview?.preview) {
      URL.revokeObjectURL(
        preview.preview
      );
    }

    setProjectImageFiles(
      (current) =>
        current.filter(
          (_, i) => i !== index
        )
    );

    setProjectImagePreviews(
      (current) =>
        current.filter(
          (_, i) => i !== index
        )
    );
  }

  // =====================================
  // DELETE EXISTING PROJECT IMAGE
  // =====================================

  async function deleteExistingProjectImage(
    projectId,
    imageId
  ) {
    if (
      !window.confirm(
        "Delete this project image?"
      )
    ) {
      return;
    }

    try {
      setError("");

      const imageToDelete =
        editingProjectImages.find(
          (image) =>
            image.id === imageId
        );

      await api.delete(
        `/portfolio/projects/${projectId}/images/${imageId}`
      );

      setEditingProjectImages(
        (current) =>
          current.filter(
            (image) =>
              image.id !== imageId
          )
      );

      setPortfolio((current) => {
        if (!current) return current;

        return {
          ...current,
          projects:
            current.projects.map(
              (item) => {
                if (
                  item.id !== projectId
                ) {
                  return item;
                }

                return {
                  ...item,

                  images:
                    (
                      item.images || []
                    ).filter(
                      (image) =>
                        image.id !==
                        imageId
                    ),

                  imageUrls:
                    (
                      item.imageUrls ||
                      []
                    ).filter(
                      (url) =>
                        url !==
                        imageToDelete?.imageUrl
                    ),
                };
              }
            ),
        };
      });

      flash(
        "Project image deleted."
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not delete project image."
      );
    }
  }

  // =====================================
  // UPLOAD PROJECT IMAGES
  // =====================================

  async function uploadProjectImages(
    projectId
  ) {
    if (!projectImageFiles.length) {
      return;
    }

    const formData = new FormData();

    projectImageFiles.forEach(
      (file) => {
        formData.append(
          "projectImages",
          file
        );
      }
    );

    await api.post(
      `/portfolio/projects/${projectId}/images`,
      formData
    );
  }

  // =====================================
  // SAVE PROJECT
  // =====================================

  async function saveProject(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      let savedProject;

      const projectData = {
        title: project.title,
        description:
          project.description,
        projectUrl:
          project.projectUrl || "",
        githubUrl:
          project.githubUrl || "",
        technologies:
          project.technologies,
        featured:
          Boolean(project.featured),
      };

      if (editingId) {
        const response =
          await api.put(
            `/portfolio/projects/${editingId}`,
            projectData
          );

        savedProject =
          response.data.project;
      } else {
        const response =
          await api.post(
            "/portfolio/projects",
            projectData
          );

        savedProject =
          response.data.project;
      }

      if (
        projectImageFiles.length > 0
      ) {
        await uploadProjectImages(
          savedProject.id
        );
      }

      const wasEditing =
        Boolean(editingId);

      clearProjectForm();

      await load();

      flash(
        wasEditing
          ? "Project updated."
          : "Project added."
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not save project."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================
  // CLEAR PROJECT FORM
  // =====================================

  function clearProjectForm() {
    projectImagePreviews.forEach(
      (item) => {
        if (item.preview) {
          URL.revokeObjectURL(
            item.preview
          );
        }
      }
    );

    setProject({
      ...emptyProject,
    });

    setEditingId(null);

    setProjectImageFiles([]);
    setProjectImagePreviews([]);
    setEditingProjectImages([]);

    setTechInput("");
  }

  // =====================================
  // EDIT PROJECT
  // =====================================

  function editProject(p) {
    projectImagePreviews.forEach(
      (item) => {
        if (item.preview) {
          URL.revokeObjectURL(
            item.preview
          );
        }
      }
    );

    setEditingId(p.id);

    setProject({
      title: p.title || "",
      description:
        p.description || "",
      projectUrl:
        p.projectUrl || "",
      githubUrl:
        p.githubUrl || "",
      technologies:
        p.technologies || [],
      featured:
        Boolean(p.featured),
    });

    setEditingProjectImages(
      p.images || []
    );

    setProjectImageFiles([]);
    setProjectImagePreviews([]);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  // =====================================
  // DELETE PROJECT
  // =====================================

  async function deleteProject(id) {
    if (
      !window.confirm(
        "Delete this project?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/portfolio/projects/${id}`
      );

      await load();

      flash(
        "Project deleted."
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not delete project."
      );
    }
  }

  // =====================================
  // MOVE PROJECT
  // =====================================

  async function moveProject(
    index,
    direction
  ) {
    if (!portfolio?.projects) {
      return;
    }

    const list = [
      ...portfolio.projects,
    ];

    const target =
      index + direction;

    if (
      target < 0 ||
      target >= list.length
    ) {
      return;
    }

    [
      list[index],
      list[target],
    ] = [
      list[target],
      list[index],
    ];

    setPortfolio({
      ...portfolio,
      projects: list,
    });

    try {
      await api.put(
        "/portfolio/projects/reorder",
        {
          ids: list.map(
            (p) => p.id
          ),
        }
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not reorder projects."
      );

      await load();
    }
  }

  // =====================================
  // ADD SKILL
  // =====================================

  function addSkill(e) {
    if (
      e.key === "Enter" &&
      skillInput.trim()
    ) {
      e.preventDefault();

      const skill =
        skillInput.trim();

      if (
        !profile.skills.includes(
          skill
        )
      ) {
        setProfile({
          ...profile,

          skills: [
            ...profile.skills,
            skill,
          ],
        });
      }

      setSkillInput("");
    }
  }

  // =====================================
  // ADD TECHNOLOGY
  // =====================================

  function addTech(e) {
    if (
      e.key === "Enter" &&
      techInput.trim()
    ) {
      e.preventDefault();

      const technology =
        techInput.trim();

      if (
        !project.technologies.includes(
          technology
        )
      ) {
        setProject({
          ...project,

          technologies: [
            ...project.technologies,
            technology,
          ],
        });
      }

      setTechInput("");
    }
  }

  // =====================================
  // LOADING
  // =====================================

  if (!portfolio || !profile) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  // =====================================
  // DASHBOARD UI
  // =====================================

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <Link
          className="brand sidebar-brand"
          to="/"
        >
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>

          Portfolia
          <span className="dot">.</span>
        </Link>

        <div className="side-profile">

          {profile.avatarUrl ? (
            <img
              src={mediaUrl(
                profile.avatarUrl
              )}
              alt="Profile"
            />
          ) : (
            <div className="avatar-placeholder">
              <UserRound size={32} />
            </div>
          )}

          <strong>
            {profile.name}
          </strong>

          <span>
            @{profile.username}
          </span>

        </div>

        <nav className="side-nav">

          <a
            className="active"
            href="#overview"
          >
            <Settings2 size={18} />
            Overview
          </a>

          <a href="#profile">
            <UserRound size={18} />
            Profile
          </a>

          <a href="#projects">
            <ImagePlus size={18} />
            Projects
          </a>

          <Link
            to={`/portfolio/${profile.username}`}
            target="_blank"
          >
            <ExternalLink size={18} />
            View public profile
          </Link>

        </nav>

        <button
          className="side-logout"
          onClick={() => {
            clearSession();
            navigate("/login");
          }}
        >
          <LogOut size={17} />
          Sign out
        </button>

      </aside>

      {/* MAIN */}

      <main className="dashboard-main">

        {/* TOP */}

        <div className="dashboard-top">

          <div>

            <span className="section-kicker">
              CREATOR DASHBOARD
            </span>

            <h1>
              Good to see you,{" "}
              {profile.name
                ? profile.name.split(" ")[0]
                : "Creator"}
              .
            </h1>

            <p>
              Keep your professional story
              fresh and ready to share.
            </p>

          </div>

          <Link
            className="secondary-button"
            to={`/portfolio/${profile.username}`}
            target="_blank"
          >
            View portfolio
            <ExternalLink size={16} />
          </Link>

        </div>

        {/* MESSAGES */}

        {message && (
          <div className="success-box">
            {message}
          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* STATS */}

        <section
          id="overview"
          className="dashboard-stats"
        >

          <Stat
            label="Projects"
            value={stats.projects}
          />

          <Stat
            label="Skills"
            value={stats.skills}
          />

          <Stat
            label="Social links"
            value={stats.links}
          />

          <div className="stat-card accent">

            <span>
              PUBLIC URL
            </span>

            <strong>
              /{profile.username}
            </strong>

            <Link
              to={`/portfolio/${profile.username}`}
              target="_blank"
            >
              Open
              <ExternalLink size={14} />
            </Link>

          </div>

        </section>

        {/* PROFILE */}

        <section
          id="profile"
          className="editor-section"
        >

          <SectionTitle
            icon={<UserRound />}
            kicker="PROFILE"
            title="Your professional identity"
          />

          <form
            onSubmit={saveProfile}
            className="panel profile-form"
          >

            <div className="avatar-column">

              {profileImagePreview ? (
                <img
                  src={
                    profileImagePreview
                  }
                  alt="New profile"
                />
              ) : profile.avatarUrl ? (
                <img
                  src={mediaUrl(
                    profile.avatarUrl
                  )}
                  alt="Profile"
                />
              ) : (
                <div className="avatar-placeholder large">
                  <UserRound size={46} />
                </div>
              )}

              <span>
                Profile picture
              </span>

              {/* FIXED PROFILE UPLOAD BUTTON */}

              <button
                type="button"
                className="upload-button"
                onClick={() =>
                  profileInputRef.current?.click()
                }
                disabled={
                  uploadingProfile
                }
              >
                <ImagePlus size={16} />

                {uploadingProfile
                  ? "Uploading..."
                  : "Choose picture"}
              </button>

              {/* REAL FILE INPUT */}

              <input
                ref={profileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={
                  handleProfileImage
                }
                disabled={
                  uploadingProfile
                }
                style={{
                  display: "none",
                }}
              />

              {profile.avatarUrl && (
                <button
                  type="button"
                  className="remove-image-button"
                  onClick={
                    removeProfileImage
                  }
                >
                  <Trash2 size={15} />
                  Remove picture
                </button>
              )}

              <small>
                JPG, PNG or WEBP · Max 5MB
              </small>

            </div>

            <div className="form-grid">

              <Field label="Full name">
                <input
                  value={
                    profile.name || ""
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Username">
                <input
                  value={
                    profile.username ||
                    ""
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      username:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Professional title">
                <input
                  value={
                    profile.title ||
                    ""
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      title:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Location">
                <input
                  value={
                    profile.location ||
                    ""
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      location:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Resume URL">
                <input
                  value={
                    profile.resumeUrl ||
                    ""
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      resumeUrl:
                        e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </Field>

              <div className="full-field">

                <Field label="Professional summary">

                  <textarea
                    rows="5"
                    value={
                      profile.bio || ""
                    }
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        bio:
                          e.target.value,
                      })
                    }
                  />

                </Field>

              </div>

              {/* SKILLS */}

              <div className="full-field">

                <label className="field-label">
                  Skills
                </label>

                <div className="tag-input">

                  {(profile.skills || []).map(
                    (skill) => (
                      <span key={skill}>
                        {skill}

                        <button
                          type="button"
                          onClick={() =>
                            setProfile({
                              ...profile,
                              skills:
                                profile.skills.filter(
                                  (x) =>
                                    x !==
                                    skill
                                ),
                            })
                          }
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )
                  )}

                  <input
                    value={skillInput}
                    onChange={(e) =>
                      setSkillInput(
                        e.target.value
                      )
                    }
                    onKeyDown={addSkill}
                    placeholder="Type skill + Enter"
                  />

                </div>

              </div>

              {/* SOCIAL LINKS */}

              <div className="full-field social-editor">

                <label className="field-label">
                  Social links
                </label>

                {(profile.socials || []).map(
                  (social, index) => (
                    <div
                      className="social-row"
                      key={index}
                    >

                      <input
                        value={
                          social.label ||
                          ""
                        }
                        onChange={(e) => {
                          const updated =
                            [
                              ...profile.socials,
                            ];

                          updated[index] = {
                            ...updated[
                              index
                            ],
                            label:
                              e.target.value,
                          };

                          setProfile({
                            ...profile,
                            socials:
                              updated,
                          });
                        }}
                        placeholder="Label"
                      />

                      <input
                        value={
                          social.url || ""
                        }
                        onChange={(e) => {
                          const updated =
                            [
                              ...profile.socials,
                            ];

                          updated[index] = {
                            ...updated[
                              index
                            ],
                            url:
                              e.target.value,
                          };

                          setProfile({
                            ...profile,
                            socials:
                              updated,
                          });
                        }}
                        placeholder="https://..."
                      />

                      <button
                        type="button"
                        className="icon-danger"
                        onClick={() =>
                          setProfile({
                            ...profile,
                            socials:
                              profile.socials.filter(
                                (_, j) =>
                                  j !==
                                  index
                              ),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  )
                )}

                <button
                  type="button"
                  className="add-link"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      socials: [
                        ...(profile.socials ||
                          []),
                        {
                          label:
                            "Website",
                          url:
                            "https://example.com",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={15} />
                  Add social link
                </button>

              </div>

            </div>

            <button
              className="primary-button save-profile"
              disabled={
                saving ||
                uploadingProfile
              }
              type="submit"
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save profile"}

            </button>

          </form>

        </section>

        {/* PROJECTS */}

        <section
          id="projects"
          className="editor-section"
        >

          <SectionTitle
            icon={<ImagePlus />}
            kicker="PROJECTS"
            title="Showcase your work"
          />

          <div className="project-admin-list">

            {(portfolio.projects || []).map(
              (p, index) => {

                const firstImage =
                  p.images?.[0]
                    ?.imageUrl ||
                  p.imageUrls?.[0] ||
                  "";

                return (
                  <div
                    className="project-admin-card"
                    key={p.id}
                  >

                    <div className="drag">
                      <GripVertical size={20} />
                    </div>

                    {firstImage ? (
                      <img
                        src={mediaUrl(
                          firstImage
                        )}
                        alt={
                          p.title ||
                          "Project"
                        }
                      />
                    ) : (
                      <div className="project-image-placeholder">
                        <ImagePlus size={28} />
                        <span>
                          No image
                        </span>
                      </div>
                    )}

                    <div className="project-admin-info">

                      <div className="project-meta">

                        {p.featured && (
                          <span className="featured">
                            FEATURED
                          </span>
                        )}

                        <span>
                          #
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                      </div>

                      <h3>
                        {p.title}
                      </h3>

                      <p>
                        {p.description}
                      </p>

                      <div className="tags">

                        {(
                          p.technologies ||
                          []
                        ).map(
                          (technology) => (
                            <span
                              key={
                                technology
                              }
                            >
                              {technology}
                            </span>
                          )
                        )}

                      </div>

                      <small className="image-count">
                        {
                          (
                            p.images ||
                            []
                          ).length
                        }{" "}
                        / 5 images
                      </small>

                    </div>

                    <div className="project-actions">

                      <button
                        type="button"
                        onClick={() =>
                          moveProject(
                            index,
                            -1
                          )
                        }
                        disabled={
                          index === 0
                        }
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveProject(
                            index,
                            1
                          )
                        }
                        disabled={
                          index ===
                          portfolio
                            .projects
                            .length -
                            1
                        }
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          editProject(p)
                        }
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="danger"
                        onClick={() =>
                          deleteProject(
                            p.id
                          )
                        }
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* PROJECT FORM */}

          <form
            className="panel project-form"
            onSubmit={saveProject}
          >

            <div className="form-title">

              <div>

                <span className="section-kicker">
                  {editingId
                    ? "EDIT PROJECT"
                    : "NEW PROJECT"}
                </span>

                <h2>
                  {editingId
                    ? "Update project"
                    : "Add a project"}
                </h2>

              </div>

              {editingId && (
                <button
                  type="button"
                  className="text-button"
                  onClick={
                    clearProjectForm
                  }
                >
                  Cancel
                </button>
              )}

            </div>

            <div className="form-grid">

              <Field label="Project title">
                <input
                  required
                  value={
                    project.title || ""
                  }
                  onChange={(e) =>
                    setProject({
                      ...project,
                      title:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. E-Commerce Platform"
                />
              </Field>

              {/* PROJECT IMAGES */}

              <div className="full-field">

                <label className="field-label">
                  Project images
                </label>

                <div className="project-upload-box">

                  <label className="upload-button">

                    <ImagePlus size={17} />

                    Add images

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      hidden
                      onChange={
                        handleProjectImages
                      }
                    />

                  </label>

                  <span>
                    Up to 5 images · Max
                    5MB each
                  </span>

                </div>

                {/* EXISTING IMAGES */}

                {editingProjectImages.length >
                  0 && (
                  <div className="image-preview-grid">

                    {editingProjectImages.map(
                      (image) => (
                        <div
                          className="image-preview-item"
                          key={image.id}
                        >

                          <img
                            src={mediaUrl(
                              image.imageUrl
                            )}
                            alt="Project"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              deleteExistingProjectImage(
                                editingId,
                                image.id
                              )
                            }
                          >
                            <X size={15} />
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

                {/* NEW IMAGES */}

                {projectImagePreviews.length >
                  0 && (
                  <div className="image-preview-grid">

                    {projectImagePreviews.map(
                      (item, index) => (
                        <div
                          className="image-preview-item"
                          key={`${item.file.name}-${index}`}
                        >

                          <img
                            src={item.preview}
                            alt="New project"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeNewProjectImage(
                                index
                              )
                            }
                          >
                            <X size={15} />
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

                <small className="image-counter">
                  {
                    editingProjectImages.length +
                    projectImageFiles.length
                  }{" "}
                  / 5 images selected
                </small>

              </div>

              <Field label="Live project URL">
                <input
                  type="url"
                  value={
                    project.projectUrl ||
                    ""
                  }
                  onChange={(e) =>
                    setProject({
                      ...project,
                      projectUrl:
                        e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </Field>

              <Field label="GitHub URL">
                <input
                  type="url"
                  value={
                    project.githubUrl ||
                    ""
                  }
                  onChange={(e) =>
                    setProject({
                      ...project,
                      githubUrl:
                        e.target.value,
                    })
                  }
                  placeholder="https://github.com/..."
                />
              </Field>

              <div className="full-field">

                <Field label="Description">

                  <textarea
                    required
                    rows="5"
                    value={
                      project.description ||
                      ""
                    }
                    onChange={(e) =>
                      setProject({
                        ...project,
                        description:
                          e.target.value,
                      })
                    }
                    placeholder="What did you build and why?"
                  />

                </Field>

              </div>

              {/* TECHNOLOGIES */}

              <div className="full-field">

                <label className="field-label">
                  Technology tags
                </label>

                <div className="tag-input">

                  {(
                    project.technologies ||
                    []
                  ).map(
                    (technology) => (
                      <span
                        key={
                          technology
                        }
                      >
                        {technology}

                        <button
                          type="button"
                          onClick={() =>
                            setProject({
                              ...project,
                              technologies:
                                project.technologies.filter(
                                  (x) =>
                                    x !==
                                    technology
                                ),
                            })
                          }
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )
                  )}

                  <input
                    value={techInput}
                    onChange={(e) =>
                      setTechInput(
                        e.target.value
                      )
                    }
                    onKeyDown={addTech}
                    placeholder="React + Enter"
                  />

                </div>

              </div>

              {/* FEATURED */}

              <label className="check-row">

                <input
                  type="checkbox"
                  checked={Boolean(
                    project.featured
                  )}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      featured:
                        e.target.checked,
                    })
                  }
                />

                Mark as featured project

              </label>

            </div>

            <button
              className="primary-button"
              disabled={saving}
              type="submit"
            >
              <Plus size={17} />

              {saving
                ? "Saving..."
                : editingId
                ? "Update project"
                : "Add project"}

            </button>

          </form>

        </section>

      </main>
    </div>
  );
}

// =====================================
// STAT CARD
// =====================================

function Stat({
  label,
  value,
}) {
  return (
    <div className="stat-card">

      <span>
        {label.toUpperCase()}
      </span>

      <strong>
        {String(value).padStart(
          2,
          "0"
        )}
      </strong>

      <small>
        managed in dashboard
      </small>

    </div>
  );
}

// =====================================
// SECTION TITLE
// =====================================

function SectionTitle({
  icon,
  kicker,
  title,
}) {
  return (
    <div className="section-title">

      <div className="title-icon">
        {icon}
      </div>

      <div>

        <span className="section-kicker">
          {kicker}
        </span>

        <h2>{title}</h2>

      </div>

    </div>
  );
}

// =====================================
// FORM FIELD
// =====================================

function Field({
  label,
  children,
}) {
  return (
    <label className="field">

      <span className="field-label">
        {label}
      </span>

      {children}

    </label>
  );
}