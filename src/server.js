import "./db.js"; // DB가 연결되었는지 확인
import Video from "./models/video"; // 연결 확인 후 Video model을 인식시킴
import express from "express";
import morgan from "morgan";

import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import rootRouter from "./routers/rootRouter";

import session from "express-session";
import flash from "express-flash";

import {localsMiddleware} from "./middlewares";

import MongoStore from "connect-mongo";
import apiRouter from "./routers/apiRouter.js";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({extended: true}));
app.use(flash());

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DB_URL}),
})) // session middleware


// app.use((req, res, next) => {
//     req.sessionStore.all((error, sessions) => {
//         console.log(sessions);
//         next();
//     })
// })

app.use(localsMiddleware);

app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
// 정적 파일 제공

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
