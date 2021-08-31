/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlistsongs', {
    id: {
      type: 'VARCHAR(30)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(30)',
      notNull: true,
      references: 'playlists',
      onDelete: 'CASCADE',
    },
    song_id: {
      type: 'VARCHAR(30)',
      notNull: true,
      references: 'songs',
      inDelete: 'CASCADE',
    },
  });
  pgm.addConstraint(
    'playlistsongs',
    'unique_playlist_id_and_song_id',
    'UNIQUE(playlist_id, song_id)'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlistsongs');
};
