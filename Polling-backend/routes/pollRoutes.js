const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
    createPoll,
    getAllPolls,
    updatePoll,
    deletePoll,
    votePoll
} = require("../controllers/pollController");

// Create, Update, Delete → Protected
router.post("/create", auth, upload.single("image"), createPoll);
router.put("/:id", auth, upload.single("image"), updatePoll);
router.delete("/:id", auth, deletePoll);

// Get all → Public
router.get("/", getAllPolls);

// Vote → Public but optionally authenticated
router.post("/vote", votePoll); // ❌ no auth middleware here

// ✅ Add this line:
module.exports = router;