import User from "../models/User"
import Video from "../models/Video"
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
	const user = await User.findOne({ username, socialOnly: false });
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
};
export const logout = (req, res) => {
	req.session.destroy();
	return res.redirect("/");
};
export const getEdit = (req, res) => {
	res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
	const {
		session : { user },
		body : { email, username, name, location },
		file,
	} = req
	if (email !== user.email) {
		const exists = await User.exists({ email });
		if(exists){
			return res.render("edit-profile", { errorMessage: "This email/username is already taken." });
		}
	}
	if (username !== user.username) {
		const exists = await User.exists({ username });
		if(exists) {
			return res.render("edit-profile", { errorMessage: "This email/username is already taken." });
		}
	}
	const updatedUser = await User.findByIdAndUpdate(user._id, {
		avatarUrl: file ? file.path : user.avatarUrl, 
		email, 
		username, 
		name, 
		location,
	}, { new: true });
	req.session.user = updatedUser;
	return res.redirect("/users/edit");
};

export const getPasswordChange = (req, res) => {
	if (req.session.user.socialOnly) {
		return res.redirect("/");
	}
	return res.render("user/change-password", { pageTitle: "Change Password" });
}

export const postPasswordChange = async (req, res) => {
	const {
		session : { user: { _id } },
		body : { oldPassword, newPassword ,newPasswordConfirmation }
	} = req
	const user = await User.findById(_id);
	const ok = await bcrypt.compare(oldPassword, user.password);
	if (!ok) {
		return res.render("user/change-password", { pageTitle: "Change Password", errorMessage: "Wrong Password" })
	}
	if (newPassword !== newPasswordConfirmation) {
		return res.render("user/change-password", { pageTitle: "Change Password", errorMessage: "New Password does not match" })
	}
	user.password = newPassword;
	await user.save()
	return res.redirect("/users/logout");
}

export const profile = async (req, res) => {
	const { id } = req.params;  // req.session이 아닌 req.params에서 가져오는 이유 : 로그인 한 유저 뿐만 아니라 다른 유저들에게도 보여지도록 만들기 위해
	const user = await User.findById(id);
	const videos = await Video.find({ owner: id });
	if(!user) {
		res.status("404").render("404", { pageTitle: "User Not Found" } );
	}
	res.render("user/profile", { pageTitle: user.name, videos });
}
