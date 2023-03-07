import regeneratorRuntime from "regenerator-runtime";
const StartBtn = document.getElementById("StartBtn");
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
    StartBtn.innerText = "Download Recording";
    StartBtn.removeEventListener("click", handleStop);
    StartBtn.addEventListener("click", handleDownload);

    recorder.stop();
}

const handleStart = () => {
    StartBtn.innerText = "Stop Recording";
    StartBtn.removeEventListener("click", handleStart); // event를 제거
    StartBtn.addEventListener("click", handleStop); // 같은 button에 대해 새로운 event 추가

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
        console.log("recording start");
        videoFile = URL.createObjectURL(e.data);
        console.log(videoFile);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    }
    recorder.start();
}

const init = async () => { // video 미리보기
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
    });
    video.srcObject = stream;
    video.play();   
}
init();

StartBtn.addEventListener("click", handleStart);