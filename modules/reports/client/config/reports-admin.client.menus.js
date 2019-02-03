(function () {
  'use strict';

  angular
    .module('reports.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Reports module
  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      position: 6,
      roles: ['operator', 'bsoperator', 'dispatcher', 'employee', 'admin'],
      class: 'fa fa-food-circle-o',
      title: '報告書管理',
      state: 'admin.reports.list',
      parrent_state: 'admin.reports'
    });
  }
}());
