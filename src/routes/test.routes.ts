import {Router} from 'express';
import {addTestData} from '../controllers/test.controller';    

const router=Router()

router.route("/test-data").post(addTestData)

export {router as testRouter}