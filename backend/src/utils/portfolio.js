export function parseJson(value, fallback = []) {
  try {
    const parsed = JSON.parse(value || "");
    return parsed;
  } catch {
    return fallback;
  }
}

export function publicUser(user) {
  return {
    id: user.id,

    name: user.name,

    username: user.username,

    email: user.email,

    title: user.title,

    bio: user.bio,

    location: user.location,

    avatarUrl: user.avatarUrl,

    resumeUrl: user.resumeUrl,

    skills: parseJson(user.skills),

    socials: parseJson(user.socials),

    projects: (user.projects || [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => ({
        id: p.id,

        title: p.title,

        description: p.description,

        projectUrl: p.projectUrl,

        githubUrl: p.githubUrl,

        technologies: parseJson(p.technologies),

        featured: p.featured,

        sortOrder: p.sortOrder,

        images: (p.images || [])
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image) => ({
            id: image.id,

            imageUrl: image.imageUrl,

            sortOrder: image.sortOrder
          })),

        imageUrls: (p.images || [])
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image) => image.imageUrl)
      }))
  };
}