const express = require("express");
const router = express.Router();
const Books = require("../models").Book;

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    let page = req.query.page;
    const limit = 10;
    let offset;
    if (page) {
      offset = page * limit - limit;
    } else {
      offset = 0;
      page = 1;
    }
    const { count, rows } = await Books.findAndCountAll({
      offset: offset,
      limit: limit,
    });
    const books = rows;
    const btn = Math.ceil(count / limit);
    res.render("books/index", { books, page, btn, title: "Books" });
  })
);

router.get(
  "/new",
  asyncHandler(async (req, res) => {
    res.render("books/new-book", { book: {}, title: "New Book" });
  })
);

router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Books.create(req.body);
      res.redirect("/books");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Books.build(req.body);
        res.render("books/new-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        res.render("books/error");
      }
    }
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Books.findByPk(req.params.id);
    if (book) {
      res.render("books/update-book", { book, title: "Update Book" });
    } else {
      res.render("books/error");
    }
  })
);

router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Books.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books");
      } else {
        res.render("books/error");
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Books.build(req.body);
        book.id = req.params.id;
        res.render("books/new-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error;
      }
    }
  })
);

router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Books.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.render("books/error");
    }
  })
);

module.exports = router;
