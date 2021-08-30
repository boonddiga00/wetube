import Video from "../models/Video";
import User from "../models/User";

export const home = async(req, res) => {
	const videos = await Video.find({}).sort({createdAt: "desc"}).populate("owner");
	res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id).populate("owner");
	if (!video) {
		return res.status("404").render("404", { pageTitle: "This Video dosen't exists."})
	}
	console.log(video);
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
	const { path: fileUrl } = req.file;
	const { title, description, hashtags } = req.body;
	try{
		const newVideo = await Video.create({
			owner,
			title,
			fileUrl,
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
		console.log(videos);
	}
	return res.render("search", { pageTitle: "Search", videos });
};






