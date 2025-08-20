import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import taskRouter from "./routes/task.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

//routes import
app.get("/", (_, res) => {
  res.send("Server Working Fine !!");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/todos", taskRouter);

export default app;
