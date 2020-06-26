const express = require("express");
const router = express.Router();
const Books = require("../models").Book;

const db = require("../models");
const { Op } = db.Sequelize;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
/* Get book search listing. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = req.query.page;
    const query = req.query.query;
    const limit = 10;
    let offset;
    page ? (offset = page * limit - limit) : (offset = 0);
    try {
      const { count, rows } = await Books.findAndCountAll({
        where: {
          [Op.or]: [
            {
              title: {
                [Op.like]: `%${query}%`,
              },
            },
            {
              author: {
                [Op.like]: `%${query}%`,
              },
            },
            {
              genre: {
                [Op.like]: `%${query}%`,
              },
            },
            {
              year: {
                [Op.like]: `%${query}%`,
              },
            },
          ],
        },
        offset: offset,
        limit: limit,
      });
      const books = rows;
      const btn = Math.ceil(count / limit);
      res.render("books/index", { books, query, page, btn, title: "Books" });
    } catch (error) {
      console.log(error);
      res.render("books/error");
    }
  })
);
/* Post for search books listing. */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const query = req.body.search;
    const limit = 10;
    try {
      const { count, rows } = await Books.findAndCountAll({
        where: {
          [Op.or]: [
            {
              title: {
                [Op.like]: `%${query}%`,
              },
            },
            {
              author: {
                [Op.like]: `%${query}%`,
              },
            },
            {
              genre: {
                [Op.like]: `%${query}%`,
              },
            },
            {
              year: {
                [Op.like]: `%${query}%`,
              },
            },
          ],
        },
        offset: 0,
        limit: limit,
      });
      const books = rows;
      if (books.length === 0) {
        res.render("books/index", {
          books,
          query,
          title: "Books",
        });
      } else {
        const btn = Math.ceil(count / limit);
        res.render("books/index", {
          books,
          query,
          page: 1,
          btn,
          title: "Books",
        });
      }
    } catch (error) {
      console.log(error);
      res.render("books/error");
    }
  })
);

module.exports = router;
