# GenAI: AI Image Generation Suite

GenAI is an all-in-one platform for creating high-quality, unique images using a suite of state-of-the-art AI models from Freepik.

## ✨ Features

## 🚀 Multi-Model AI Generation

This project integrates multiple Freepik AI models to support a wide range of creative image generation workflows. Each model is optimized for different performance, quality, and artistic needs — allowing users to choose the best tool for their task.

## ✨ Available Models

- **Classic Fast**  
  Optimized for speed and cost efficiency. Ideal for generating standard-quality images quickly without sacrificing usability.

- **Flux Dev**  
  Delivers fast, high-quality image generation with enhanced creative filters — perfect for rapid prototyping and experimentation.

- **Mystic AI**  
  Designed for ultra-realistic outputs with advanced controls, including style and structural references for precise creative direction.

- **Imagen3**  
  A versatile model supporting a broad spectrum of artistic styles and visual effects, suitable for diverse creative applications.

## 🔐 Secure Authentication

A complete, production-ready authentication system powered by **JWT** and **bcrypt**, including:

- User registration with OTP email verification
- Secure login flow
- Password reset functionality
- Protected routes with role-based access

---

## 🖼 Comprehensive Image History

### 👤 User Gallery

- Personalized image history for logged-in users
- Easy browsing of past creations

### 🛠 Admin Dashboard

- Dedicated admin panel to monitor platform activity
- View all generated images in one place

### ♾ Infinite Scroll & Sorting

- Smooth infinite scrolling experience
- Sorting options for efficient browsing

---

## 🎨 Responsive & Interactive Frontend

Built using **Next.js** and **ShadCN UI** for a modern, mobile-friendly experience:

- Clean and intuitive interface
- Dynamic controls tailored to each AI model
- Image upload with automatic Base64 conversion  
  _(for Mystic style reference support)_

---

## ⚙ Robust Backend Architecture

A scalable **Node.js + Express** backend that handles:

- API request processing
- User authentication and authorization
- Image history management
- Business logic and data flow

## 🚀 Tech Stack

### 🖥 Frontend

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **State Persistence**: redux-persist
- **API Client**: [Axios](https://axios-http.com/)
- **Validation**: Zod
- **Notifications**: Sonner

---

### ⚙ Backend

- **Framework**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- **Language**: JavaScript / TypeScript

#### Backend Packages

- JWT / jsonwebtoken — authentication & authorization
- bcrypt — password hashing
- axios — external API requests
- cloudinary — image upload & management
- cookie-parser — cookie handling
- cors — cross-origin resource sharing
- dotenv — environment configuration
- express-rate-limit — API rate limiting
- mongoose — MongoDB object modeling
- nodemailer — email services

---

### 🗄 Database

- [MongoDB](https://www.mongodb.com/)

---

### ☁ Deployment & Storage

- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Frontend Deployment**: [Vercel](https://vercel.com/)
- **Backend Deployment**: [Render](https://render.com/)

---

### 🤖 Key Services

- **Freepik AI Models**
  - Mystic AI
  - Imagen3
  - Flux Dev
- **Nodemailer** — email verification & notifications

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm, pnpm, or yarn
- A MongoDB database instance (local or Atlas)
- A Cloudinary account for image storage
- An API key for the Freepik services

### Installation

1.  **Clone the repository:**

    ```
    git clone https://github.com/thegreatraj01/AutoMateFbPost.git
    cd AutoMateFbPost
    ```

2.  **Install frontend dependencies:**

    ```
    cd client
    npm install
    ```

3.  **Install backend dependencies:**

    ```
    cd server
    npm install
    ```

4.  **Set up Environment Variables:**

    You will need to create `.env` files for both the client and server. Sample files (`.env.sample`) are provided in their respective directories.

    **A. Server Environment (`server/.env`):**

    Create a `.env` file in the `server` directory by copying the `server/.env.sample` file and filling in your credentials.

    **B. Client Environment (`client/.env`):**

    Create a `.env` file in the `client` directory by copying the client/.env.sample file and filling in your credentials.

    ```
    # URL for client-side API requests (browser)
    NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

    # URL for server-side API requests (e.g., in Server Actions or API Routes)
    NEXT_SERVER_API_URL=http://localhost:5000/api/v1
    ```

### Running the Application Locally

1.  **Start the backend server:**

    ```
    cd server
    npm run dev
    ```

    The server will be available at `http://localhost:5000`.

2.  **Start the frontend development server:**
    ```
    cd client
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## 📁 Project Structure

```
.
├── client/         # Next.js Frontend
│   └── src/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── store/
├── server/         # Node.js/Express Backend
│   └── src/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       └── utils/
└── README.md
```

## 📄 API Endpoints

A brief overview of the main API endpoints available.

- `POST /api/v1/auth/register`: User registration.
- `POST /api/v1/auth/login`: User login.
- `POST /api/v1/auth/verify-email`: Verify user's email with OTP.
- `POST /api/v1/freepik/generate/mystic`: Generate an image with Mystic AI.
- `POST /api/v1/freepik/generate/imagen`: Generate an image with Imagen3.
- `POST /api/v1/freepik/generate/flux-dev`: Generate an image with Flux.
- `GET /api/v1/history/user`: Get the authenticated user's image history.
- `GET /api/v1/history/admin`: Get all images for the admin dashboard.

---

```

```
