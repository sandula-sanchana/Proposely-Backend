import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {Request, Response} from "express";

import authRoutes from "./routes/authRoutes";
import proposalRoutes from "./routes/proposalRoutes";
import adminProposalRoutes from "./routes/adminProposalRoutes";
import lecturerProposalRoutes from "./routes/lecturerProposalRoutes";
import lecturerRouters from "./routes/lecturerRouter";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

app.use(cors());
app.use(express.json());

app.get("/", (req:Request,res:Response) => {
    res.send("heyyyy");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/proposals", proposalRoutes); //st
app.use("/api/v1/admin/proposals", adminProposalRoutes); //admin
app.use("/api/v1/lecturer/proposals", lecturerProposalRoutes); //lec
app.use("/api/v1/admin", lecturerRouters); //lec

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("MongoDB connection failed");
        console.log(err.message);
    });

app.listen(PORT, () => {
    console.log("App listening on port: " + PORT);
});