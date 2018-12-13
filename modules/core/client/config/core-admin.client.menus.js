(function () {
  'use strict';

  angular
    .module('core.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      position: 0,
      class: 'icon fa fa-home',
      title: 'ホーム',
      state: 'home',
      parrent_state: 'home'
    });
  }
}());
