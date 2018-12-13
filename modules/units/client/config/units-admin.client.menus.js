(function () {
  'use strict';

  angular
    .module('units.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Units module
  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      position: 3,
      class: 'fa fa-food-circle-o',
      title: '手配者管理',
      state: 'admin.dispatchers.list',
      parrent_state: 'admin.dispatchers'
    });
  }
}());
