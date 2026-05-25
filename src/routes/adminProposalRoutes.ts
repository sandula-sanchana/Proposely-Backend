import express from "express";

import {
    getAllSubmittedProposals,
    assignLecturerToProposal,
} from "../controllers/adminProposalController";

import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAllSubmittedProposals
);

router.patch(
    "/:id/assign",
    authMiddleware,
    roleMiddleware("ADMIN"),
    assignLecturerToProposal
);

export default router;