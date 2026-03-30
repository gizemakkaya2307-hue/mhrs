const bcrypt = require('bcryptjs');

async function testBcrypt() {
  try {
    console.log('Testing bcryptjs...');
    const hashed = await bcrypt.hash('Password123!', 10);
    console.log('Hashed:', hashed);
    const match = await bcrypt.compare('Password123!', hashed);
    console.log('Match:', match);
  } catch (error) {
    console.error('Bcrypt failed:', error);
  }
}

testBcrypt();
