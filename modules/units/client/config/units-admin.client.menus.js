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
      title: '協力会社管理',
      state: 'admin.partners.list',
      parrent_state: 'admin.partners'
    });

    menuService.addMenuItem('topbar', {
      position: 4,
      class: 'fa fa-food-circle-o',
      title: '下請け管理',
      state: 'admin.workers.list',
      parrent_state: 'admin.workers'
    });

    menuService.addMenuItem('topbar', {
      position: 5,
      class: 'fa fa-food-circle-o',
      title: '下請け申請管理',
      state: 'admin.petitions.list',
      parrent_state: 'admin.petitions'
    });

    menuService.addMenuItem('topbar', {
      position: 6,
      class: 'fa fa-food-circle-o',
      title: '部署管理',
      state: 'admin.units.list',
      parrent_state: 'admin.units'
    });
  }
}());
