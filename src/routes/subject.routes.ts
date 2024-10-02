import { Router } from "express";
import {
    getSubject,
    getSubjectAccordingToFaculty,
    getSubjectAccordingToStudent,
    addSubject,
} from "../controllers/subject.controllers";
import { verifyJwt } from "../middlewares/auth";

const subjectRouter: Router = Router();

subjectRouter.route("/").post(verifyJwt, getSubject);
subjectRouter.route("/create").post(verifyJwt, addSubject);

subjectRouter.route("/faculty").post(verifyJwt, getSubjectAccordingToFaculty);

subjectRouter.route("/student").post(verifyJwt, getSubjectAccordingToStudent);

export { subjectRouter };
