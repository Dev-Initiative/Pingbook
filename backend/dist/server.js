import "./src/config/env.js";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./src/config/passport.js";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import labelRoutes from "./src/routes/labelRoutes.js";
import sharedContactRoutes from "./src/routes/sharedContactRoutes.js";
import settingsRoutes from "./src/routes/settingsRoutes.js";
import exportRoutes from "./src/routes/exportRoutes.js";
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
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/labels", labelRoutes);
app.use("/api/shared-contacts", sharedContactRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/exports", exportRoutes);
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