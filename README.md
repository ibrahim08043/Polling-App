Polling App - ConnectHear Full Stack Engineer Assignment
This project is a full-stack polling application built using the MERN stack (MongoDB, Express.js, React, Node.js) for the ConnectHear Full Stack Engineer Assignment. The app allows users to create, view, update, and delete polls, with real-time vote updates, anonymous voting, and image optimization features.
Project Overview
The app fulfills all requirements outlined in the assignment:

User Authentication: Secure registration and login using JWT and bcrypt.
CRUD Operations: Authenticated users can create, view, update, and delete polls.
Real-time Updates: Poll results update live using Socket.io.
Anonymous Voting: Non-logged-in users can vote, but poll creation/editing is restricted to authenticated users.
Poll Structure: Each poll has one image and 2–5 voting options.
Image Processing: Images are optimized using the TinyPNG API, with initial and final sizes displayed.
Technical Expectations: Clean UI, secure data handling, and robust front-end/back-end integration.
Submission Guidelines: Code is well-commented, and this README provides setup instructions and an overview.

Repository Structure

Polling-backend: Contains the Node.js/Express server, MongoDB models, routes, and controllers.
Polling-frontend: Contains the React frontend with components, services, and Socket.io client integration.
GitHub Repository: https://github.com/ibrahim08043/Polling-App

Setup Instructions
Prerequisites

Node.js (v16 or higher)
MongoDB (local or MongoDB Atlas)
Git (to clone the repository)

Backend Setup

Navigate to the backend folder:cd Polling-backend

Install dependencies:npm install

Create a .env file in the Polling-backend folder with the following variables:PORT=5000
PORT=3002
MONGO_URI=mongodb+srv://ibrahimkashif792:ik89374847@polling-app.a5blnzf.mongodb.net/
JWT_SECRET=supersecretjwtkey
TINYPNG_API_KEY=lJDdnGDZp8TtWcGnt0Dy7p839vnzfw5k

Start the backend server:npm start

The server will run on http://localhost:3002.



Frontend Setup

Navigate to the frontend folder:cd Polling-frontend

Install dependencies:npm install

Start the frontend development server:npm run dev

The frontend will run on http://localhost:3000.



Running the Application

Ensure MongoDB is running (local or Atlas).
Start the backend and frontend servers as described above.
Open http://localhost:5173 in your browser to access the app.
Register a user, log in, and start creating or voting on polls!

Code Documentation

Code Comments: Key functions in both backend (controllers/, routes/) and frontend (src/components/, src/services/) are commented to explain their purpose and logic. For example:
Backend: Comments in pollController.js describe poll creation and voting logic.
Frontend: Comments in CreatePoll.js explain form validation for 2–5 options.


Modular Structure:
Backend: Routes (routes/), controllers (controllers/), and models (models/)) are separated for maintainability.
Frontend: Reusable React components (src/components/), services (src/services/)) for API calls, and Socket.io integration are organized for scalability.

1. Approach
The Polling App was designed as a full-stack MERN project, separating backend and frontend logic for clarity and maintainability.

Backend (Polling-backend)
Tech Stack:

Node.js

Express.js

MongoDB (via Mongoose)

Socket.IO

JWT, bcryptjs (for authentication)

Multer (for image upload)

dotenv, cors, helmet, etc. (for environment & security)

Main Functionalities:

User Registration and Login:
Users can sign up and log in securely. Passwords are hashed with bcrypt, and tokens are issued using JWT for authentication.

Poll Creation:
Authenticated users can create polls, define multiple options (with custom IDs), and optionally paste an image URL or select suggested images.

Voting:
Users can vote for a single option in a poll. Backend prevents multiple votes per user per poll.

Real-time Voting Updates:
Using Socket.IO, vote counts are updated live across all clients connected to the poll.

Image Optimization:
Multer handles file uploads, and services like TinyPNG or ShortPixel can be integrated to optimize image size and storage efficiency.

API Structure:

/api/auth → Signup & login

/api/polls → CRUD for polls and voting

Frontend (Polling-frontend)
Tech Stack:

React.js + TypeScript (using Vite)

Axios (for API calls)

Socket.IO-client

Tailwind CSS + shadcn/ui (UI components)

React Router DOM

FormData API for image upload

UI Features:

Authentication Pages:
Signup and Login forms using React state hooks. JWT token is stored locally for subsequent requests.

Poll List Page:
Displays all polls with basic information including question, creator, and thumbnail (if uploaded).

Create/Edit Poll Page:
Users can dynamically add poll options and upload images (either from file or via external URL). A visual preview helps confirm inputs before submission.

Poll Detail Page:
Shows options, current vote counts, and a vote button. Real-time vote updates occur via WebSockets.

Reusable Components:

Input, Label, Button, Card from shadcn/ui

Avatar, dropdowns, icons from lucide-react

Modular state management via useState and useEffect

2. Challenges Faced
a. Real-time Socket.IO Integration
Ensuring the backend emits vote updates only after successful DB operations.

Managing socket connections and cleanup on the client side to avoid memory leaks.

Handling cases where users leave/join mid-session.

b. Image Uploading and Optimization
Supporting both file uploads and direct URLs on the frontend.

Sending files with FormData and parsing them correctly in Express via Multer.

Providing clear feedback in the UI when an image fails to upload or optimize.

c. Preventing Double Voting
Ensuring a user cannot vote multiple times in the same poll.

Managing this efficiently on both the client and server level using user-poll relationship checks.

d. User State and Protected Routes
Keeping the JWT token in sync with React's routing flow.

Redirecting users correctly on login/logout without breaking the route history.

e. Form Management with Dynamic Fields
Handling a dynamic number of options with unique client-side IDs.

Preventing submission of incomplete or duplicate options.

f. Frontend Performance
Avoiding excessive re-renders especially during real-time vote updates.

Displaying image previews and loading states without UI flicker.

3. Assumptions Made
Authenticated Users Only:
Only logged-in users can create or vote in polls. Viewing is allowed for guests (based on UI choice).

Poll Options Are Static Once Created:
Options cannot be modified after a poll is published to ensure data consistency.

Each Poll Belongs to a User:
Every poll is linked via the createdBy field in the backend and displayed on the frontend via population (username, email).

Vote Restriction Per User Per Poll:
A user can vote once per poll. Future logic may allow unvoting or revoting, but not in current scope.

Image Upload is Optional:
The app works with or without an image. Fallback visuals or placeholders are shown if no image is present.

Single Server Instance:
The current design does not account for scaling Socket.IO over multiple servers or clusters.

Conclusion
This Polling App is a solid MERN-based real-time project that supports polling with authentication, image support, and dynamic form handling. The separation of backend and frontend, along with real-time functionality, provides both a scalable structure and engaging UX. With further enhancements (pagination, analytics, vote history, scaling Socket.IO), it could be extended into a full production-level product.

For any issues or questions, contact me at ibrahimkashif792@gmail.com or at Whatsapp 0321-9213132. Thank you for reviewing my submission!
