import express from "express";

import {
    createProposal,
    getMyProposals,
    getProposalById,
    submitProposal,
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

router.get(
    "/:id",
    authMiddleware,
    getProposalById
);

export default router;