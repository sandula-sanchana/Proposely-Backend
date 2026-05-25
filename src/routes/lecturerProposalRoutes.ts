import express from "express";

import {
    addProposalComment,
    getMyAssignedProposals, getProposalComments,
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

router.post(
    "/:id/comments",
    authMiddleware,
    roleMiddleware("LECTURER"),
    addProposalComment
);

router.get(
    "/:id/comments",
    authMiddleware,
    roleMiddleware("LECTURER"),
    getProposalComments
);

export default router;