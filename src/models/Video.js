import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
	title: {type: String, required: true, trim: true, maxLength: 80 },
	fileUrl: { type: String, required: true },
	thumbUrl: { type: String, required: true },
	description: { type: String, required: true, trim: true, minlength: 20 },
	createdAt: { type: Date, default: Date.now, required: true },
	hashtags: [{ type: String, trim: true  }],
	meta: {
		views: {type: Number, default: 0, required: true },
		rating: {type: Number, default: 0, required: true }
	},
	owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static("formatHashtags", function(hashtags){
	return hashtags.split(",").map((word) => word.startsWith("#") ? word : `#${word}`);
})

/* case 1. handling Hashtag 
videoSchema.pre("save", async function() {
	this.hashtags = this.hashtags[0]
		.split(",")
		.map((word) => word.startsWith("#") ? word : `#${word}`);
}); 
*/

/* case 2. handling Hashtag
export const hashtagFunction = (hashtags) => hashtags.split(",").map((word) => word.startsWith("#") ? word : `#${word}`); 
*/

const Video = mongoose.model("Video", videoSchema);
export default Video;