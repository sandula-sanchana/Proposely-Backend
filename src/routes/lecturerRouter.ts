import { Router } from 'express';
import {authMiddleware} from "../middleware/authMiddleware";
import {roleMiddleware} from "../middleware/roleMiddleware"
import { getAllLecturers } from '../controllers/lectureController';

const router = Router();

router.get(
    "/lecturers",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAllLecturers
);


export default router