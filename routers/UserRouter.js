const express = require("express");
const UserRouter = express.Router();
const { UserModel } = require("../model/UserModel");
const bcrypt = require("bcrypt");
const { Authentication } = require("../middlewares/Authenticate");
const jwt = require("jsonwebtoken");
const { Authorization } = require("../middlewares/Authorization");

UserRouter.post("/register", async (req, res) => {
  let { name, email, password, dob, bio } = req.body;
  try {
    bcrypt.hash(password, 5, (err, hashPass) => {
      if (err) {
        res.status(401).json({
          msg: "Password not hashed",
        });
      } else if (hashPass) {
        const User = new UserModel({
          name,
          email,
          password: hashPass,
          dob,
          bio,
        });
        User.save();
        res.status(201).json({
          msg: "User Registered",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

UserRouter.post("/login", Authentication, async (req, res) => {
  const { email, password } = req.body;
  try {
    jwt.sign({ email }, process.env.secretKey, (err, token) => {
      if (err) {
        res.status(401).json({
          msg: "Error Occured",
        });
      } else {
        res.status(201).json({
          msg: "Login Success",
          token: token,
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

UserRouter.get("/users", async (req, res) => {
  try {
    const Users = await UserModel.find();
    res.status(200).json({
      Users: Users,
    });
  } catch (error) {
    console.log(error);
  }
});

UserRouter.get("/users/:id/friends", async (req, res) => {
  const Id = req.params.id;
  try {
    const user = await UserModel.find({ _id: Id }).populate("friends", "name");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ friends: user.friends });
  } catch (error) {
    console.log(error);
  }
});

UserRouter.post("/users/:id/friends", Authorization, async (req, res) => {
  try {
    let senderId = req.user._id;
    const receiverId = req.params.id;

    const sender = await UserModel.find({ _id: senderId });
    const receiver = await UserModel.find({ _id: receiverId });

    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    if (sender.friendRequests.includes(receiverId)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    sender.friendRequests.push(receiverId);
    await sender.save();

    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log(error);
  }
});

UserRouter.put("/:id/friends/:friendId", Authorization, async (req, res) => {
  try {
    const userId = req.user._id;

    const friendId = req.params.friendId;

    const user = await UserModel.find({ _id: userId });
    const friend = await UserModel.find({ _id: friendId });

    if (!user || !friend) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.friendRequests.includes(friendId)) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    user.friendRequests = user.friendRequests.filter(
      (request) => request.toString() !== friendId
    );

    if (req.body.accept) {
      user.friends.push(friendId);
      friend.friends.push(userId);
    }

    await user.save();
    await friend.save();

    res.json({ message: "Friend request handled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error handling friend request" });
  }
});

module.exports = { UserRouter };
