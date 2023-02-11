import mongoose from "mongoose";

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_URL, {
});

const db = mongoose.connection;

// 단지 mongoDB 연결 확인
const handleOpen = () => console.log("Connected to DB");
db.on("error", (error) => console.log("DB error", error));
db.once("open", handleOpen);
