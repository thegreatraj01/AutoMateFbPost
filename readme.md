# GenAI: AI Image Generation Suite

GenAI is an all-in-one platform for creating high-quality, unique images using a suite of state-of-the-art AI models from Freepik.

## ✨ Features

-   **Multi-Model AI Generation**: Integrates several Freepik APIs for diverse creative needs:
    -   **Mystic AI**: For ultra-realistic images with advanced controls like style and structure references.
    -   **Imagen3**: A versatile model with a wide range of artistic styles and effects.
    -   **Flux Dev**: For fast, high-quality image generation with creative filters.
-   **Secure Authentication**: Full user authentication flow using JWT, including registration, login with email verification (OTP), and password reset.
-   **Comprehensive Image History**:
    -   **User-Specific History**: Logged-in users can view their past creations in a personal gallery.
    -   **Admin Dashboard**: A separate, protected view for administrators to see all images generated on the platform.
    -   **Infinite Scroll**: Smoothly load and browse image history with sorting options.
-   **Responsive & Interactive Frontend**:
    -   A clean, intuitive, and mobile-friendly UI built with **Next.js** and **ShadCN UI**.
    -   Dynamic controls tailored to each AI model.
    -   Image upload with Base64 conversion for Mystic's style reference feature.
-   **Robust Backend**: A **Node.js/Express** backend handles API requests, user data, and business logic.

## 🚀 Tech Stack

-   **Frontend**:
    -   **Framework**: [Next.js](https://nextjs.org/) (App Router)
    -   **Language**: [TypeScript](https://www.typescriptlang.org/)
    -   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
    -   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
    -   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
    -   **API Client**: [Axios](https://axios-http.com/)
-   **Backend**:
    -   **Framework**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
    -   **Language**: JavaScript/TypeScript
-   **Database**:
    -   [MongoDB](https://www.mongodb.com/)
-   **Deployment & Storage**:
    -   **Image Storage**: [Cloudinary](https://cloudinary.com/)
-   **Key Services**:
    -   Freepik AI (Mystic, Imagen3, Flux Dev)
    -   Nodemailer (for sending verification emails)

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v18.x or later)
-   npm, pnpm, or yarn
-   A MongoDB database instance (local or Atlas)
-   A Cloudinary account for image storage
-   An API key for the Freepik services

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

-   `POST /api/v1/auth/register`: User registration.
-   `POST /api/v1/auth/login`: User login.
-   `POST /api/v1/auth/verify-email`: Verify user's email with OTP.
-   `POST /api/v1/freepik/generate/mystic`: Generate an image with Mystic AI.
-   `POST /api/v1/freepik/generate/imagen`: Generate an image with Imagen3.
-   `POST /api/v1/freepik/generate/flux-dev`: Generate an image with Flux.
-   `GET /api/v1/history/user`: Get the authenticated user's image history.
-   `GET /api/v1/history/admin`: Get all images for the admin dashboard.

---
```
