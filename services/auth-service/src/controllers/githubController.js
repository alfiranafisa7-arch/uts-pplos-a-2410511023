const axios = require('axios');
const pool = require('../models/db');
const jwt = require('jsonwebtoken');
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
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

exports.handleCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ message: 'Code tidak ditemukan' });

  try {
    // Tukar code dengan access token
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

    const emailRes = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    const primaryEmail = emailRes.data.find(e => e.primary)?.email || userRes.data.email;
    const { name, avatar_url } = userRes.data;

    // Cek user sudah ada atau belum
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [primaryEmail]);

    let userId;
    if (existing.length > 0) {
      userId = existing[0].id;
      await pool.query(
        'UPDATE users SET name = ?, avatar = ?, oauth_provider = ? WHERE id = ?',
        [name, avatar_url, 'github', userId]
      );
    } else {
      const [result] = await pool.query(
        'INSERT INTO users (name, email, avatar, oauth_provider) VALUES (?, ?, ?, ?)',
        [name, primaryEmail, avatar_url, 'github']
      );
      userId = result.insertId;
    }

    const { accessToken, refreshToken } = generateTokens(userId, primaryEmail);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
      [userId, refreshToken]
    );

    res.json({ message: 'Login GitHub berhasil', accessToken, refreshToken, name, email: primaryEmail, avatar: avatar_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'GitHub OAuth gagal', error: err.message });
  }
};