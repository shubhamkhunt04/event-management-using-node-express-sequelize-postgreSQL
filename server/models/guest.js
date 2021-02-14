module.exports = (sequelize, DataTypes) => {
  const Guest = sequelize.define("Guest", {
    userId: DataTypes.INTEGER,
    eventId: DataTypes.INTEGER,
    invitedUserEmail: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  });

  Guest.associate = (models) => {
    Guest.belongsTo(models.Event, {
      foreignKey: "eventId",
      onDelete: "CASCADE",
    });
    Guest.hasMany(models.User, {
      foreignKey: "id",
      as: "users",
    });
  };
  return Guest;
};
