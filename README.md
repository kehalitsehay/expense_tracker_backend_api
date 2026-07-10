# 🪙 Secure Expense Tracker API

A production-ready, highly secure RESTful API for tracking personal finances. Built with Node.js, Express, and PostgreSQL, this backend features robust authentication, real-time budget forecasting alerts, advanced query pagination, and rate-limiting safeguards.

---

## 🚀 Core Features

* **Secure Authentication:** User signup and login powered by **bcrypt** password hashing and **JSON Web Tokens (JWT)** for session management.
* **Complete Expense CRUD:** Secure endpoints to create, read, update, and delete expenses restricted strictly to the authenticated user context.
* **Smart Budget Tracking & Warnings:** Tracks monthly spending thresholds dynamically, issuing real-time warning indicators (`80% warning` / `100% exceeded`) upon adding new transactions.
* **Advanced Slicing & Pagination:** Server-side pagination controls combined with flexible query parameters to filter transactions by **Category** or **Date Ranges**.
* **Security Guardrails:** Layered defense with custom **Express Rate Limiting** to block brute-force attacks on sensitive endpoints.
* **Database Containerization:** Fully containerized relational layer powered by Dockerized **PostgreSQL**.

---

## 🛠️ Tech Stack & Architecture

* **Runtime Environment:** Node.js (ES6+ Modules)
* **Web Framework:** Express.js
* **Database Engine:** PostgreSQL (via `pg` connection pooling)
* **Security & Auth:** JSON Web Tokens (JWT), Bcrypt, Express-Rate-Limit
* **Containerization:** Docker

---

## 🗺️ API Reference

### 🔐 Authentication Endpoints (`/api/users`)

| Method | Endpoint | Description | Rate Limit Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Sign up a new user account | Max 10 requests / hr |
| **POST** | `/login` | Authenticate user and fetch JWT Session Token | Max 5 requests / 15 mins |
| **GET** | `/` | Fetchs all registered users
| **GET** | `/:id` | Fetch registered user by Id

### 💸 Expense Management Endpoints (`/api/expenses`)

> ⚠️ **Note:** All expense operations require a valid JWT passed in the HTTP Headers as: `Authorization: Bearer <TOKEN>`

| Method | Endpoint | Query Options | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | None | Create expenses (triggers budget alert evaluation). |
| **GET** | `/` | `category`, `startDate`, `endDate`, `page`, `limit` | Fetch paginated matching results. |
| **GET** | `/total/sum` | `category`, `startDate`, `endDate` | Fetch aggregated sum total of matched metrics. |
| **GET** | `/:id` | None | Fetch a unique expense item by ID. |
| **PUT** | `/:id` | None | Partial/Full update of an existing item row. |
| **DELETE**| `/:id` | None | Hard purge an expense row from data index. |