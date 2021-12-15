const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        body: { type: String, required: true },
        authorId: {
            type: ObjectId,
            required: true,
            ref: "Author"
        },
        tags: [{type: String, trim: true}],
        category: {type: String, trim: true, required: 'Blog category is required'},
        subcategory: [{type: String, trim: true}],
        isPublished: {type: Boolean, default: false},

        publishedAt: {type: Date, default: null},  
        isDeleted: { type: Boolean, default: false },
        deletedAt: {type: String, default: null}, 

    }, { timestamps: true }
);

module.exports = mongoose.model("P1_Blogs", blogSchema);