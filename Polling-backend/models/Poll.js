const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
    question: String,
    options: [
        {
            id: { type: Number }, // Allow custom client-side ID
            text: { type: String, required: true },
            votes: { type: Number, default: 0 },
        }
    ],
    image: {
        originalSize: Number,
        optimizedSize: Number,
        optimizedUrl: String
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    votedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Poll", pollSchema);