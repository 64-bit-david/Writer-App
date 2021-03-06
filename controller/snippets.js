const Snippet = require('../models/Snippet');
const io = require('../socket');
const { validationResult } = require('express-validator');


const SNIPPETS_PER_PAGE = 10;

exports.createSnippet = async (req, res, next) => {
  const user = req.user;
  const userId = req.user._id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.errors[0].msg);
    const error = new Error(errors.errors[0].msg);
    error.statusCode = 422;
    throw error
  }

  const snippetText = req.body.snippetText;
  let username;
  if (user.username) {
    username = user.username
  } else {
    username = user.name;
  }
  const snippet = new Snippet({
    text: snippetText,
    _user: userId,
    username: username
  });

  //if snippet saves, emit websocket action
  try {
    const response = await snippet.save();

    io.getIO().emit('snippets', {
      action: 'create', snippet
    })

    res.status(200).json({ msg: 'Posted Snippet', response });
  } catch (err) {
    next(err);
  }
}

//for front page
exports.getSnippets = async (req, res, next) => {
  const snippets = await Snippet.find().sort({ _id: -1 }).limit(SNIPPETS_PER_PAGE);
  res.status(200).json({ msg: 'Snippets fetched', snippets });
}


exports.getAllSnippets = async (req, res, next) => {
  const page = +req.query.page || 1;

  try {
    const totalSnippets = await Snippet.find().countDocuments();
    const snippets = await Snippet.find()
      .sort({ _id: -1 })
      .skip((page - 1) * SNIPPETS_PER_PAGE)
      .limit(SNIPPETS_PER_PAGE);

    const pager = {
      totalSnippets,
      currentPage: page,
      hasNextPage: SNIPPETS_PER_PAGE * page < totalSnippets,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalSnippets / SNIPPETS_PER_PAGE)
    }
    res.status(200).json({ msg: 'Snippets fetched', snippets, pager });
  } catch (err) {
    next(err);
  }
}


exports.deleteSnippet = async (req, res, next) => {
  const snippetId = req.params.snippetId;
  try {
    const snippet = await Snippet.findById(snippetId);

    //auth check user match
    if (snippet._user.toString() !== req.user._id.toString()) {
      const error = new Error("Cannot delete another user's snippet!");
      error.statusCode = 401;
      throw error;
    } else {
      await snippet.remove();
      io.getIO().emit('snippets', { action: 'delete', snippet: snippetId })
      res.status(200).json({ msg: "Snippet Deleted" });
    }
  } catch (err) {
    next(err);
  }
}