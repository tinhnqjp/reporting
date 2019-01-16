'use strict';

module.exports = {
  getSort: function (condition) {
    var sort = (condition.sort_direction === '-') ? condition.sort_direction : '';
    return sort + condition.sort_column;
  },

  getLimit: function (condition) {
    return parseInt(condition.limit, 10);
  },

  getMessage: function (errors) {
    if (errors && errors.length > 0) {
      return { message: errors[0].msg };
    }
    return null;
  }
};
