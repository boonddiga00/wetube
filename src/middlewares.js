import multer from "multer";

export const  localsMiddleware = (req, res, next) => {
	res.locals.loggedIn = Boolean(req.session.loggedIn);
	res.locals.loggedInUser = req.session.user || {};
	res.locals.siteName = "Wetube";
	next();
}
export const protectorMiddleware = (req, res, next) => {
	if(req.session.loggedIn) {
		next();
	} else {
		req.flash("error", "Login First");
		return res.redirect("/login");
	}
}
export const publicOnlyMiddleware = (req, res, next) => {
	if(!req.session.loggedIn) {
		next();
	} else {
		req.flash("error", "You are already Logged In");
		return res.redirect("/");
	}
}
export const avatarUpload = multer({
	dest: "uploads/avatars",
	limits: { fileSize: 3000000 },
})
export const videoUpload = multer({
	dest: "uploads/videos",
})