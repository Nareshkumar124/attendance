import {Router} from 'express';
import {addTestData} from '../controllers/test.controller';    
import {verifyJwt} from '../middlewares/auth';
const router=Router()

router.route("/test-data").post(verifyJwt,addTestData)

export {router as testRouter}