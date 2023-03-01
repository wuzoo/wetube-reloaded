const video = document.querySelector("video");
const play = document.getElementById("play");
const mute = document.getElementById("mute");
const volume = document.getElementById("volume");

const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let volumeValue = 0.5;
let controlsMovementTimeout = null;
let ControlsLeaveTimeout = null;

video.volume = volumeValue;

let videoPlayStatus = false;
let setvideoPlayStatus = false;

videoContainer.fullScreenElement = null;

const formatTime = (seconds) =>{
    return new Date(seconds * 1000).toISOString().substring(11, 19);
}

const handlePlayClick = () =>{
    if(video.paused){
        video.play();
    }else{
        video.pause();
    }
    play.innerText = video.paused ? "Play" : "Pause";
}

const handleMute = () =>{
    if(video.muted){
        video.muted = false;
    }else{
        video.muted = true;
    }
    mute.innerText = video.muted ? "Unmute" : "Mute";
    volume.value = video.muted ? 0 : volumeValue;
}
const handleVolume = (event) =>{
    const {target : {value}} = event; // ev/;pcg ent.target.value
    if (video.muted){
        video.muted = false;
        mute.innerText = "Mute"; // 볼륨 drag Bar 조절, 음소거되어있으면, unmute 상태로 하고, mute의 innertext는 Mute
    }
    volumeValue = value;
    video.volume = value;
}
const handleLoadedMetaData = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
}
const handleTimeUpdate = () =>{
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
}
const handleTimelineChange = (event) => {
    const {target: {value}} = event;
    if (!setvideoPlayStatus){
        videoPlayStatus = video.paused ? false : true;
        setvideoPlayStatus = true;
    }
    video.pause();
    video.currentTime = value;
}
const handleSetTimeline = () =>{
    if (videoPlayStatus){
        video.play();
    }else{
        video.pause();
    }
    setvideoPlayStatus = false;
}
const handleFullScreen = () =>{
    const fullscreen = document.fullscreenElement;
    if (fullscreen){
        document.exitFullscreen();
    }else{
        videoContainer.requestFullscreen();
    }
}
const handleFullScreenChange = () =>{
    if(document.fullscreenElement){
        fullScreenBtn.innerText = "Exit full Screen"
    }else{
        fullScreenBtn.innerText = "Enter full Screen"
    }
}
const hideControls = () => videoControls.classList.remove("showing");
const handleMouseMove = () => {
    if (ControlsLeaveTimeout){
        clearTimeout(ControlsLeaveTimeout);
        ControlsLeaveTimeout = null;
    }
    if (controlsMovementTimeout){
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls,3000); // 3초 뒤에 controls를 숨기며 id를 배정
}
const handleMouseLeave = () => {
    ControlsLeaveTimeout = setTimeout(hideControls, 3000)
}

// handle__ 함수는 event가 발생시 호출되는 함수, 즉 __되었을 때 -> 행동 이라고 생각하면 편함
play.addEventListener("click", handlePlayClick);
mute.addEventListener("click", handleMute);
volume.addEventListener("input", handleVolume);
video.readyState ? handleLoadedMetaData() : video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpdate)
timeline.addEventListener("input", handleTimelineChange);
timeline.addEventListener("change", handleSetTimeline);
fullScreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("fullscreenchange", handleFullScreenChange);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("keydown", handleKeyDown);