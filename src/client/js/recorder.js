//카메라 되는 곳에서 다시 해보기
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
	const a = document.createElement("a");
	a.href = videoFile;
	a.download = "MyRecording.webm";
	document.body.appendChild(a);
	a.click();
}

const handleStop = () => {
	startBtn.innerText = "Download Video";
	startBtn.removeEventListener("click", handleStop);
	startBtn.addEventListener("click", handleDownload);
	recorder.stop();
	recorder.ondataavailable = (event) => {
		videoFile = URL.createObjectURL(event.data);
	}
	video.srcObj = null;
	video.src = videoFile;
	video.loop = true;
	video.play();
}

const handleStartBtn = () => {
	startBtn.innerText = "Stop Recordeing";
	startBtn.removeEventListener("click", handleStartBtn);
	startBtn.addEventListener("click", handleStop);
	recorder = new MediaRecorder(stream);
	recorder.start()
} 

const init = async() => {
	stream = await navigator.mediaDevices.getUserMedia({
		audio: true,
		video: true,
	})
	video.srcObj = stream;
	video.play();
}

init();

startBtn.addEventListener("click", handleStartBtn);