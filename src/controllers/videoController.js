import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const home = async(req, res) => {
	const videos = await Video.find({}).sort({createdAt: "desc"}).populate("owner");
	res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id).populate("owner").populate({
		path: "comments",
		populate: {
			path: "owner",
			model: "User",
		}
	});
	if (!video) {
		return res.status("404").render("404", { pageTitle: "This Video dosen't exists."})
	}
	res.render("watch", { pageTitle: video.title, video });
}
export const getEdit = async (req, res) => {
	const { 
		params: { id },
		session: { user: { _id } } 
	} = req;
	const video = await Video.findById(id);
	if(String(video.owner) !== String(_id)) {
		return res.status("403").redirect("/");
	}
	return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};
export const postEdit = async (req, res) => {
	const { id } = req.params;
	const { title, description, hashtags } = req.body;
	const video = await Video.exists();
	if (!video) {
		return res.status("404").render("404", { pageTitle: "This Video dosen't exists."})
	}
	await Video.findByIdAndUpdate(id, {
		title,
		description,
		hashtags: Video.formatHashtags(hashtags),
	})
	return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
	res.render("upload", { pageTitle: "Upload New Video" });
};
export const postUpload = async (req, res) => {
	const { 
		user: {_id: owner } 
	} = req.session;
	const fileUrl = req.files.video[0].path;
	const thumbUrl = req.files.thumbnail[0].path;
	const { title, description, hashtags } = req.body;
	try{
		const newVideo = await Video.create({
			owner,
			title,
			fileUrl,
			thumbUrl,
			description,
			hashtags: Video.formatHashtags(hashtags),
		});
		const user = await User.findById(owner);
		user.videos.push(newVideo._id);
		user.save();
		return res.redirect("/");
	} catch(error) {
		res.status("400").render("upload", { 
			pageTitle: "Upload New Video", 
			errorMessage: error._message 
		});
	}	
};
	/*	st video = new Video({
		title,
		description,
		createdAt: Date.now(),
		hashtags: hashtags.split(",").map((word) => `${word}`),
		meta: {
			views: 0,
			rating: 0
		}
	});
	await video.save();
	
	save() 사용하여 DB에 저장하기
	*/

export const deleteVideo = async (req, res) => {
	const { 
		params: { id },
		session: { 
			user: { _id }
		}
	} = req;
	const video = Video.findById(id);
	if (!video) {
		return res.status("404").render("404", { pageTitle: "This Video dosen't exists."})
	}
	if(Stirng(video.owner) !== Stirng(_id)) {
		return res.status("403").redirect("/");
	}
	await Video.findByIdAndDelete(id);
	return res.redirect("/");
};

export const search = async (req, res) => {
	const { keyword } = req.query;
	let videos = []; //keyword가 undifined가 되면 if문이 동작하지 않고, 아무것도 respond 해줄 수 없기 때문, res.render를 if문 안에 한 번 더 써주는 것으로도 해결가능
	if(keyword) {
		videos = await Video.find({
			title: {
				$regex: new RegExp(keyword, "i"),
			}
		}).populate("owner");
	}
	return res.render("search", { pageTitle: "Search", videos });
};

export const viewsController = async(req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id);
	if(!video){
		return res.sendStatus("404");
	}
	video.meta.views = video.meta.views + 1;
	await video.save();
	return res.sendStatus("200");	
}

export const createComment = async (req, res) => {
	const {
		session: { user }, 
		params: { id },
		body: { text },
	} = req;
	const video = await Video.findById(id);
	if(!video) {
		return res.sendStatus(404);
	}
	const comment = await Comment.create({
		text,
		owner: user._id,
		video: id,
	});
	video.comments.push(comment);
	await video.save();
	
	await Comment.populate(comment, { path: "owner", model: "User"});
	return res.status(201).json(comment);
}

export const deleteComment = async (req, res) => {
	const {
		session: { user: { _id } },
		params: { id },
		body: { commentId }
	} = req;
	
	const video = await Video.findById(id);
	if (!video) {
		return res.sendStatus(404);
	}
	const comment = await Comment.findById(commentId).populate("owner");
	if (!comment) {
		return res.sendStatus(404);
	}
	const owner = comment.owner._id;
	if(String(owner) !== String(_id)) {
		return res.sendStatus(403);
	}
	
	video.comments.filter(comment => String(comment._id) !== String(commentId));
	await video.save();
	await Comment.findByIdAndDelete(commentId);

	return res.sendStatus(201);
}



