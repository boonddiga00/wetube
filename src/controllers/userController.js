import User from "../models/User"
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => {
	return res.render("join", { pageTitle: "Join" });
}
export const postJoin = async (req, res) => {
	const pageTitle = "Join"
	const { email, username, password, password2, name, location } = req.body;
	const exists = await User.exists({ $or: [{ username }, { email }] });
	if (password !== password2){
		return res.status("400").render("join", { pageTitle, errorMessage: "Please check your PASSWORD again." });
	}
	if (exists) {
		return res.status("400").render("join", { pageTitle, errorMessage: "This email/username is already taken." });
	}
	try{
		await User.create({
			email,
			username,
			password,
			name,
			location,
		})
		return res.redirect("/login");
	} catch(error){
		res.status("400").render("upload", { 
			pageTitle: "Upload New Video", 
			errorMessage: error._message 
		});
	}
	
}
export const getLogin = (req, res) => {
	res.render("login", { pageTitle: "Login" });
}
export const postLogin = async (req, res) => {
	const pageTitle = "Login";
	const { username, password } = req.body;
	const user = await User.findOne({ username });
	if(!user) {
		return res.status("400").render("login", { pageTitle, errorMessage: "An account with this username does not exists."});
	}
	const ok = await bcrypt.compare(password, user.password);
	if(!ok) {
		return res.status("400").render("login", { pageTitle, errorMessage: "Please check your password"});
	}
	req.session.loggedIn = true;
	req.session.user = user;
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
	return res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
	const baseUrl = "https://github.com/login/oauth/access_token";
	const config = {
		client_id: process.env.GH_CLIENT,
		client_secret: process.env.GH_SECRET,
		code: req.query.code,
	}
	const params = new URLSearchParams(config).toString();
	const finalUrl = `${baseUrl}?${params}`;
	const tokenRequest = await (
		await fetch(finalUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
			},	
		})
	).json();
	if ("access_token" in tokenRequest) {
		const API_URL = "https://api.github.com"
		const { access_token } = tokenRequest;
		const userData = await( 
			await fetch(`${API_URL}/user`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();
		const emailData = await(
			await fetch(`${API_URL}/user/emails`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();
		const emailObj = emailData.find(email => email.verified === true && email.primary === true);
		if (!emailObj) {
			res.redirect("/login");
		}
		let user = await User.findOne({
			email: emailObj.email,
		});
		if(!user) {
			user = await User.create({
				email: emailObj.email,
				username: userData.login,
				password: "",
				name: userData.name,
				location: userData.location,
				socialOnly: true,
				avatarUrl: userData.avatar_url,
			});
		}
		console.log(user)
		req.session.loggedIn = true;
		req.session.user = user;
		console.log(req.session);
		return res.redirect("/");
	} else {
		return res.redirect("/login");
	}
}

export const logout = (req, res) => {
	req.session.destroy();
	return res.redirect("/");
};
export const edit = (req, res) => res.send("edit User");
export const remove = (req, res) => res.send("remove User");
export const see = (req, res) => res.send("see User");
