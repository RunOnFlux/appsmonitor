const identity = require('./identity'); // json identity

module.exports = {
  email: {
    host: 'smtp-relay.gmail.com',
    port: 465,
    email: 'apps@runonflux.io',
    from: 'Flux Apps',
    client: identity.client_id,
    key: identity.private_key,
    password: identity.apppassword,
    testnet: true,
  },
};
