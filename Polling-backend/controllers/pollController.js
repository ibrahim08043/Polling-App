const Poll = require("../models/Poll");
const fs = require("fs");
const axios = require("axios");

const TINYPNG_API_KEY = process.env.TINYPNG_API_KEY;

exports.createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Image is required" });

    const optionsArray = JSON.parse(options);
    if (optionsArray.length < 2 || optionsArray.length > 5) {
      return res.status(400).json({ message: "Options must be 2-5" });
    }

    const encodedAuth = Buffer.from("api:" + process.env.TINYPNG_API_KEY).toString("base64");
    const response = await axios.post("https://api.tinify.com/shrink", fs.readFileSync(file.path), {
      headers: {
        "Authorization": `Basic ${encodedAuth}`,
        "Content-Type": "application/octet-stream"
      }
    });

    const newPoll = new Poll({
      question,
      options: optionsArray,
      createdBy: userId,
      image: {
        originalSize: file.size,
        optimizedSize: response.data.output.size,
        optimizedUrl: response.data.output.url
      }
    });

    await newPoll.save();
    await newPoll.populate("createdBy", "username email"); // 👈

    const io = req.app.get("io");
    io.emit("pollCreated", newPoll);

    res.status(201).json(newPoll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().populate("createdBy", "username email");
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    const { id } = req.params;
    const file = req.file;

    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (question) poll.question = question;

    if (options) {
      const parsedOptions = JSON.parse(options);
      if (parsedOptions.length < 2 || parsedOptions.length > 5) {
        return res.status(400).json({ message: "Options must be 2–5." });
      }

      poll.options = parsedOptions.map((newOption) => {
        const existing = poll.options.find(opt => opt.id === newOption.id);
        return {
          id: newOption.id,
          text: newOption.text,
          votes:
            existing && existing.text === newOption.text
              ? existing.votes
              : 0,
        };
      });
    }

    if (file) {
      const encodedAuth = Buffer.from("api:" + process.env.TINYPNG_API_KEY).toString("base64");
      const response = await axios.post(
        "https://api.tinify.com/shrink",
        fs.readFileSync(file.path),
        {
          headers: {
            Authorization: `Basic ${encodedAuth}`,
            "Content-Type": "application/octet-stream",
          },
        }
      );

      poll.image = {
        originalSize: file.size,
        optimizedSize: response.data.output.size,
        optimizedUrl: response.data.output.url,
      };
    } else if (req.body.imageUrl) {
      // 🟡 If just image URL is passed (like in formData or JSON)
      poll.image = {
        originalSize: null,
        optimizedSize: null,
        optimizedUrl: req.body.imageUrl,
      };
    }

    await poll.save();
    await poll.populate("createdBy", "username email"); // 👈

    const io = req.app.get("io");
    io.emit("pollUpdated", poll);

    res.json({ message: "Poll updated successfully", poll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Optional: Allow only creator to delete
    if (poll.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to delete this poll" });
    }

    await Poll.findByIdAndDelete(id);
    res.json({ message: "Poll deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { pollId, optionIndex } = req.body;

    let userId = null;
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {
        console.log("Anonymous vote");
      }
    }

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option" });
    }

    // Prevent re-vote for logged-in user
    if (userId && poll.votedUsers.includes(userId)) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // Vote and track user
    poll.options[optionIndex].votes += 1;
    if (userId) poll.votedUsers.push(userId);

    await poll.save();

    // 🔥 Emit vote update
    const io = req.app.get("io");
    io.emit("voteUpdated", { pollId, updatedPoll: poll });

    res.json({ message: "Vote recorded", poll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};