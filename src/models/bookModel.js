const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const bookSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        
        author: { type: String, required: true },
        
        category: {type: String,required:true},
        

    }, { timestamps: true }
);

module.exports = mongoose.model("Tbooks", bookSchema);