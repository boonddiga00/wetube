const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let volumeValue = 0.5;
video.volume = volumeValue;

let controlsTimeout = null;
let mouseMovementTimeout = null;
let keyDownTimeout = null;

const handlePlay = (e) => {
	if(video.paused) {
		video.play();
	} else {
		video.pause();
	}
	playIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
}

const handleMute = (e) => {
	if(video.muted) {
		video.muted = false;
	} else {
		video.muted = true;
	}
	muteIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
	volumeRange.value = video.muted ? 0 : volumeValue;
}

const handleVolume = (event) => {
	const { target : { value } } = event;
	if(video.muted) {
		video.muted = false;
		muteIcon.classList = "fas fa-volume-up";
	}
	video.volume = value;
	volumeValue = value;
}

const handleChange = (event) => {
	const { target : { value } } = event;
	if(value === "0") {
		video.muted = true;
		muteIcon.classList = "fas fa-volume-mute";
	}
}

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(14, 5);

const handleLoadedMetaData = () => {
	totalTime.innerText = formatTime(Math.floor(video.duration));
	timeline.max = Math.floor(video.duration);
}
const handleTimeUpadte = () => {
	currentTime.innerText = formatTime(Math.floor(video.currentTime));
	timeline.value = Math.floor(video.currentTime);
}

const handleTimelineRange = (event) => {
	const { target: { value } } = event;
	video.currentTime = value;
}

const handlefullScreenBtnClick = () => {
	const fullScreen = document.fullscreenElement;
	if(fullScreen) {
		document.exitFullscreen();
		fullScreenIcon.classList = "fas fa-expand";
	} else {
		videoContainer.requestFullscreen();
		fullScreenIcon.classList = "fas fa-compress";
	}
	
}

const removeShowingClass = () => videoControls.classList.remove("showing");
const addShowingClass = () => videoControls.classList.add("showing");
const removeTimeout = () => {
	if(controlsTimeout) {
		clearTimeout(controlsTimeout);
		controlsTimeout = null; //없어도 됨
	}
	if(mouseMovementTimeout) {
		clearTimeout(mouseMovementTimeout);
		mouseMovementTimeout = null;
	}
	if(keyDownTimeout) {
		clearTimeout(keyDownTimeout);
		keyDownTimeout = null;
	}
}

const handleMouseMove = () => {
	removeTimeout();
	addShowingClass();
	mouseMovementTimeout = setTimeout(removeShowingClass, 3000);
}

const handleMouseLeave = () => {
	controlsTimeout = setTimeout(removeShowingClass, 3000);
}

const handleKeyDown = (event) => {
	removeTimeout();
	addShowingClass();
	keyDownTimeout = setTimeout(removeShowingClass, 3000);
	const { code } = event;
	if(code === "Space") {
		handlePlay();
	}
	if(code === "ArrowUp") {
		video.volume += 0.1;
		volumeRange.value = String(Number(volumeRange.value) + 0.1);
		volumeValue += 0.1;
	}
	if(code === "ArrowDown") {
		video.volume -= 0.1;
		volumeRange.value = String(Number(volumeRange.value) - 0.1);
		volumeValue -= 0.1;
	}
}

const handleEnded = () => {
	const { id } = videoContainer.dataset;
	fetch(`/api/videos/${id}/view`, {
		method: "POST"
	});
}

playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolume);
volumeRange.addEventListener("change", handleChange);
video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpadte);
video.addEventListener("click", handlePlay);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineRange);
fullScreenBtn.addEventListener("click", handlefullScreenBtnClick);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
window.addEventListener("keydown", handleKeyDown);

if (video.readyState == 4) {
	handleLoadedMetaData();
}



