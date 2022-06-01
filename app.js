const express = require("express");
const app = express();
const axios = require("axios");
require("dotenv").config();

const URL = process.env.URL;
//route 1
app.get("/api/ping", async (req, res) => {
  return res.status(200).json({ success: true });
});

//route 2

app.get("/api/posts", async (req, res) => {
  let initialPosts = [];
  const allowedSortValues = ["id", "reads", "likes", "popularity", undefined];
  const allowedDirectionValues = ["asc", "desc", undefined];
  if (!req.query.tag) {
    return res.status(400).json({ error: "Tags parameter is required" });
  }
  if (!allowedSortValues.includes(req.query.sortBy)) {
    return res.status(400).json({
      error:
        "sortBy parameters are invalid. Permitted values are: id,reads,likes,popularity",
    });
  }
  if (!allowedDirectionValues.includes(req.query.direction)) {
    return res.status(400).json({
      error:
        "direction parameters are invalid. Permitted values are: asc or desc",
    });
  }

  let tags = req.query.tag.split(",");
  let sortBy = req.query.sortBy ? req.query.sortBy : "id";
  let direction = req.query.direction ? req.query.direction : "asc";
  let getBlogs = tags.map((tag) => {
    return axios.get(`${URL}/blog/posts?tag=${tag}`);
  });

  try {
    let response = await Promise.all(getBlogs);

    response.map((data) => {
      let responsePosts = data.data.posts;

      initialPosts.push(...responsePosts);
    });

    initialPosts.sort((a, b) => {
      if (direction === "asc") {
        return a[sortBy] - b[sortBy];
      } else return b[sortBy] - a[sortBy];
    });
    let uniquePosts = [];
    const finalPosts = initialPosts.filter((entry) => {
      let duplicateId = uniquePosts.includes(entry.id);

      if (!duplicateId) {
        uniquePosts.push(entry.id);

        return true;
      }
      return false;
    });
    res.status(200).json({ finalPosts });
  } catch (err) {
    console.log(err);
  }
});

module.exports = app.listen(3001);
