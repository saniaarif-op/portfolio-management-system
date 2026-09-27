import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { publicUser, parseJson } from "../utils/portfolio.js";

const router = Router();

/* -------------------------------------------------------
   UPLOAD DIRECTORIES
------------------------------------------------------- */

const profileUploadDir = path.resolve("uploads/profile");
const projectUploadDir = path.resolve("uploads/projects");

fs.mkdirSync(profileUploadDir, { recursive: true });
fs.mkdirSync(projectUploadDir, { recursive: true });

/* -------------------------------------------------------
   MULTER STORAGE
------------------------------------------------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      cb(null, profileUploadDir);
    } else {
      cb(null, projectUploadDir);
    }
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    cb(null, uniqueName);
  }
});

/* -------------------------------------------------------
   IMAGE VALIDATION
------------------------------------------------------- */

const imageUpload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, and WEBP images are allowed.")
      );
    }

    cb(null, true);
  }
});

/* -------------------------------------------------------
   SCHEMAS
------------------------------------------------------- */

const profileSchema = z.object({
  name: z.string().min(2).max(80),

  username: z.string().regex(
    /^[a-zA-Z0-9_-]{3,30}$/
  ),

  title: z.string().max(100),

  bio: z.string().max(1000),

  location: z.string().max(100),

  resumeUrl: z.string().max(500).optional(),

  skills: z.array(
    z.string().min(1).max(40)
  ).max(30),

  socials: z.array(
    z.object({
      label: z.string().min(1).max(30),
      url: z.string().url()
    })
  ).max(10)
});

const projectSchema = z.object({
  title: z.string().min(2).max(100),

  description: z.string().min(10).max(2000),

  projectUrl: z.string().url().or(z.literal("")).optional(),

  githubUrl: z.string().url().or(z.literal("")).optional(),

  technologies: z.array(
    z.string().min(1).max(40)
  ).max(15),

  featured: z.boolean().optional()
});

/* -------------------------------------------------------
   GET CURRENT USER PORTFOLIO
------------------------------------------------------- */

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id
    },

    include: {
      projects: {
        orderBy: {
          sortOrder: "asc"
        },

        include: {
          images: {
            orderBy: {
              sortOrder: "asc"
            }
          }
        }
      }
    }
  });

  res.json({
    portfolio: publicUser(user)
  });
});

/* -------------------------------------------------------
   GET PUBLIC PORTFOLIO
------------------------------------------------------- */

router.get("/:username", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      username: req.params.username.toLowerCase()
    },

    include: {
      projects: {
        orderBy: {
          sortOrder: "asc"
        },

        include: {
          images: {
            orderBy: {
              sortOrder: "asc"
            }
          }
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({
      message: "Portfolio not found."
    });
  }

  res.json({
    portfolio: publicUser(user)
  });
});

/* -------------------------------------------------------
   UPDATE PROFILE INFORMATION
------------------------------------------------------- */

router.put("/profile", requireAuth, async (req, res) => {
  const data = profileSchema.parse(req.body);

  const normalized = data.username.toLowerCase();

  const duplicate = await prisma.user.findFirst({
    where: {
      username: normalized,
      NOT: {
        id: req.user.id
      }
    }
  });

  if (duplicate) {
    return res.status(409).json({
      message: "Username is already taken."
    });
  }

  const user = await prisma.user.update({
    where: {
      id: req.user.id
    },

    data: {
      ...data,

      username: normalized,

      skills: JSON.stringify(data.skills),

      socials: JSON.stringify(data.socials)
    },

    include: {
      projects: {
        orderBy: {
          sortOrder: "asc"
        },

        include: {
          images: {
            orderBy: {
              sortOrder: "asc"
            }
          }
        }
      }
    }
  });

  res.json({
    portfolio: publicUser(user)
  });
});

/* -------------------------------------------------------
   UPLOAD PROFILE PICTURE
------------------------------------------------------- */

router.post(
  "/profile/image",
  requireAuth,
  imageUpload.single("profileImage"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a profile picture."
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Delete previous profile image
    if (user.avatarUrl) {
      const oldPath = path.resolve(
        user.avatarUrl.replace("/uploads/", "uploads/")
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const imageUrl = `/uploads/profile/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.id
      },

      data: {
        avatarUrl: imageUrl
      }
    });

    res.json({
      message: "Profile picture uploaded successfully.",
      avatarUrl: updatedUser.avatarUrl
    });
  }
);

/* -------------------------------------------------------
   REMOVE PROFILE PICTURE
------------------------------------------------------- */

router.delete(
  "/profile/image",
  requireAuth,
  async (req, res) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    if (user.avatarUrl) {
      const oldPath = path.resolve(
        user.avatarUrl.replace("/uploads/", "uploads/")
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await prisma.user.update({
      where: {
        id: req.user.id
      },

      data: {
        avatarUrl: ""
      }
    });

    res.json({
      message: "Profile picture removed."
    });
  }
);

/* -------------------------------------------------------
   CREATE PROJECT
------------------------------------------------------- */

router.post(
  "/projects",
  requireAuth,
  async (req, res) => {
    const data = projectSchema.parse(req.body);

    const count = await prisma.project.count({
      where: {
        userId: req.user.id
      }
    });

    const project = await prisma.project.create({
      data: {
        title: data.title,

        description: data.description,

        projectUrl: data.projectUrl || "",

        githubUrl: data.githubUrl || "",

        technologies: JSON.stringify(
          data.technologies
        ),

        featured: data.featured || false,

        sortOrder: count,

        userId: req.user.id
      },

      include: {
        images: {
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    });

    res.status(201).json({
      project: {
        ...project,

        technologies: parseJson(
          project.technologies
        )
      }
    });
  }
);

/* -------------------------------------------------------
   UPLOAD PROJECT IMAGES
   MAXIMUM = 5
------------------------------------------------------- */

router.post(
  "/projects/:id/images",
  requireAuth,
  imageUpload.array("projectImages", 5),
  async (req, res) => {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,

        userId: req.user.id
      },

      include: {
        images: true
      }
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        message: "Please select at least one image."
      });
    }

    const currentCount = project.images.length;

    if (currentCount + files.length > 5) {
      // Delete newly uploaded files because upload is invalid
      for (const file of files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      return res.status(400).json({
        message: `A project can have a maximum of 5 images. You currently have ${currentCount}.`
      });
    }

    const createdImages = await prisma.$transaction(
      files.map((file, index) =>
        prisma.projectImage.create({
          data: {
            imageUrl: `/uploads/projects/${file.filename}`,

            sortOrder: currentCount + index,

            projectId: project.id
          }
        })
      )
    );

    res.json({
      message: "Project images uploaded successfully.",

      images: createdImages
    });
  }
);

/* -------------------------------------------------------
   DELETE PROJECT IMAGE
------------------------------------------------------- */

router.delete(
  "/projects/:projectId/images/:imageId",
  requireAuth,
  async (req, res) => {
    const image = await prisma.projectImage.findFirst({
      where: {
        id: req.params.imageId,

        projectId: req.params.projectId,

        project: {
          userId: req.user.id
        }
      }
    });

    if (!image) {
      return res.status(404).json({
        message: "Project image not found."
      });
    }

    const imagePath = path.resolve(
      image.imageUrl.replace("/uploads/", "uploads/")
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await prisma.projectImage.delete({
      where: {
        id: image.id
      }
    });

    res.json({
      message: "Project image deleted."
    });
  }
);

/* -------------------------------------------------------
   REORDER PROJECTS
------------------------------------------------------- */

router.put(
  "/projects/reorder",
  requireAuth,
  async (req, res) => {
    const schema = z.object({
      ids: z.array(z.string()).min(0)
    });

    const { ids } = schema.parse(req.body);

    const owned = await prisma.project.findMany({
      where: {
        userId: req.user.id
      },

      select: {
        id: true
      }
    });

    const ownedIds = new Set(
      owned.map((p) => p.id)
    );

    if (
      ids.some((id) => !ownedIds.has(id)) ||
      ids.length !== ownedIds.size
    ) {
      return res.status(400).json({
        message: "Invalid project ordering."
      });
    }

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.project.update({
          where: {
            id
          },

          data: {
            sortOrder: index
          }
        })
      )
    );

    res.json({
      message: "Project order saved."
    });
  }
);

/* -------------------------------------------------------
   UPDATE PROJECT
------------------------------------------------------- */

router.put(
  "/projects/:id",
  requireAuth,
  async (req, res) => {
    const data = projectSchema.parse(req.body);

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,

        userId: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    const updated = await prisma.project.update({
      where: {
        id: project.id
      },

      data: {
        title: data.title,

        description: data.description,

        projectUrl: data.projectUrl || "",

        githubUrl: data.githubUrl || "",

        technologies: JSON.stringify(
          data.technologies
        ),

        featured: data.featured || false
      },

      include: {
        images: {
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    });

    res.json({
      project: {
        ...updated,

        technologies: parseJson(
          updated.technologies
        )
      }
    });
  }
);

/* -------------------------------------------------------
   DELETE PROJECT
------------------------------------------------------- */

router.delete(
  "/projects/:id",
  requireAuth,
  async (req, res) => {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,

        userId: req.user.id
      },

      include: {
        images: true
      }
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    // Delete project image files
    for (const image of project.images) {
      const imagePath = path.resolve(
        image.imageUrl.replace("/uploads/", "uploads/")
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.project.delete({
      where: {
        id: project.id
      }
    });

    res.json({
      message: "Project deleted."
    });
  }
);

export default router;