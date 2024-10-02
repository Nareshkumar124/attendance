import { Router } from "express";
import { verifyJwt } from "../middlewares/auth";
import {
    addDay,
    addDaysCsv,
    getCalendarRange,
} from "../controllers/calendar.controller";

const calendarRouter: Router = Router();

calendarRouter.route("/").post(verifyJwt, addDay);
calendarRouter.route("/upload").post(verifyJwt, addDaysCsv);
calendarRouter.route("/range").post(verifyJwt, getCalendarRange);

export { calendarRouter };
