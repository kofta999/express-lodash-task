require("dotenv").config();
const express = require("express");
const _ = require("lodash");
const app = express();
const url = process.env.API_URL;

app.get("/api/blog-stats", async (req, res, next) => {
  try {
    const blogs = await fetchBlogs(url);

    const blogsCount = _.size(blogs);
    const longestTitleBlog = _.reduce(blogs, (prev, curr) =>
      _.size(prev.title) > _.size(curr.title) ? prev : curr
    );
    const longestTitle = longestTitleBlog.title;
    const privacyInTitleBlogsCount = _.size(blogSearcher("privacy", blogs));
    const uniqueBlogTitles = _.uniq(_.map(blogs, "title"));

    if (
      !blogsCount ||
      !longestTitle ||
      !privacyInTitleBlogsCount ||
      !uniqueBlogTitles
    ) {
      next(new Error("Error happened while analyzing the data"));
    }

    res.status(200).json({
      success: true,
      status_message: "fetched data successfully",
      data: {
        blogsCount,
        longestTitle,
        privacyInTitleBlogsCount,
        uniqueBlogTitles,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.get("/api/blog-search", async (req, res, next) => {
  try {
    const searchQuery = req.query.query;

    if (!searchQuery) {
      const error = new Error("No query provided");
      error.statusCode = 400;
      return next(error);
    }

    const blogs = await fetchBlogs(url);
    const searchResults = blogSearcher(searchQuery, blogs);

    res.status(200).json({
      success: true,
      status_message: `found results for ${searchQuery}`,
      data: {
        blogs: searchResults,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status_message: err.message,
    data: null,
  });
});

// Helper functions

/**
 * @param {string} keyword
 * @param {object[]} blogs
 * @returns {object[]}
 */
const blogSearcher = (keyword, blogs) => {
  return _.filter(blogs, (blog) => {
    return _.includes(_.toLower(blog.title), _.toLower(keyword));
  });
};

/**
 * @param {string} url
 * @returns {object[]}
 */
const fetchBlogs = async (url) => {
  try {
    const response = await fetch(url, {
      headers: { "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET },
    });
    if (!response.status === 200) {
      throw new Error("Error happened while fetching blogs the from server");
    }

    const data = await response.json();

    if (!data || !data.blogs) {
      throw new Error("No data retrieved from the server");
    }

    return data.blogs;
  } catch (err) {
    throw new Error("Error happened while fetching from the server");
  }
};

app.listen(3000);
