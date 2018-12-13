(function () {
  'use strict';

  angular
    .module('foods.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Foods module
  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   position: 2,
    //   class: 'fa fa-food-circle-o',
    //   title: 'Foods',
    //   state: 'admin.foods.list',
    //   parrent_state: 'admin.foods'
    // });
  }
}());
