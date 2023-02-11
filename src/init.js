import "dotenv/config";
import "./db.js"; // DB가 연결되었는지 확인
import Video from "./models/video"; // 연결 확인 후 Video model을 인식시킴
import app from "./server";
import User from "./models/User";

const PORT = 4000;
const handleListening = () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
};
app.listen(PORT, handleListening);