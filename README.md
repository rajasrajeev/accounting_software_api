# **Accounting Software API**

This repository contains the backend API for an accounting software system, built with **Express.js** and **Prisma**. The API supports functionalities such as user management, role-based access control, and transaction handling.

---

## **Features**

- **Authentication**: Secure user authentication using JWT.
- **Role Management**: Assign and manage roles (e.g., Admin, Accountant).
- **Database Integration**: PostgreSQL with Prisma ORM.
- **CRUD Operations**: Manage users, roles, and accounting transactions.
- **Scalability**: Modular architecture for easy feature expansion.

---

## **Prerequisites**

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
- [Prisma CLI](https://www.prisma.io/docs/getting-started/quickstart)

---

## **Installation**

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/accounting-software-api.git
   cd accounting-software-api

2. **Install dependencies**:

    ```bash
    npm install

3. **Set up environment variables**: Create a .env file in the project root with the following:

    ```bash
    DATABASE_URL=postgresql://username:password@localhost:5432/dbname
    JWT_SECRET=your_jwt_secret

4. **Seed the database (optional)**: Populate the database with initial data (e.g., roles and admin user)

    ```bash
    npm run seed

## **Project Structure**

**Structure of the project**
    ```bash
    ├── prisma/
    │   ├── schema.prisma       # Prisma schema file
    │   ├── migrations/         # Migration files
    │   └── seeds/              # Database seed scripts
    ├── src/
    │   ├── controllers/        # API Controllers
    │   ├── middlewares/        # Middleware functions
    │   ├── models/             # Prisma Models
    │   ├── routes/             # API Routes
    │   ├── utils/              # Utility functions
    │   └── app.js              # Main Express app
    ├── .env                    # Environment variables
    ├── package.json            # Project configuration
    ├── README.md               # Project documentation
    └── LICENSE                 # License file
