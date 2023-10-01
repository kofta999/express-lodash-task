const _ = require("lodash");
const { blogSearcher, fetchBlogs, blogOperations } = require("../util/blogs");

const url = process.env.API_URL;

exports.blogsAnalytics = async (req, res, next) => {
  try {
    const blogs = await fetchBlogs(url);

    const {
      blogsCount,
      longestTitle,
      privacyInTitleBlogsCount,
      uniqueBlogTitles,
    } = blogOperations(blogs);

    if (
      !blogsCount ||
      !longestTitle ||
      !privacyInTitleBlogsCount ||
      !uniqueBlogTitles
    ) {
      return next(new Error("Error happened while analyzing the data"));
    }

    res.status(200).json({
      success: true,
      status_message: "analyzed data successfully",
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
};

exports.searchBlogs = async (req, res, next) => {
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
};
