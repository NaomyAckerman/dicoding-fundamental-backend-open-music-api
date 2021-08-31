class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);
      const { userId: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId,
      );
      const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);
      return h
        .response({
          status: 'success',
          message: 'Kolaborasi berhasil ditambahkan',
          data: {
            collaborationId,
          },
        })
        .code(201);
    } catch (error) {
      return error;
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);
      const { userId: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId,
      );
      await this._collaborationsService.deleteCollaboration(playlistId, userId);
      return h.response({
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      });
    } catch (error) {
      return error;
    }
  }
}

module.exports = CollaborationsHandler;
