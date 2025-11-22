// check-ports.js
const net = require('net');

// 調べたいポート候補を並べる
const ports = [
  3000, 3001, 3002,
  8080, 8081,
  5173, 4173,
  8000, 8001,
  9000, 9001,
];

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      resolve({ port, ok: false, code: err.code });
    });

    server.once('listening', () => {
      server.close(() => {
        resolve({ port, ok: true, code: null });
      });
    });

    server.listen(port, '127.0.0.1');
  });
}

(async () => {
  for (const port of ports) {
    const result = await checkPort(port);
    if (result.ok) {
      console.log(`✅ port ${port} : OK (listen 可能)`);
    } else {
      console.log(`❌ port ${port} : NG (${result.code})`);
    }
  }
})();