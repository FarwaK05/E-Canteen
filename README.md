# E-Canteen System

A modern university E-Canteen System built using React, TypeScript, Tailwind CSS, and Supabase.

The system allows students to browse menu items, place orders online, upload payment proofs, and track order status while staff can manage menu items and process orders efficiently.

---

## Features

### Student Features

- Google Authentication
- Browse food menu
- Search food items
- Place orders online
- Select pickup time slot
- Upload payment screenshot
- Track order status
- Receive notifications

### Staff Features

- Manage menu items
- View all orders
- Verify payments
- Update order status
- Manage food availability

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Supabase

### Database

- PostgreSQL (Supabase)

### Authentication

- Supabase Auth
- Google OAuth

### Storage

- Supabase Storage

### Realtime

- Supabase Realtime

---

# Software Architecture

The project follows a layered architecture combined with design patterns for maintainability and scalability.

## Architecture Style

### Layered Architecture

The application is divided into the following layers:

```
Presentation Layer
        ↓
Business Logic Layer
        ↓
Data Access Layer
        ↓
Supabase Backend
```

### 1. Presentation Layer

Responsible for:

- UI Components
- Pages
- Forms
- User Interaction

Examples:

- Login Page
- Menu Page
- Order Page
- Dashboard

---

### 2. Business Logic Layer

Responsible for:

- Order Processing
- Validation
- Authentication Logic
- Notification Handling

Examples:

- AuthController
- OrderController
- NotificationController

---

### 3. Data Layer

Responsible for:

- Database communication
- API requests
- Storage operations

Examples:

- Supabase Client
- Database Services

---

# Design Patterns Used

## 1. Factory Pattern

Used for creating application objects in a centralized manner.

Examples:

- UserFactory
- NotificationFactory

Benefits:

- Reduces object creation complexity
- Improves maintainability

---

## 2. Observer Pattern

Used for real-time updates and notifications.

Examples:

- OrderObserver
- NotificationObserver

Benefits:

- Decouples components
- Real-time synchronization

---

## 3. State Pattern

Used to manage order lifecycle.

Order States:

```text
Pending Payment
      ↓
Payment Verification
      ↓
Confirmed
      ↓
Preparing
      ↓
Ready For Pickup
      ↓
Completed
```

Benefits:

- Controlled state transitions
- Easy status management

---

## 4. MVC Principles

The project loosely follows MVC principles:

### Model

Database entities

- Users
- Orders
- Menu Items

### View

React Components

### Controller

Business Logic Services

---

# Project Structure

```text
src/
│
├── components/
├── pages/
├── layouts/
├── services/
├── controllers/
├── hooks/
├── context/
├── utils/
├── types/
├── assets/
│
└── supabase/
    └── client.ts
```

---

# Supabase Setup

## Create Supabase Project

1. Create account at:
   https://supabase.com

2. Create a new project

3. Wait for database initialization

4. Open:

Settings → API

Copy:

- Project URL
- Anon Public Key

---

## Configure Authentication

Enable:

Authentication → Providers

Enable:

- Google Provider

Add:

- Google Client ID
- Google Client Secret

---

## Configure Storage

Create bucket:

```text
payment-screenshots
```

Used for:

- Payment proofs
- Transaction screenshots

---

# Environment Variables

Create a file:

```bash
.env
```

Add:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co

VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Example:

```env
VITE_SUPABASE_URL=https://abcxyz.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

# Supabase Client Configuration

Create:

```text
src/supabase/client.ts
```

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
```

---

# Installation

Clone repository

```bash
git clone <repository-url>
```

Move into project

```bash
cd project-name
```

Install dependencies

```bash
npm install
```

---

# Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# Build Project

```bash
npm run build
```

---

# Database Tables

### profiles

Stores user information.

### food_items

Stores menu items.

### orders

Stores order details.

### order_items

Stores ordered products.

### notifications

Stores user notifications.

---

# Security

The project uses:

- Supabase Authentication
- Row Level Security (RLS)
- Protected Routes
- Role-Based Access Control

---

# Future Improvements

- Online Payment Gateway
- QR Code Pickup
- Order Analytics
- Mobile Application
- AI-based Food Recommendation

---

# Authors

Air University BSSE Project

Developed for Software Design & Architecture (SDA).
