import express from "express";

import {
    getMyAssignedProposals,
    reviewProposal,
} from "../controllers/lecturerProposalController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = express.Router();

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("LECTURER"),
    getMyAssignedProposals
);

router.patch(
    "/:id/review",
    authMiddleware,
    roleMiddleware("LECTURER"),
    reviewProposal
);

export default router;