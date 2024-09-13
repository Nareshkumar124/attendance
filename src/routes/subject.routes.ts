import { Router } from "express";
import {
    getSubject,
    getSubjectAccordingToFaculty,
    getSubjectAccordingToStudent,
    addSubject,
} from "../controllers/subject.controllers";
import { verifyJwt } from "../middlewares/auth";

const subjectRouter: Router = Router();

subjectRouter.route("/").get(verifyJwt, getSubject).post(verifyJwt, addSubject);

subjectRouter.route("/faculty").get(verifyJwt, getSubjectAccordingToFaculty);

subjectRouter.route("/student").get(verifyJwt, getSubjectAccordingToStudent);

export { subjectRouter };
