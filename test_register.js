async function testRegister() {
    try {
        const uniqueId = Date.now();
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${uniqueId}@example.com`,
                password: 'password123',
                tcNo: `1${uniqueId}`
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('SUCCESS:', data);
        } else {
            console.log('SERVER ERROR:', response.status, data);
        }
    } catch (error) {
        console.log('NETWORK ERROR:', error.message);
    }
}

testRegister();
