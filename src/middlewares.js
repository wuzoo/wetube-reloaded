import multer from "multer";

export const localsMiddleware = (req, res, next) => {
    res.locals.loggedin = Boolean(req.session.loggedin);
    res.locals.siteName = "Wetube";
    res.locals.loggedinUser = req.session.user;
    next();
};

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedin){
        next();
    }else{
        return res.redirect("/login");
    }
}
export const publicOnlyMiddleware = (req, res, next) =>{
    if(! req.session.loggedin){
        next();
    }else{
        return res.redirect("/");
    }
}
export const avatarUpload = multer({
    dest: "uploads/avatars/",
    limits: {
        fileSize: 3000000,
    }
}); 
export const videoUpload = multer({
    dest: "uploads/videos/",
    limits: {
        fileSize: 10000000,
    }
})
// 사용자가 보낸 파일을 uploads 폴더에 저장하도록 설정된 middleware
