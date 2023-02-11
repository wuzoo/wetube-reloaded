import Video from "../../models/video";
// Video.find({}, (error, videos) => {
//     console.log("2");
//     return res.render("home", {pageTitle: "Home", videos});
// }); // {}는 search terms : 비어있으면 모든 형식을 찾는다

export const home = async(req, res) => {
    const videos = await Video.find({}).sort({createdAt:"desc"});
    return res.render("home", {pageTitle: "Home", videos});
}
export const watch = async (req, res) => {
    const id = req.params.id;
    const video = await Video.findById(id);
    if (!video){
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    return res.render("watch", {pageTitle: video.title, video});
}
export const getEdit = async (req, res) => {
    const id = req.params.id;
    const video = await Video.findById(id); // 영상 먼저 검색
    if (!video){ // 존재 X
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    return res.render("edit", {pageTitle: `Edit: ${video.title}`, video}); // 존재
}
export const postEdit = async (req, res) =>{
    const {id} = req.params;
    const {title, description, hashtags} = req.body;
    const video =  await Video.exists({_id: id});
    if (!video){ // 존재 X
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    await Video.findByIdAndUpdate(id, {
        title,description,hashtags: Video.formatHashtags(hashtags)
    })
    await video.save();
    return res.redirect(`/videos/${id}`);
}
// 같은 페이지를 get으로 왔느냐, post로 왔느냐
// url을 요청하였느냐, submit과 같은 방법으로 왔느냐
export const getUpload = (req, res) =>{
    return res.render("upload", {pageTitle: "Upload Video"});
}
export const postUpload = async (req, res) =>{
    // here we will add a video to the videos array.
    const {title, description, hashtags} = req.body;
    try{
        await Video.create({
            title,
            description,
            hashtags: Video.formatHashtags(hashtags),
        })
        return res.redirect("/");
    }
    catch(error){
        console.log(error);
        return res.render("upload", {
            pageTitle: "Upload Video", errorMessage: error._message,
        });
    }
}
export const deleteVideo = async (req, res) =>{
    const {id} = req.params;
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}
export const search = async(req, res) => {
    const {keyword} = req.query;
    let videos = [];
    if (keyword){
        videos = await Video.find({
            title:{
                $regex: new RegExp(keyword, "i")
            }
        })
    }
    return res.render("search", {pageTitle: "Search", videos});
}