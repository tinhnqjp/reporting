(function () {
  'use strict';

  angular
    .module('users.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Users module
  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      position: 2,
      class: 'fa fa-user-circle-o',
      title: 'アカウント管理',
      state: 'admin.users.list',
      parrent_state: 'admin.users'
    });

    menuService.addMenuItem('topbar', {
      position: 9,
      class: 'fa fa-lock',
      title: 'パスワード変更',
      state: 'settings',
      parrent_state: 'settings'
    });
  }
}());
