const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let mouseMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
	if(video.paused) {
		video.play();
	} else {
		video.pause();
	}
	playBtn.innerText = video.paused ? "Play" : "Pause";
}

const handleMute = (e) => {
	if(video.muted) {
		video.muted = false;
	} else {
		video.muted = true;
	}
	muteBtn.innerText = video.muted ? "Unmute" : "Mute";
	volumeRange.value = video.muted ? 0 : volumeValue;
}

const handleVolume = (event) => {
	const { target : { value } } = event;
	if(video.muted) {
		video.muted = false;
		muteBtn.innerText = "Mute";
	}
	video.volume = value;
	volumeValue = value;
}

const handleChange = (event) => {
	const { target : { value } } = event;
	if(value === "0") {
		video.muted = true;
		muteBtn.innerText = "Unmute";
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
		fullScreenBtn.innerText = "Enter Fullscreen"
	} else {
		videoContainer.requestFullscreen();
		fullScreenBtn.innerText = "Exit Fullscreen"
	}
	
}

const removeShowingClass = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
	if(controlsTimeout) {
		clearTimeout(controlsTimeout);
		controlsTimeout = null; //없어도 됨
	}
	if(mouseMovementTimeout) {
		clearTimeout(mouseMovementTimeout);
		mouseMovementTimeout = null;
	}
	videoControls.classList.add("showing");
	mouseMovementTimeout = setTimeout(removeShowingClass, 3000);
}

const handleMouseLeave = () => {
	controlsTimeout = setTimeout(removeShowingClass, 3000);
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolume);
volumeRange.addEventListener("change", handleChange);
video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpadte);
timeline.addEventListener("input", handleTimelineRange);
fullScreenBtn.addEventListener("click", handlefullScreenBtnClick);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);

if (video.readyState == 4) {
	handleLoadedMetaData();
}



