const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (
    server,
    {
      playlistsService, producerService, consumerService, validator,
    },
  ) => {
    const exportsHandler = new ExportsHandler(
      playlistsService,
      producerService,
      consumerService,
      validator,
    );
    server.route(routes(exportsHandler));
  },
};
