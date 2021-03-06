const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const passport = require('passport');
const cookieSession = require("cookie-session");
const cors = require('cors');
const path = require('path');




require('./services/passport');
const storyRoutes = require('./routes/story');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const snippetRoutes = require('./routes/snippets');
const paymentRoutes = require('./routes/payments');




const app = express();


app.use(bodyParser.json());



app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS', 'GET', 'PUT', 'POST', 'PATCH', 'DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(
  cookieSession({
    maxAge: 7 * 24860 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);
app.use(passport.initialize());
app.use(passport.session());



app.use(storyRoutes);
app.use(authRoutes);
app.use(usersRoutes);
app.use(snippetRoutes);
app.use(paymentRoutes);



app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  let message = error.message;
  const data = error.data;
  if (error.statusCode > 499) {
    error.message = 'Network Error';
  }
  res.status(status).json({ statusText: "error", error: message, data: data });
})

if (process.env.NODE_ENV === 'production') {
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(express.static('client/build'));

  // Express will serve up the index.html file
  // if it doesn't recognize the route
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

mongoose.connect(keys.mongoURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }).then(result => {
    const server = app.listen(PORT);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('client connected');
    })
  }).catch(err => console.log(err))
