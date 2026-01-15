# Manpower System - React Frontend

Modern React frontend with Tailwind CSS for the Manpower Management System.

## Features

- 🎨 Beautiful UI with Tailwind CSS
- 🔐 Authentication & Authorization
- 📱 Responsive Design
- 🎯 React Router for navigation
- 📊 Real-time status tracking
- 📄 Document management
- 👥 Admin panel

## Installation

```bash
cd react-frontend
npm install
```

## Configuration

Create a `.env` file in the `react-frontend` directory:

```
REACT_APP_API_URL=http://localhost:8080
```

## Running the Application

```bash
npm start
```

The app will run on `http://localhost:3000`

## Building for Production

```bash
npm run build
```

## Project Structure

```
src/
  components/     # Reusable components
  contexts/       # React contexts (Auth)
  pages/          # Page components
    candidate/    # Candidate pages
    admin/        # Admin pages
  services/       # API services
```

## Backend API

Make sure your Spring Boot backend is running on `http://localhost:8080`

## Technologies Used

- React 18
- React Router 6
- Tailwind CSS 3
- React Icons
- Axios

