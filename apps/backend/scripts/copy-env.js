const fs = require('fs');

if (!fs.existsSync('.env')) {
  fs.copyFileSync('.env.example', '.env');
}
if (!fs.existsSync('.env.test')) {
  fs.copyFileSync('.env.test.example', '.env.test');
}