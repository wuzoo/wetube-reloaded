export const localsMiddleware = (req, res, next) => {
    res.locals.loggedin = Boolean(req.session.loggedin);
    res.locals.siteName = "Wetube";
    res.locals.loggedinUser = req.session.user;
    next();
};