(function () {
  'use strict';

  angular
    .module('units.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Units module
  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      position: 2,
      class: 'fa fa-food-circle-o',
      title: '協力者管理',
      state: 'admin.partners.list',
      parrent_state: 'admin.partners'
    });

    menuService.addMenuItem('topbar', {
      position: 3,
      class: 'fa fa-food-circle-o',
      title: '下請け管理',
      state: 'admin.workers.list',
      parrent_state: 'admin.workers'
    });

    menuService.addMenuItem('topbar', {
      position: 4,
      class: 'fa fa-food-circle-o',
      title: '部署管理',
      state: 'admin.units.list',
      parrent_state: 'admin.units'
    });
  }
}());
