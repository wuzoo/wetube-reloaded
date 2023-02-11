import User from "../../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import { token } from "morgan";

export const getJoin = (req, res) => 
    res.render("join", {pageTitle: "Join"})
export const postJoin = async (req, res) => {
    const {name, username, email, password, password2, location} = req.body;
    if (password !== password2){
        return res.render("/join", {pageTitle: "Join",
        errorMessage: "Password confirmaion does not match"});
    }
    const exists = await User.exists({
        $or: [{username}, {email}]
    });
    if (exists){
        return res.render("join", {pageTitle: "Join", 
        errorMessage: "This username/email is already taken."})
    }
    await User.create({
        name,
        username,
        email,
        password,
        location,
    })
    return res.redirect("/login");
}
export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});

export const postLogin = async(req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({username, socialOnly: false});
    if (!user){
        return res.status(400).render("login", {pageTitle: "Login"
        ,errorMessage: "An account with this username does not exists."})
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok){
        return res.status(400).render("login", {pageTitle: "Login"
        ,errorMessage: "Wrong Password."});
    }
    req.session.loggedin = true;
    req.session.user = user;
    console.log("LOG USER IN! COMING SOON!");
    return res.redirect("/");
}
export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(`${finalUrl}`);
};
export const finishGithubLogin = async (req, res) =>{
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config= {
        client_id:process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (await fetch(finalUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    })).json();

    if ("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (await fetch(`${apiUrl}/user`, { // user data
        headers: {
            Authorization : `Bearer ${access_token}`,
            }
        })).json();
        // console.log(userData);
        const emailData = await(await fetch(`${apiUrl}/user/emails`, { // email data
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        })).json();
        // console.log(emailData);
        const emailObj = emailData.find( // email data 중 verified, primary인 나의 emailObj 찾기
            (email) => email.verified === true && email.primary === true
        );
        if (!emailObj)
            return res.redirect("/login")
        let user = await User.findOne({email: emailObj.email});
        if (!user){
                user = await User.create({
                name:userData.name? userData.name : "Unknown",
                socialOnly: true,
                username: userData.login,
                email: emailObj.email,
                password:"", 
                location: userData.location,
            });
        }
        req.session.loggedin = true;
        req.session.user = user;
        return res.redirect("/");
    }else {
        return res.redirect("/login");
    }
};
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
}
export const edit = (req, res) => res.send("Edit User");
export const see = (req, res) => res.send("See");
