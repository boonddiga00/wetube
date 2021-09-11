const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const button = form.querySelector("button");
const videoComment = document.querySelector(".video__comments ul");
const deleteBtn = videoComment.querySelectorAll(".video__comment-delete");

const addComment = (commentObj) => {
	const li = document.createElement("li");
	li.className = "video__comment-box";
	li.dataset.id = commentObj._id
	
	const img = document.createElement("img");
	img.src = commentObj.owner.avatarUrl;
	
	const div = document.createElement("div");
	div.className = "video__comment";
	const nameSpan = document.createElement("span");
	const textSpan = document.createElement("span");
	nameSpan.innerText = commentObj.owner.name;
	textSpan.innerText = commentObj.text;
	
	const deleteSpan = document.createElement("span");
	deleteSpan.innerText = "X";
	deleteSpan.className = "video__comment-delete";
	
	div.appendChild(nameSpan);
	div.appendChild(textSpan);
	li.appendChild(img);
	li.appendChild(div);
	li.appendChild(deleteSpan);
	videoComment.prepend(li);
	
	deleteSpan.addEventListener("click", deleteComment);
}

const handleSubmit = async (event) => {
	event.preventDefault();
	const textarea = form.querySelector("textarea");
	const text = textarea.value;
	const video = videoContainer.dataset.id;
	if(text === "") {
		return;
	}
	const response = await fetch(`/api/videos/${video}/comment`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ text }),
	});
	if(response.status === 201){
		textarea.value = "";
		const commentJson =  await response.json();
		addComment(commentJson);
	}
}

const handleEnterSubmit = (event) => {
	const key = event.code;
	if(key !== "Enter") {
		return;
	}
	button.click();
}

const deleteComment = async (event) => {	
	const li = event.target.parentNode;
	const commentId = li.dataset.id;
	const videoId = videoContainer.dataset.id;
	
	const response = await fetch(`/api/videos/${videoId}/comment`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ commentId }),
	});
	
	if (response.status === 201) {
		li.remove();
	}
}

if(form) {
	form.addEventListener("submit", handleSubmit);
	window.addEventListener("keydown", handleEnterSubmit);
	deleteBtn.forEach(button => button.addEventListener("click", deleteComment));
}


