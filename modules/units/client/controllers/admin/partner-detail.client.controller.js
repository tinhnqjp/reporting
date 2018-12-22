(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('PartnerDetailController', PartnerDetailController);

  PartnerDetailController.$inject = ['$scope', '$state', 'partnerResolve'];

  function PartnerDetailController($scope, $state, partner) {
    var vm = this;
    vm.partner = partner;
  }
}());
