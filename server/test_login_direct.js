const authService = require('./src/services/authService');
require('dotenv').config();

async function testLogin() {
  try {
    const result = await authService.loginUser({
      email: 'admin@admin.com',
      password: 'admin123'
    });
    console.log('Login success:', result);
  } catch (error) {
    console.error('Login failed:', error);
    if (error.stack) console.error(error.stack);
  }
}

testLogin();
