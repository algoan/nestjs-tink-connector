const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.post('/v2/oauth/token', (req, res) => {
  res.json({
    access_token: 'access_token_jwt',
    expires_in: 60,
    refresh_expires_in: 864000,
    refresh_token: 'refresh_token',
    token_type: 'bearer',
    'not-before-policy': 1566571512,
    session_state: 'xxxxx-xxxxx-xxxxx',
    scope: 'profile email',
  });
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);

// Use default router
server.use(
  jsonServer.rewriter({
    '/v1/*': '/$1',
    '/v2/*': '/$1',
    '/customers/:customerId/:resource/*': '/:resource/$3',
  }),
);

server.use(router);

server.listen(4000, () => {
  console.log('JSON Server is running');
});
