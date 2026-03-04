import http from 'http';

function check(path, method = 'GET') {
    return new Promise((resolve) => {
        const req = http.request(`http://localhost:5000${path}`, { method }, (res) => {
            console.log(`${method} ${path} -> ${res.statusCode}`);
            resolve(res.statusCode);
        });
        req.on('error', (e) => {
            console.error(`${method} ${path} -> ERROR: ${e.message}`);
            resolve(500);
        });
        req.end();
    });
}

async function run() {
    await check('/api/experiences/feed');
    await check('/api/comments/123');
    await check('/api/likes');
    await check('/api/comments', 'POST');
    await check('/api/likes', 'POST');
}

run();
