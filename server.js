import express from "express";
import morgan from "morgan";
import userRouter from "./src/routers/userRouter";
import videoRouter from "./src/routers/videoRouter";
import globalRouter from "./src/routers/globalRouter";

const PORT = 4000;
const app = express();
const logger = morgan("dev");

app.use(logger);

app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

const handleListening = () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
};

app.listen(PORT, handleListening);
