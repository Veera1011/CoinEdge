const express = require('express');
const path = require('path');
const { rootMainFile } = require('./utils/path');
const app = express();
const PORT = process.env.PORT || 3000;

require('./config/db/firebase');

const authRoutes = require("./routes/auth")
const homeRoutes = require("./routes/homeRoute")
const userRoutes = require("./routes/userpage")


// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(rootMainFile, 'views'));

// Middleware
app.use(express.static(path.join(rootMainFile, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/', homeRoutes)
app.use('/user' , userRoutes)
app.use('/auth' , authRoutes);



const ip="192.168.0.4:3000"
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
 
});


// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


