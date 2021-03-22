const Snippet = require('../models/Snippet');
const io = require('../socket');

exports.createSnippet = async (req, res, next) => {
  const user = req.user;
  const snippetText = req.body.snippetText;
  let username;
  if (user.username) {
    username = user.username
  } else {
    username = user.name;
  }
  const snippet = new Snippet({
    text: snippetText,
    _user: user,
    username: username
  });

  const response = await snippet.save();

  io.getIO().emit('snippets', {
    action: 'create', snippet
  })

  res.status(200).json({ msg: 'Posted Snippet', response });
}

exports.getSnippets = async (req, res, next) => {
  const snippets = await Snippet.find();
  res.status(200).json({ msg: 'Snippets fetched', snippets });
}