import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoProjects = [
  {
    title: "Rahnuma — Voice Accessibility App",
    description: "An AI-powered Android accessibility application designed to make navigation and daily digital assistance easier through voice interaction.",
    imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
    projectUrl: "",
    githubUrl: "",
    technologies: JSON.stringify(["Kotlin", "Android", "Firebase", "AI"]),
    featured: true,
    sortOrder: 0
  },
  {
    title: "Task Sphere",
    description: "A responsive productivity experience for organizing tasks with a clean, interactive interface.",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80",
    projectUrl: "",
    githubUrl: "",
    technologies: JSON.stringify(["Flutter", "Dart", "UI/UX"]),
    featured: true,
    sortOrder: 1
  },
  {
    title: "Full-Stack Task Manager",
    description: "A database-connected task management application with REST APIs, authentication-ready architecture and responsive views.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    projectUrl: "",
    githubUrl: "",
    technologies: JSON.stringify(["React", "Node.js", "Express", "MongoDB"]),
    featured: false,
    sortOrder: 2
  }
];

async function main() {
  const passwordHash = await bcrypt.hash("Demo@12345", 12);

  const user = await prisma.user.upsert({
    where: { username: "sania" },
    update: {
      passwordHash,
      name: "Sania Arif",
      email: "demo@portfolio.dev"
    },
    create: {
      name: "Sania Arif",
      username: "sania",
      email: "demo@portfolio.dev",
      passwordHash,
      title: "Full Stack Developer",
      bio: "Computer Science graduate passionate about full-stack development, mobile applications and thoughtful UI/UX.",
      location: "Pakistan",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      resumeUrl: "",
      skills: JSON.stringify(["React", "Node.js", "Express", "Flutter", "Kotlin", "Figma", "REST APIs"]),
      socials: JSON.stringify([
        { label: "GitHub", url: "https://github.com/" },
        { label: "LinkedIn", url: "https://www.linkedin.com/" }
      ])
    }
  });

  await prisma.project.deleteMany({ where: { userId: user.id } });
  await prisma.project.createMany({
    data: demoProjects.map((p) => ({ ...p, userId: user.id }))
  });

  console.log("Seeded demo portfolio.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
