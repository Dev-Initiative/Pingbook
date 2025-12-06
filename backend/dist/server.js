import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import labelRoutes from "./routes/labelRoutes.js";
import sharedContactRoutes from "./routes/sharedContactRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Express session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Contact Management API",
            version: "1.0.0",
            description: "API for managing contacts, users, and related operations",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
            {
                url: "https://pingbook-n33t.onrender.com",
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        username: { type: "string" },
                        email: { type: "string", format: "email" },
                        phone: { type: "string" },
                        avatar: { type: "string" },
                        emailVerified: { type: "boolean" },
                        googleId: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Contact: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        firstname: { type: "string" },
                        lastname: { type: "string" },
                        email: { type: "string", format: "email" },
                        phone: { type: "string" },
                        address: { type: "string" },
                        userId: { type: "string" },
                        photoUrl: { type: "string" },
                        labels: { type: "array", items: { type: "string" } },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                    required: ["firstname", "lastname", "phone", "userId"],
                },
                Label: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        color: { type: "string" },
                        description: { type: "string" },
                        userId: { type: "string" },
                        contacts: { type: "array", items: { type: "string" } },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                    required: ["name", "userId"],
                },
                SharedContact: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        contacts: { type: "array", items: { type: "string" } },
                        sharedByUserId: { type: "string" },
                        sharedWithUserId: { type: "string" },
                        status: {
                            type: "string",
                            enum: ["accepted", "pending", "rejected"],
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                    required: ["contacts", "sharedByUserId", "sharedWithUserId"],
                },
                Settings: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        userId: { type: "string" },
                        theme: { type: "string", enum: ["light", "dark"] },
                        notificationsEnabled: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                    required: ["userId"],
                },
                Export: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        userId: { type: "string" },
                        format: { type: "string", enum: ["csv", "vcf"] },
                        status: {
                            type: "string",
                            enum: ["completed", "in_progress", "failed"],
                        },
                        labelId: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                    required: ["userId", "format"],
                },
                Notification: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        userId: { type: "string" },
                        message: { type: "string" },
                        type: { type: "string" },
                        isRead: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                    required: ["userId", "message"],
                },
                ApiResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                    },
                },
                AuthResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        token: { type: "string" },
                        user: { $ref: "#/components/schemas/User" },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts"], // Paths to files containing OpenAPI definitions
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/labels", labelRoutes);
app.use("/api/shared-contacts", sharedContactRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/exports", exportRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => {
    res.send("Contact management system backend says hello.");
});
// Connect to database and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port`, PORT);
    });
});
//# sourceMappingURL=server.js.map