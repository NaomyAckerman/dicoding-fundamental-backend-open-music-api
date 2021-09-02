class ExportsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postExportPlaylistsHandler =
      this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const message = {
      userId: request.auth.credentials.userId,
      targetEmail: request.payload.targetEmail,
    };
    await this._service.sendMessage(
      'export:playlists',
      JSON.stringify(message)
    );
    return h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
  }
}

module.exports = ExportsHandler;
