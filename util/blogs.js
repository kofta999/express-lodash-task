const _ = require("lodash");

const DEFAULT_CACHE_TTL = 10000;

class CustomCache extends Map {
  constructor() {
    super();
    this.cacheExpiry = DEFAULT_CACHE_TTL;
  }

  has(key) {
    return super.has(key) && super.get(key).cacheExpiry > Date.now();
  }

  set(key, value) {
    value.cacheExpiry = Date.now() + this.cacheExpiry;
    return super.set(key, value);
  }
}

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
 * @returns {Promise<object[]>}
 */
const fetchBlogs = async (url) => {
  try {
    if (!url) {
      throw new Error("URL invalid");
    }

    const response = await fetch(url, {
      headers: { "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET },
    });

    if (response.status !== 200) {
      throw new Error("Error happened while fetching blogs the from server");
    }

    const data = await response.json();

    if (!data || !data.blogs) {
      throw new Error("No data retrieved from the server");
    }

    return data.blogs;
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 *
 * @param {object[]} blogs
 * @returns {object}
 */
const blogOperations = (blogs) => {
  const blogsCount = _.size(blogs);
  const longestTitleBlog = _.reduce(blogs, (prev, curr) =>
    _.size(prev.title) > _.size(curr.title) ? prev : curr
  );
  const longestTitle = longestTitleBlog.title;
  const privacyInTitleBlogsCount = _.size(blogSearcher("privacy", blogs));
  const uniqueBlogTitles = _.uniq(_.map(blogs, "title"));

  return {
    blogsCount,
    longestTitle,
    privacyInTitleBlogsCount,
    uniqueBlogTitles,
  };
};

_.memoize.Cache = CustomCache;

const memoizedBlogSearcher = _.memoize(blogSearcher);
const memoizedBlogOperations = _.memoize(blogOperations);
const memoizedFetchBlogs = _.memoize(fetchBlogs);

exports.blogSearcher = memoizedBlogSearcher;
exports.blogOperations = memoizedBlogOperations;
exports.fetchBlogs = memoizedFetchBlogs;
