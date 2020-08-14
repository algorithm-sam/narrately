'use strict';
module.exports = (sequelize, DataTypes) => {
  const MailSubscription = sequelize.define('MailSubscription', {
    email: DataTypes.STRING
  }, {});
  MailSubscription.associate = function(models) {
    MailSubscription.belongsTo(models.User)
  };
  return MailSubscription;
};