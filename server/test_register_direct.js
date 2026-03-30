const authService = require('./src/services/authService');
require('dotenv').config();

async function testRegister() {
  try {
    const result = await authService.registerUser({
      name: 'Test User',
      email: 'test' + Date.now() + '@example.com',
      password: 'Password123!',
      tcNo: '11122233344'
    });
    console.log('Registration success:', result);
  } catch (error) {
    console.error('Registration failed with error:');
    console.error(error);
    if (error.stack) console.error(error.stack);
  }
}

testRegister();
