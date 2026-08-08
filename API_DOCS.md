# 📡 Lakshya — API Reference Documentation

This document provides a detailed specification for all serverless API endpoints available in Lakshya. All API routes are built using Next.js App Router API handlers (`app/api/`) and interact with Supabase PostgreSQL and Google Gemini AI.

---

## 🔐 Authentication & Session Security

- Most endpoints require an active Supabase user session.
- Unauthenticated requests to protected endpoints return `401 Unauthorized`.
- Sessions are validated on the server via `@supabase/ssr` server cookies.

---

## 📑 Table of Contents

1. [AI & Intelligence Endpoints](#1-ai--intelligence-endpoints)
2. [Goals & Personalization Endpoints](#2-goals--personalization-endpoints)
3. [Roadmap & Milestones Endpoints](#3-roadmap--milestones-endpoints)
4. [Task Management Endpoints](#4-task-management-endpoints)
5. [Calendar & Events Endpoints](#5-calendar--events-endpoints)
6. [Notes Endpoints](#6-notes-endpoints)
7. [Pomodoro Endpoints](#7-pomodoro-endpoints)
8. [Timetable Endpoints](#8-timetable-endpoints)
9. [User Preferences & Theme Endpoints](#9-user-preferences--theme-endpoints)

---

## 1. AI & Intelligence Endpoints

### `POST /api/ai/chat`
Saathi AI Chatbot endpoint grounded in the student's real account data.

- **Auth Required**: Yes (`401` if missing)
- **Request Body**:
  ```json
  {
    "message": "What should I focus on today?"
  }
  ```
- **Response Shape**:
  ```json
  {
    "response": "📚 Today's tasks:\n• Master Graph Algorithms (Priority: high)\n\nFocus on Core Topics — start with highest priority in a Pomodoro! 🔥",
    "timestamp": "2026-08-08T16:00:00.000Z",
    "model": "gemini-3.5-flash-lite"
  }
  ```

---

### `POST /api/ai/validate-goal`
Evaluates semantic compatibility between a selected goal category and free-text target input.

- **Auth Required**: No (Public check helper)
- **Request Body**:
  ```json
  {
    "goalType": "upsc",
    "targetInput": "JP Morgan SDE-1 Placement"
  }
  ```
- **Response Shape (Mismatch Detected)**:
  ```json
  {
    "valid": false,
    "reason": "Target 'JP Morgan SDE-1 Placement' belongs to Placements, not UPSC Civil Services."
  }
  ```
- **Response Shape (Valid)**:
  ```json
  {
    "valid": true,
    "reason": ""
  }
  ```

---

### `POST /api/ai/recommendations`
Generates personalized weekly productivity advice using Gemini AI based on user task history.

- **Auth Required**: Yes
- **Response Shape**:
  ```json
  {
    "recommendations": [
      "Dedicate 2 hours daily for high-priority DSA topics.",
      "Review completed weak subject notes before starting new chapters."
    ]
  }
  ```

---

### `POST /api/ai/what-now`
Generates a quick single recommendation on what task to execute next based on current focus patterns.

- **Auth Required**: Yes
- **Response Shape**:
  ```json
  {
    "suggestion": "Start your 45-minute Pomodoro on 'Master Graph Algorithms' to maintain your 3-day streak!"
  }
  ```

---

## 2. Goals & Personalization Endpoints

### `POST /api/goals/select`
Activates a selected goal category and deactivates former goals for the authenticated user.

- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "goalType": "placement"
  }
  ```
- **Response Shape**:
  ```json
  {
    "success": true,
    "goal": {
      "id": "uuid-v4-string",
      "type": "placement",
      "title": "PLACEMENT Preparation",
      "is_active": true
    }
  }
  ```

---

### `POST /api/personalization`
Saves user personalization survey data (Step 1–5 preferences).

- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "currentLevel": "3rd Year BTech CSE",
    "weakSubjects": ["Graph Algorithms", "DBMS"],
    "strongSubjects": ["Data Structures", "Aptitude"],
    "dailyAvailableHours": 5,
    "preferredStudyTime": "morning",
    "weekendAvailability": "full",
    "hasCollegeSchedule": true,
    "collegeHoursPerWeek": 20,
    "examDate": "2026-12-01",
    "targetRankScore": "SDE-1 at Amazon, Tier-1 Product Company Offer",
    "stressLevel": 3,
    "goalId": "placement"
  }
  ```
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Personalization preferences saved successfully"
  }
  ```

---

### `GET /api/personalization`
Retrieves saved personalization record for the authenticated user.

- **Auth Required**: Yes
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": {
      "current_level": "3rd Year BTech CSE",
      "daily_available_hours": 5,
      "exam_date": "2026-12-01",
      "target_rank_score": "SDE-1 at Amazon"
    }
  }
  ```

---

## 3. Roadmap & Milestones Endpoints

### `POST /api/generate-roadmap`
Triggers Gemini AI to generate 5–6 phase milestones and 20+ tasks for the user's active goal.

- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "goalType": "startup",
    "userInput": "Launch MVP & Acquire 100 paying users"
  }
  ```
- **Response Shape**:
  ```json
  {
    "success": true,
    "goal": {
      "id": "uuid-v4",
      "title": "Startup Launch & MVP Roadmap",
      "description": "Comprehensive milestone roadmap...",
      "targetDate": "2026-12-01"
    },
    "milestonesCount": 6,
    "tasksCount": 24
  }
  ```

---

### `GET /api/milestones`
Fetches all milestones for the authenticated user's active goal.

- **Auth Required**: Yes
- **Response Shape**:
  ```json
  {
    "milestones": [
      {
        "id": "uuid-v4",
        "title": "Foundation & Strategic Planning",
        "description": "Initial phase",
        "status": "not_started",
        "order_index": 1
      }
    ],
    "goalType": "startup"
  }
  ```

---

### `PATCH /api/milestones`
Updates milestone completion status.

- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "id": "milestone-uuid",
    "status": "completed"
  }
  ```
- **Response Shape**:
  ```json
  {
    "milestone": {
      "id": "milestone-uuid",
      "status": "completed"
    }
  }
  ```

---

## 4. Task Management Endpoints

### `GET /api/tasks`
Fetches tasks for the user, with optional filters by `goalId` or `status`.

- **Auth Required**: Yes
- **Query Parameters**: `?goalId=uuid&status=todo`
- **Response Shape**:
  ```json
  {
    "tasks": [
      {
        "id": "uuid-v4",
        "title": "Solve 50 LeetCode Medium DSA problems",
        "description": "Focus on Arrays & Strings",
        "status": "todo",
        "priority": "high",
        "estimated_hours": 15,
        "due_date": "2026-09-01"
      }
    ]
  }
  ```

---

### `POST /api/tasks`
Creates a new task.

- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Complete System Design Module",
    "description": "Study LLD patterns",
    "priority": "high",
    "due_date": "2026-09-10",
    "estimated_hours": 4
  }
  ```
- **Response Shape**:
  ```json
  {
    "task": {
      "id": "uuid-v4",
      "title": "Complete System Design Module",
      "status": "todo"
    }
  }
  ```

---

### `PATCH /api/tasks/[id]`
Updates a task's title, status, priority, or due date.

- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "status": "completed"
  }
  ```
- **Response Shape**:
  ```json
  {
    "task": {
      "id": "uuid-v4",
      "status": "completed"
    }
  }
  ```

---

### `DELETE /api/tasks/[id]`
Deletes a task by ID.

- **Auth Required**: Yes
- **Response Shape**:
  ```json
  {
    "success": true
  }
  ```

---

## 5. Calendar & Events Endpoints

### `GET /api/events`
Fetches user calendar events within an optional date range (`start` and `end`).

- **Auth Required**: Yes
- **Query Parameters**: `?start=2026-08-01T00:00:00Z&end=2026-08-31T23:59:59Z`
- **Response Shape**:
  ```json
  {
    "events": [
      {
        "id": "event-uuid",
        "title": "Graph Algorithms Deep Dive",
        "start_time": "2026-08-10T09:00:00Z",
        "end_time": "2026-08-10T11:00:00Z",
        "event_type": "task",
        "color": "#f59e0b",
        "task_id": "task-uuid"
      }
    ]
  }
  ```

---

### `POST /api/events`
Creates a calendar event (e.g. scheduling a task).

- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Graph Algorithms Deep Dive",
    "description": "Focused problem solving session",
    "start_time": "2026-08-10T09:00:00.000Z",
    "end_time": "2026-08-10T11:00:00.000Z",
    "event_type": "task",
    "color": "#f59e0b",
    "task_id": "task-uuid"
  }
  ```
- **Response Shape**:
  ```json
  {
    "event": {
      "id": "event-uuid",
      "title": "Graph Algorithms Deep Dive"
    }
  }
  ```

---

## 6. Notes Endpoints

### `GET /api/notes`
Fetches all user notes.

- **Auth Required**: Yes
- **Response Shape**:
  ```json
  {
    "notes": [
      {
        "id": "note-uuid",
        "title": "Operating Systems Quick Revision",
        "content": "{\"type\":\"doc\",\"content\":[...]}",
        "tags": ["OS", "Revision"],
        "is_favorite": true,
        "updated_at": "2026-08-08T10:00:00Z"
      }
    ]
  }
  ```

---

### `POST /api/notes`
Creates a new note.

- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Operating Systems Quick Revision",
    "content": "{\"type\":\"doc\",\"content\":[...]}",
    "content_type": "json",
    "tags": ["OS", "Revision"],
    "is_favorite": true
  }
  ```

---

### `PATCH /api/notes/[id]` & `DELETE /api/notes/[id]`
Updates or deletes a specific note by ID.

---

## 7. Pomodoro Endpoints

### `POST /api/pomodoro`
Logs a completed Pomodoro focus session.

- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "duration_minutes": 25,
    "completed_at": "2026-08-08T16:30:00.000Z"
  }
  ```
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": {
      "id": "session-uuid",
      "duration_minutes": 25
    }
  }
  ```

---

## 8. Timetable Endpoints

### `GET /api/timetable` & `POST /api/timetable`
Retrieves or creates weekly recurring class/study timetable slots.

---

## 9. User Preferences & Theme Endpoints

### `GET /api/user/onboarding-status`
Checks if the user has completed goal selection and personalization.

- **Auth Required**: Yes
- **Response Shape**:
  ```json
  {
    "authenticated": true,
    "hasGoal": true,
    "hasPersonalization": true,
    "isComplete": true,
    "nextStep": null
  }
  ```

---

### `GET /api/user/theme` & `PUT /api/user/theme`
Fetches or updates the user's workspace theme palette (`midnight-navy`, `dusty-bloom`, `emerald-prestige`, `sakura-mauve`, `violet-dusk`).
