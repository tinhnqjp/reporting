(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('PartnerDetailController', PartnerDetailController);

  PartnerDetailController.$inject = ['$scope', '$state', 'partnerResolve'];

  function PartnerDetailController($scope, $state, partner) {
    var vm = this;
    vm.partner = partner;
<<<<<<< HEAD

=======
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
  }
}());
