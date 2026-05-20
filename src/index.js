require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./db');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Setup EJS + Layout
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Koneksi database
connectDB();

// API Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Web Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});
app.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login', layout: false });
});
app.get('/dashboard', (req, res) => {
  res.render('pages/dashboard', { title: 'Dashboard', page: 'dashboard' });
});
app.get('/users', (req, res) => {
  res.render('pages/users', { title: 'Manajemen Pengguna', page: 'users' });
});
const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);

app.get('/rooms', (req, res) => {
  res.render('pages/rooms', { title: 'Manajemen Ruangan', page: 'rooms' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});