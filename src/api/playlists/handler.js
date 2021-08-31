class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postPlaylistSongByIdHandler = this.postPlaylistSongByIdHandler.bind(this);
    this.getPlaylistSongsByIdHandler = this.getPlaylistSongsByIdHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { userId: owner } = request.auth.credentials;
      const playlistId = await this._service.addPlaylist({
        ...request.payload,
        owner,
      });
      return h
        .response({
          status: 'success',
          message: 'Playlist berhasil ditambahkan',
          data: {
            playlistId,
          },
        })
        .code(201);
    } catch (error) {
      return error;
    }
  }

  async getPlaylistHandler(request, h) {
    try {
      const { userId: owner } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(owner);
      return h.response({
        status: 'success',
        data: { playlists },
      });
    } catch (error) {
      return error;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { userId: owner } = request.auth.credentials;
      await this._service.verifyPlaylistOwner(playlistId, owner);
      await this._service.deletePlaylistById(playlistId);
      return h.response({
        status: 'success',
        message: 'Playlist berhasil dihapus',
      });
    } catch (error) {
      return error;
    }
  }

  async postPlaylistSongByIdHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { playlistId } = request.params;
      const { userId: owner } = request.auth.credentials;
      await this._service.verifyPlaylistAccess(playlistId, owner);
      await this._service.addSongToPlaylist({
        ...request.payload,
        playlistId,
      });
      return h
        .response({
          status: 'success',
          message: 'Lagu berhasil ditambahkan ke playlist',
        })
        .code(201);
    } catch (error) {
      return error;
    }
  }

  async getPlaylistSongsByIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { userId: owner } = request.auth.credentials;
      await this._service.verifyPlaylistAccess(playlistId, owner);
      const songs = await this._service.getSongsFromPlaylist(playlistId);
      return h.response({
        status: 'success',
        data: { songs },
      });
    } catch (error) {
      return error;
    }
  }

  async deletePlaylistSongByIdHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { playlistId } = request.params;
      const { userId: owner } = request.auth.credentials;
      await this._service.verifyPlaylistAccess(playlistId, owner);
      await this._service.deleteSongsFromPlaylist({
        ...request.payload,
        playlistId,
      });
      return h.response({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      });
    } catch (error) {
      return error;
    }
  }
}

module.exports = PlaylistHandler;
