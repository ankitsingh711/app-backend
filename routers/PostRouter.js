const express = require("express");
const PostRouter = express.Router();
const { PostModel } = require("../model/PostModel");
const { Authorization } = require("../middlewares/Authorization");
const { UserModel } = require("../model/UserModel");

PostRouter.get("/posts", async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.status(200).json({
      posts: posts,
    });
  } catch (error) {
    console.log(error);
  }
});

PostRouter.post("/posts", Authorization, async (req, res) => {
  try {
    const { text, image } = req.body;
    const userId = req.user._id;

    const user = await UserModel.find({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = new PostModel({ text, image });
    post.userId = user._id;
    await post.save();

    user.posts.push(post._id);
    await user.save();

    res.status(201).json({ post: post });
  } catch (error) {
    res.status(500).json({ error: "Error creating post" });
  }
});

// Update a post
PostRouter.put("/posts/:id", Authorization, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const { text, image } = req.body;

    const post = await PostModel.find({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    post.text = text || post.text;
    post.image = image || post.image;
    await post.save();

    res.status(204).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error updating post" });
  }
});

// Delete a post
PostRouter.delete("/:id", Authorization, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await PostModel.find({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await post.remove();

    res.status(202).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting post" });
  }
});

// Like a post
PostRouter.put("/posts/:id/like", Authorization, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await PostModel.find({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      return res.status(400).json({ error: "Post already liked" });
    }

    post.likes.push(userId);
    await post.save();

    res.status(201).json({ message: "Post liked successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error liking post" });
  }
});

// Comment on a post
PostRouter.post("/posts/:id/comment", Authorization, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { comment } = req.body;

    const post = await PostModel.find({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = { user: userId, text: comment };
    post.comments.push(newComment);
    await post.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    res.status(500).json({ error: "Error commenting on post" });
  }
});

// Get post by ID
PostRouter.get("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.find({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving post" });
  }
});

module.exports = { PostRouter };
