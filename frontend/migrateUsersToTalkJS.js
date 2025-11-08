import axios from 'axios';

const BACKEND_USERS_URL = '/api/users/';
const TALKJS_APP_ID = 'tPZa3YK4';
const TALKJS_SECRET = 'sk_test_WnPpMOzDInijpGLCH6dixVdMeWOcdUBL';

async function fetchAllUsers() {
  const res = await axios.get(BACKEND_USERS_URL);
  // Adjust this if your backend returns {results: [...]}
  return res.data.results || res.data;
}

function safeString(val, fallback = '') {
  // Only allow non-empty strings
  return typeof val === 'string' && val.trim().length > 0 ? val : fallback;
}

async function syncUserToTalkJS(user) {
  // TalkJS REST API expects:
  // - email: array of strings or null
  // - role: string or null
  // - photoUrl: string (min length 1) or omit
  // Only id and name are required, but email/role/photoUrl are recommended

  const talkUser = {
    id: user._id || user.id,
    name: safeString(user.fullName) || safeString(user.name) || 'User',
    email: user.email ? [user.email] : null,
    welcomeMessage: safeString(user.bio, 'Hi!'),
    // Only include photoUrl if it's a non-empty string
    ...(safeString(user.profilePicture) && { photoUrl: user.profilePicture }),
    // Only include role if it's a string (not object/array)
    ...(typeof user.role === 'string' ? { role: user.role } : {}),
  };

  return axios.put(
    `https://api.talkjs.com/v1/${TALKJS_APP_ID}/users/${talkUser.id}`,
    talkUser,
    {
      headers: {
        'Authorization': `Bearer ${TALKJS_SECRET}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

(async () => {
  try {
    const users = await fetchAllUsers();
    for (const user of users) {
      try {
        await syncUserToTalkJS(user);
        console.log(`Synced user: ${user.fullName || user.name || user.email}`);
      } catch (err) {
        console.error(`Failed to sync user ${user._id || user.id}:`, err.response?.data || err.message);
      }
    }
    console.log('Migration complete!');
  } catch (err) {
    console.error('Failed to fetch users:', err.message);
  }
})();
