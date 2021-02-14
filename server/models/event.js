module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define("Event", {
    eventName: DataTypes.STRING,
    createdBy: DataTypes.STRING,
    time: DataTypes.STRING,
    description: DataTypes.STRING,
  });

  Event.associate = (models) => {
    Event.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    Event.hasMany(models.Guest, {
      foreignKey: "eventId",
      as: "guests",
    });
  };

  return Event;
};
