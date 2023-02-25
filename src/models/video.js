import mongoose from "mongoose";
// model의 생김새 정의
const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, maxLength: 80 },
    fileUrl : {type: String, required: true},
    description: { type: String, required: true, minLength: 20},
    createdAt : {type: Date, required: true, default: Date.now},
    hashtags: [{type: String}], // == [String]
    // [ #hi, #lalal, #mongo]
    meta:{
        views: { type: Number, default: 0, required: true},
        rating: { type: Number, default: 0, required: true},
    },
    owner: {type:mongoose.Schema.Types.ObjectId, required: true, ref:"User"},
});

// videoSchema.pre("save", async function () { // save event에 pre middleware 적용
//     this.hashtags = this.hashtags[0].split(',').map((word) => (
//         word.startsWith('#') ? word : `#${word}`
//     ));
// });

// export const formatHashtags = (hashtags) =>
//     hashtags.split(',').map((word) => (word.startsWith('#')?
//         word : `#${word}`));

videoSchema.static("formatHashtags", function(hashtags){
    return hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`))
});

const Video = mongoose.model("Video", videoSchema);
export default Video;