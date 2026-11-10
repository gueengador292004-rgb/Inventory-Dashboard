# Inventory Dashboard (CRUD)

Dashboard application with full CRUD built with **Express.js** and **SQLite** (better-sqlite3).

## Features
- Dashboard cards: total products, total units, inventory value, low-stock count
- Create, Read, Update, Delete products
- Search by name or category
- REST API + vanilla JS frontend

## Setup
```bash
npm install
npm start
```
Open http://localhost:3000 (the `data.db` file is created automatically).

## API
| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| GET    | /api/products?q=    | List / search      |
| GET    | /api/products/:id   | Get one            |
| POST   | /api/products       | Create             |
| PUT    | /api/products/:id   | Update             |
| DELETE | /api/products/:id   | Delete             |
| GET    | /api/stats          | Dashboard stats    |

## Submit
1. Push to a **public** GitHub repo.
2. Screen-record the demo, upload to Google Drive, set to "Anyone with the link".
3. Submit only the GitHub URL and Drive URL (deadline: November 10).
