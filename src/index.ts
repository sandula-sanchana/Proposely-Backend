import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();


const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("heyyyy")
})

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err.message);
})


app.listen(process.env.PORT, () => {
    console.log("App listening on port: " + process.env.PORT);
}