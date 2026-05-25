import express from "express";

import {
    addProposalComment,
    generateProposalAIReview,
    getMyAssignedProposals,
    getProposalAIReviewHistory,
    getProposalComments,
    getProposalVersions,
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

router.get(
    "/:id/versions",
    authMiddleware,
    roleMiddleware("LECTURER"),
    getProposalVersions
);

router.post(
    "/:id/ai-review",
    authMiddleware,
    roleMiddleware("LECTURER"),
    generateProposalAIReview
);

router.get(
    "/:id/ai-reviews",
    authMiddleware,
    roleMiddleware("LECTURER"),
    getProposalAIReviewHistory
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

router.patch(
    "/:id/review",
    authMiddleware,
    roleMiddleware("LECTURER"),
    reviewProposal
);

export default router;