'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    getImageable(options) {
      if (!this.imageableType) return Promise.resolve(null);
      const mixinMethodName = `get${this.imageableType}`;
      return this[mixinMethodName](options);
    }
    static associate(models) {
      Image.belongsTo(models.Spot, {as: 'spot', foreignKey: 'imageableId', constraints: false});
      Image.belongsTo(models.Review, {as: 'review', foreignKey: 'imageableId', constraints: false});
    }
  }
  Image.init({
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Must have image'
        }
      }
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    imageableId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    imageableType: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Image',
  });

  Image.addHook('afterFind', findResult => {
    if (!Array.isArray(findResult)) findResult = [findResult];
    for (const instance of findResult) {
      if (instance.imageableType === 'spot' && instance.previewImage !== undefined) {
        instance.imageable = instance.previewImage;
      } else if (instance.imageableType === 'review' && instance.reviewImage !== undefined) {
        instance.imageable = instance.reviewImage;
      }
      // To prevent mistakes:
      delete instance.previewImage;
      delete instance.dataValues.previewImage;
      delete instance.reviewImage;
      delete instance.dataValues.reviewImage;
    }
  });


  return Image;
};
