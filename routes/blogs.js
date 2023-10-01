const router = require("express").Router();
const blogsController = require("../controllers/blogs");

router.get("/api/blog-stats", blogsController.blogsAnalytics);

router.get("/api/blog-search", blogsController.searchBlogs);

module.exports = router;
