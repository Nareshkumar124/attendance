import {Router} from 'express';
import {verifyJwt} from '../middlewares/auth';
import {addDay,addDaysCsv} from '../controllers/calendar.controller';


const calendarRouter:Router=Router();


calendarRouter.route("/").post(verifyJwt,addDay);
calendarRouter.route("/upload").post(verifyJwt,addDaysCsv);

export {
    calendarRouter
}