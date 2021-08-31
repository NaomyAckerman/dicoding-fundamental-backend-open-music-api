class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const songId = await this._service.addSong(request.payload);
      return h
        .response({
          status: 'success',
          message: 'Lagu berhasil ditambahkan',
          data: {
            songId,
          },
        })
        .code(201);
    } catch (error) {
      return error;
    }
  }

  async getSongsHandler(_request, h) {
    try {
      const songs = await this._service.getSongs();
      return h.response({
        status: 'success',
        data: {
          songs,
        },
      });
    } catch (error) {
      return error;
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);
      return h.response({
        status: 'success',
        data: {
          song,
        },
      });
    } catch (error) {
      return error;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      await this._service.editSongById(id, request.payload);
      return h.response({
        status: 'success',
        message: 'lagu berhasil diperbarui',
      });
    } catch (error) {
      return error;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);
      return h.response({
        status: 'success',
        message: 'lagu berhasil dihapus',
      });
    } catch (error) {
      return error;
    }
  }
}

module.exports = SongsHandler;
