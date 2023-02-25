import User from "../../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import { token } from "morgan";
import { application, response } from "express";
import Video from "../../models/video";

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
        console.log(userData);
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
                avatarUrl: userData.avatar_url,
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
export const startKakaoLogin = (req, res) => {
    const baseUrl = "https://kauth.kakao.com/oauth/authorize";
    const config = {
        client_id: process.env.KK_CLIENT,
        redirect_uri: "http://localhost:4000/users/kakao/finish",
        response_type: "code",
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}
export const finishKakaoLogin = async (req, res) => {
    const baseUrl = "https://kauth.kakao.com/oauth/token";
    const config = {
        client_id: process.env.KK_CLIENT,
        redirect_uri: "http://localhost:4000/users/kakao/finish",
        code: req.query.code,
        grant_type: "authorization_code",
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (await fetch(finalUrl, {
        method: "POST",
    })).json();
    if ("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://kapi.kakao.com/v2/user/me";
        const userData = await (await fetch(`${apiUrl}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        })).json();
        console.log(userData);
        const kakaoAccount = userData.kakao_account;
        console.log(kakaoAccount);
        const kakaoEmail = kakaoAccount.email;
        const kakaoProfile = kakaoAccount.profile;

        if (kakaoAccount.is_email_valid === false ||
            kakaoAccount.is_email_verified === false){
                return res.redirect("/login");
            }

        let user = await User.findOne({email: kakaoEmail})
        if (!user){
            user = await User.create({
                name: kakaoProfile.nickname,
                socialOnly:true,
                username:kakaoProfile.nickname,
                email:kakaoAccount.email,
                password:"",
                location:"",
            });
        }
        req.session.loggedin = true;
        req.session.user = user;
        return res.redirect("/")
    }else{
        return res.redirect("/login")
    }
}
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
}
export const getEdit = (req, res) => {
    console.log(req.session);
    return res.render("edit-profile", {pageTitle: "Edit Profile"});
};

export const postEdit = async (req, res) => {
    const {
        session: {
            user : {_id, avatarUrl},
        },
        body: {
            name, email, username, location,
        }, file,
    } = req;

    console.log(file);
    // Unique property인 email user 중복 체크 확인
    const Existemail = await User.findOne({email});
    const Existuser = await User.findOne({username});
    if (Existuser && Existuser._id.toString() !== _id){
        return res.render("edit-profile", {pageTitle: "Edit Profile",
        errorMessage: "Username is already exists."})
    }
    if (Existemail && Existemail._id.toString() !== _id){
        return res.render("edit-profile", {pageTitle: "Edit Profile",
        errorMessage: "Email is already exists."})
    }

    const updatedUser = await User.findByIdAndUpdate(_id, {
        avatarUrl: file ? file.path : avatarUrl,
        name, 
        email, 
        username, 
        location
    },
    { 
        new : true
    });
    req.session.user = updatedUser;
    return res.render("edit-profile", {pageTitle: "Edit Profile"});
};

export const getChangePassword = (req, res) => {
    return res.render("change-password", {pageTitle: "Change Password"});
}
export const postChangePassword = async (req, res) => {
    const {
        session: {
            user : {_id, password},
        },
        body: {
            oldPassword, newPassword, newPasswordConfirmation,
        },
    } = req;
    const ok = await bcrypt.compare(oldPassword, password);
    if (oldPassword === newPassword){
        return res.status(400).render("change-password", {pageTitle: "Change Password",
            errorMessage: "The old password equals new password"});
    }
    if (!ok){
        return res.status(400).render("change-password", {pageTitle: "Change Password", 
            errorMessage: "Current password is incorrect"});
    }
    if (newPassword !== newPasswordConfirmation){
        return res.status(400).render("change-password", {pageTitle: "Change Password", 
            errorMessage: "Password does not match"});
    }
    const user = await User.findById(_id);
    user.password = newPassword;
    await user.save();
    req.session.user.password = user.password;

    req.session.destroy();
    return res.redirect("/login");
}

export const see = async (req, res) => {
    const {id} = req.params;
    const user = await(await User.findById(id)).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    if(!user){
        return res.status(404).render("404", {pageTitle: "Not Found"});
    }
    return res.render("profile", {pageTitle:`${user.name}의 Profile`, user});
}
