class ExportsHandler {
  constructor(playlistsService, producerService, validator) {
    this._playlistsService = playlistsService;
    this._producerService = producerService;
    this._validator = validator;
    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const { playlistId } = request.params;
    const { userId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };
    const queue = 'export:playlists';
    await this._producerService.sendMessage(queue, JSON.stringify(message));
    return h
      .response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      })
      .code(201);
  }
}

module.exports = ExportsHandler;
