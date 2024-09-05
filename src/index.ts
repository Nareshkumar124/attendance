import app from "./app";
import db from "./db/db";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

db()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : http://localhost:${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
