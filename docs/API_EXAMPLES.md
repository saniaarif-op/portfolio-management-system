# API Examples

Base URL: `http://localhost:5000/api`

## Register

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Sania Arif",
  "username": "sania",
  "email": "sania@example.com",
  "password": "StrongPass123"
}
```

## Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "demo@portfolio.dev",
  "password": "Demo@12345"
}
```

Copy the returned token into:
`Authorization: Bearer YOUR_TOKEN`

## Update profile

```http
PUT /portfolio/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

## Public portfolio

```http
GET /portfolio/sania
```

## Add project

```http
POST /portfolio/projects
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "My Project",
  "description": "A useful project built to solve a real problem.",
  "imageUrl": "https://example.com/image.jpg",
  "projectUrl": "https://example.com",
  "githubUrl": "https://github.com/example/project",
  "technologies": ["React", "Node.js"],
  "featured": true
}
```
