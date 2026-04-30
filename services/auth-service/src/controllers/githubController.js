const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');
require('dotenv').config();

const generateTokens = (userId, email) => {
  const accessToken = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  const refreshToken = jwt.sign(
    { id: userId, email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
  return { accessToken, refreshToken };
};

exports.redirectToGithub = (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(url);
};

exports.handleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // Tukar code dengan access token GitHub
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const githubToken = tokenRes.data.access_token;

    // Ambil data user dari GitHub
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    const githubUser = userRes.data;
    const email = githubUser.email || `${githubUser.login}@github.com`;

    // Cek apakah user sudah ada di DB
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE oauth_id = ? AND oauth_provider = ?',
      [String(githubUser.id), 'github']
    );

    let userId;
    if (existing.length > 0) {
      userId = existing[0].id;
    } else {
      // Buat user baru
      const [result] = await pool.query(
        'INSERT INTO users (name, email, avatar, oauth_provider, oauth_id) VALUES (?, ?, ?, ?, ?)',
        [githubUser.name || githubUser.login, email, githubUser.avatar_url, 'github', String(githubUser.id)]
      );
      userId = result.insertId;
    }

    const { accessToken, refreshToken } = generateTokens(userId, email);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
      [userId, refreshToken]
    );

    res.json({ message: 'Login GitHub berhasil', accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'GitHub OAuth gagal' });
  }
};