import express from "express";
import cors from "cors";
import path from "path";
import packageRoutes from "./routes/packages";
import bookingRoutes from "./routes/bookings";
import userRoutes from "./routes/users";
import visaRoutes from "./routes/visas";
import paymentRoutes from "./routes/payments";
import webhookRoutes from "./routes/webhooks";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import cmsRoutes from "./routes/cms";
import { config } from "./config";
import { ok } from "./utils/http";

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

app.use("/api/v1/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/packages", packageRoutes);
apiRouter.use("/bookings", bookingRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/visas", visaRoutes);
apiRouter.use("/payments", paymentRoutes);
apiRouter.use("/dashboard", dashboardRoutes);
apiRouter.use("/cms", cmsRoutes);
apiRouter.get("/health", (_req, res) => ok(res, { status: "ok", message: "Umrah Premium API is running" }));

app.use("/api/v1", apiRouter);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
