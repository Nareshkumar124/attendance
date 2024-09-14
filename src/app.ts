import express, { Application } from "express";
import cors from "cors";
import { userRouter } from "./routes/user.routes";
import { studentRouter } from "./routes/student.routes";
import { departmentRouter } from "./routes/department.routes";
import { courseRouter } from "./routes/course.routes";
import { facultyRouter } from "./routes/faculty.routes";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { subjectRouter } from "./routes/subject.routes";

const app: Application = express();

// MiddleWare........
const corsOptions = {
    origin: "*", // Allow all origins
    credentials: true,
};

app.use(cors(corsOptions));

app.use(
    express.json({
        limit: "16kb",
    })
);

app.use(express.urlencoded({ limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.use(morgan("combined")); // Use for showing request in terminal

// Router
app.use("/api/v1/user", userRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/department", departmentRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/faculty", facultyRouter);
app.use("/api/v1/subject", subjectRouter);

export default app;
