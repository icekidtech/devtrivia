# 🎮 DevTrivia  
*A real-time, interactive quiz platform for tech events (inspired by Kahoot).*  

![DevTrivia Demo](https://via.placeholder.com/800x400?text=DevTrivia+Demo+GIF+Here)  

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Endpoints (Backend)](#api-endpoints-backend)
- [Frontend Routes](#frontend-routes)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [Debugging Tips](#debugging-tips)
- [Roadmap](#roadmap)
- [License](#license)
- [Owner](#owner)

## 🌟 Features  
- **🎯 Guest Mode**: Join quizzes without signing up.  
- **⚡ Real-Time Play**: Live leaderboard, WebSockets, and dynamic scoring.  
- **🤖 AI Question Generation**: OpenAI-powered quiz questions.  
- **🛠️ Moderator Tools**: Create/manage quizzes, export results (CSV/PDF).  
- **🎨 Theming**: Dark/light mode + custom branding.  

---

## 🛠 Tech Stack  
| **Area**       | **Technology**                              |  
|----------------|--------------------------------------------|  
| **Frontend**   | Next.js (TypeScript + Tailwind CSS)        |  
| **Backend**    | NestJS (Node.js)                           |  
| **Database**   | PostgreSQL + Prisma ORM                    |  
| **Realtime**   | Socket.IO                                  |  
| **Auth**       | NextAuth.js (JWT + Guest Mode)             |  
| **AI**         | OpenAI API (Question generation)           |  
| **Deployment** | Vercel (Frontend) + Railway (Backend)      |  

---

## 📂 Project Structure  
```plaintext
devtrivia/
├── backend/           # NestJS backend
│   ├── src/          
│   │   ├── auth/      # JWT authentication  
│   │   ├── quizzes/   # Quiz logic (CRUD, WebSockets)  
│   │   ├── users/     # User management  
│   │   └── main.ts    # App entry point  
│   └── prisma/        # DB schema + migrations  
│
├── frontend/          # Next.js frontend  
│   ├── src/app/       # App Router (Next.js 13+)  
│   ├── components/    # React UI components  
│   └── lib/           # API clients, utilities  
│
├── .env.example       # Environment variables template  
└── README.md          # This file  
```

---

## 🚀 Quick Start  
### 1. Clone & Install  
```bash
git clone https://github.com/icekidtech/devtrivia.git
cd devtrivia
cd backend && pnpm install
cd ../frontend && ppnpm install
```

### 2. Set Up Database  
1. Install PostgreSQL and create a database named `devtrivia`.  
2. Update `backend/.env`:  
   ```ini
   DATABASE_URL="postgresql://user:password@localhost:5432/devtrivia?schema=public"
   JWT_SECRET="your-jwt-secret-here"
   OPENAI_API_KEY="sk-your-openai-key"  # Optional for AI questions
   ```
3. Run migrations:  
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma studio  # Optional: GUI to view DB
   ```

### 3. Run Servers  
- **Backend**:  
  ```bash
  cd backend
  pnpm run start:dev  # http://localhost:3000
  ```
- **Frontend**:  
  ```bash
  cd ../frontend
  pnpm run dev        # http://localhost:3001
  ```

---

## 🔌 API Endpoints (Backend)  
| **Endpoint**          | **Method** | **Description**                |  
|-----------------------|-----------|--------------------------------|  
| `/api/auth/guest`     | `POST`    | Generate a guest session       |  
| `/api/quizzes/create` | `POST`    | Create a new quiz (Moderator)  |  
| `/api/socket.io`      | `WS`      | Realtime quiz events           |  

---

## 🌐 Frontend Routes  
| **Route**       | **Description**                |  
|----------------|--------------------------------|  
| `/`            | Homepage + quiz join           |  
| `/moderator`   | Quiz creation dashboard        |  
| `/play/[id]`   | Live quiz session              |  

---

## 🔧 Scripts  
| **Command**               | **Action**                          |  
|--------------------------|------------------------------------|  
| `pnpm run dev` (FE/BE)   | Start dev server                   |  
| `npx prisma studio`      | Open DB GUI (http://localhost:5555)|  
| `npx prisma migrate dev` | Run DB migrations                  |  

---

## 📜 Environment Variables  
### Backend (`.env`)  
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/devtrivia?schema=public"
JWT_SECRET="change-this-to-a-random-string"
OPENAI_API_KEY="sk-..."  # Only if using AI
```

### Frontend (`.env.local`)  
```ini
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
NEXTAUTH_SECRET="same-as-jwt-secret"
```

---

## 🐛 Debugging Tips  
- **Database Issues**: Run `npx prisma studio` to inspect tables.  
- **CORS Errors**: Ensure `backend/src/main.ts` allows your frontend origin.  
- **Socket.IO**: Verify the WebSocket path matches in both frontend/backend.  

---

## 📅 Roadmap  
- [ ] Implement guest join flow  
- [ ] Add WebSockets for realtime play  
- [ ] Integrate OpenAI question generation  

---

## 📜 License  
[MIT](#license)  

## 🙌 Owner  
- [Udoh Idopise Edwin](https://github.com/icekidtech)
