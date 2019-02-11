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
      roles: ['admin'],
      class: 'fa fa-food-circle-o',
      title: '協力会社管理',
      state: 'admin.partners.list',
      parrent_state: 'admin.partners'
    });

    menuService.addMenuItem('topbar', {
      position: 4,
      roles: ['admin'],
      class: 'fa fa-food-circle-o',
      title: '下請管理',
      state: 'admin.workers.list',
      parrent_state: 'admin.workers'
    });

    menuService.addMenuItem('topbar', {
      position: 5,
      roles: ['admin'],
      class: 'fa fa-food-circle-o',
      title: '下請申請管理',
      state: 'admin.petitions.list',
      parrent_state: 'admin.petitions'
    });

    menuService.addMenuItem('topbar', {
      position: 6,
      roles: ['admin'],
      class: 'fa fa-food-circle-o',
      title: '部署管理',
      state: 'admin.units.list',
      parrent_state: 'admin.units'
    });
  }
}());
