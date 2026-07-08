# Online Quiz Platform

A full-stack quiz platform with separate Admin and Student roles, supporting quiz creation, timed attempts, and result tracking.

## Features
- **Admin role:** create quizzes, add questions, manage quiz content
- **Student role:** attempt quizzes within a time limit, view results
- Timed quiz attempts with automatic submission
- Result tracking and performance history
- RESTful API layer connecting frontend and backend

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

## Project Structure
- **Backend/** – Express server, REST API routes, MongoDB models
- **Frontend/** – React application (Admin + Student views)

## How It Works
1. Admins log in and create quizzes with multiple-choice questions.
2. Students log in, browse available quizzes, and attempt them within the allotted time.
3. Responses are submitted to the backend, scored, and stored in MongoDB.
4. Students can view their past results and performance.
