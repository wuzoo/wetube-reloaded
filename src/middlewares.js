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