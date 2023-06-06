const express = require("express");
const app = express();
const { connection } = require("./config/db");
const { UserRouter } = require("./routers/UserRouter");
const { PostRouter } = require("./routers/PostRouter");

app.use(express.json());
app.use("/api", UserRouter);
app.use("/api", PostRouter);

let port = process.env.port;

app.listen(port, async () => {
  try {
    await connection;
    console.log("DB Connected");
    console.log(`App is running on port ${port}`);
  } catch (error) {
    console.log(error);
  }
});
