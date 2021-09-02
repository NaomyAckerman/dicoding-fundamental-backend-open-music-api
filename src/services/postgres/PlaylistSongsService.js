const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async verifyPlaylistSong(playlistId, songId) {
    const query = {
      text: 'SELECT * FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Playlist lagu gagal diverifikasi');
    }
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan kedalam playlist');
    }
    await this._cacheService.delete(`playlists:${playlistId}`);
  }

  async getPlaylistSongsById(playlistId) {
    try {
      const result = await this._cacheService.get(`playlists:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs
                INNER JOIN songs ON playlistsongs.song_id = songs.id WHERE playlistsongs.playlist_id = $1`,
        values: [playlistId],
      };
      const result = await this._pool.query(query);
      await this._cacheService.set(
        `playlists:${playlistId}`,
        JSON.stringify(result.rows),
      );
      return result.rows;
    }
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }
    await this._cacheService.delete(`playlists:${playlistId}`);
  }
}

module.exports = PlaylistSongsService;
