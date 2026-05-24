import { Router } from 'express';
import {register,login} from "../controllers/authController";
import {authMiddleware} from "../middleware/authMiddleware";
import {roleMiddleware} from "../middleware/roleMiddleware";


const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, (req, res) => {
    res.json({
        message: "Protected route working",
    });
});

router.get(
    "/admin-test",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => {
        res.json({
            message: "Admin route working",
        });
    }
);


export default router;