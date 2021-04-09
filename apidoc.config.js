// apidoc configuration file
const { name, version } = require('./package.json');

module.exports = {
  description: 'T2GP Publisher Service',
  order: ['Games', 'Webhook'],
  name,
  title: 'Publisher Services API',
  version,
};
