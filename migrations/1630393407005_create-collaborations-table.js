exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
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
    user_id: {
      type: 'VARCHAR(30)',
      notNull: true,
      references: 'users',
      inDelete: 'CASCADE',
    },
  });
  pgm.addConstraint(
    'collaborations',
    'unique_playlist_id_and_user_id',
    'UNIQUE(playlist_id, user_id)'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
