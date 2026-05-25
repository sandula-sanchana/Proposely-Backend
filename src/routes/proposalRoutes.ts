import express from "express";

import {
    createProposal,
    getMyProposals,
    getProposalById, getProposalFeedback, resolveProposalComment,
    submitProposal, updateProposal,
} from "../controllers/proposalController";

import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("STUDENT"),
    createProposal
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("STUDENT"),
    getMyProposals
);

router.post(
    "/:id/submit",
    authMiddleware,
    roleMiddleware("STUDENT"),
    submitProposal
);

router.patch(
    "/comments/:commentId/resolve",
    authMiddleware,
    roleMiddleware("STUDENT"),
    resolveProposalComment
);

router.get(
    "/:id/feedback",
    authMiddleware,
    roleMiddleware("STUDENT"),
    getProposalFeedback
);


router.get(
    "/:id",
    authMiddleware,
    getProposalById
);

router.patch(
    "/:id",
    authMiddleware,
    roleMiddleware("STUDENT"),
    updateProposal
);





export default router;