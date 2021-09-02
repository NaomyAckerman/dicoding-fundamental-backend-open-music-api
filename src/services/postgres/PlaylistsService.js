const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(
    playlistSongsService,
    songsService,
    collaborationService,
    cacheService,
  ) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._cacheService = cacheService;
  }

  async addPlaylist(payload) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, ...Object.values(payload)],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
              INNER JOIN users ON users.id = playlists.owner
              LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
              WHERE playlists.owner = $1 OR collaborations.user_id = $1 ORDER BY playlists.owner`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };
    await this._pool.query(query);
    await this._cacheService.delete(`playlists:${id}`);
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addSongToPlaylist({ playlistId, songId }) {
    await this._songsService.getSongById(songId);
    await this._playlistSongsService.addPlaylistSong(playlistId, songId);
    await this._cacheService.delete(`playlists:${playlistId}`);
  }

  async getSongsFromPlaylist(playlistId) {
    try {
      const songs = await this._cacheService.get(`playlists:${playlistId}`);
      return JSON.parse(songs);
    } catch (error) {
      const songs = await this._playlistSongsService.getPlaylistSongsById(
        playlistId,
      );
      await this._cacheService.set(
        `playlists:${playlistId}`,
        JSON.stringify(songs),
      );
      return songs;
    }
  }

  async deleteSongsFromPlaylist({ playlistId, songId }) {
    await this._playlistSongsService.verifyPlaylistSong(playlistId, songId);
    await this._playlistSongsService.deletePlaylistSongById(playlistId, songId);
    await this._cacheService.delete(`playlists:${playlistId}`);
  }

  async verifyPlaylistAccess(playlistId, owner) {
    try {
      await this.verifyPlaylistOwner(playlistId, owner);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, owner);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
