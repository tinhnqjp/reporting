(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportFormController', ReportFormController);

  ReportFormController.$inject = ['$scope', '$state', 'reportResolve', 'ReportsApi', 'UnitsApi', 'ngDialog'];

  function ReportFormController($scope, $state, report, ReportsApi, UnitsApi, ngDialog) {
    var vm = this;
    vm.report = report;
    vm.update = update;
    vm.configs = {};
    vm.units = [];
    onCreate();

    function onCreate() {
      // vm.report.workers.push({
      //   name: 'demo',
      //   company: 'cty',
      //   work_start: new Date(),
      //   work_end: new Date()
      // });
      console.log(vm.report);

      ReportsApi.config()
        .success(function (res) {
          vm.configs = res;
          console.log('​onCreate ->  vm.configs', vm.configs);
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });
      UnitsApi.units()
        .success(function (res) {
          vm.units = res;
          if (vm.report.unit_id) {
            vm.report.unit_id = _.find(vm.units, { '_id': vm.report.unit_id._id });
          }
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });
    }

    function update(isValid) {
      if (!isValid) {
        vm.isSaveClick = true;
        $scope.$broadcast('show-errors-check-validity', 'vm.reportForm');
        return false;
      }
      $scope.handleShowConfirm({
        message: 'この報告書を保存します。よろしいですか？'
      }, function () {
        vm.report.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.reports.list');
          $scope.handleShowToast('この報告書の保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '報告書の保存が失敗しました。';
          $scope.handleShowToast(message, true);
        }
      });
    }

    vm.modalWorker = function (worker) {
      if (worker) {
        $scope.worker = Object.create(worker);
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-worker.client.view.html',
        scope: $scope,
        showClose: false,
        width: 900,
        controller: ['$scope', function ($scope) {
          $scope.confirmWorker = function (isValid) {
            $scope.isSaveClick = true;
            if (!isValid) {
              $scope.$broadcast('show-errors-check-validity', 'vm.modalWorkerForm');
              return false;
            }

            if (!worker) {
              vm.report.workers.push($scope.worker);
            } else {
              worker.name = $scope.worker.name;
              worker.company = $scope.worker.worker;
              worker.work_start = $scope.worker.work_start;
              worker.work_end = $scope.worker.work_end;
            }

            $scope.confirm();
          };
        }]
      })
        .then(function (res) {
          delete $scope.worker;
        }, function (res) {
          delete $scope.worker;
        });
    };

    vm.modalInternal = function (item) {
      if (item) {
        $scope.internal = Object.create(item);
      }
      $scope.two_taps = vm.configs.two_taps;
      $scope.three_taps = vm.configs.three_taps;
      $scope.four_taps = vm.configs.four_taps;
      if (!$scope.internal) {
        $scope.internal = {};
      }
      if (!$scope.internal.drain_pump) {
        $scope.internal.drain_pump = 1;
      }
      if (!$scope.internal.hose) {
        $scope.internal.hose = 1;
      }
      if (!$scope.internal.hose) {
        $scope.internal.hose = 1;
      }
      if (!$scope.internal.heat_exchanger) {
        $scope.internal.heat_exchanger = 1;
      }
      if (!$scope.internal.drain_pan) {
        $scope.internal.drain_pan = 1;
      }
      if (!$scope.internal.grill) {
        $scope.internal.grill = 1;
      }
      if (!$scope.internal.filter) {
        $scope.internal.filter = 1;
      }
      if (!$scope.internal.before_confirmed) {
        $scope.internal.before_confirmed = 1;
      }
      if (!$scope.internal.damage) {
        $scope.internal.damage = true;
      }
      if (!$scope.internal.drainage) {
        $scope.internal.drainage = 1;
      }
      if (!$scope.internal.noise_and_vibration) {
        $scope.internal.noise_and_vibration = 1;
      }
      if (!$scope.internal.after_confirmed) {
        $scope.internal.after_confirmed = 1;
      }
      if (!$scope.internal.measure) {
        $scope.internal.measure = true;
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-internal.client.view.html',
        scope: $scope,
        showClose: false,
        width: 900,
        controller: ['$scope', function ($scope) {
          if (!$scope.internal) {
            $scope.internal = {
              maker: 'tinh',
              type: 'tinh222'
            };
          }

          $scope.confirmInternal = function (isValid) {
            $scope.isSaveClick = true;
            if (!isValid) {
              $scope.$broadcast('show-errors-check-validity', 'vm.modalInternalForm');
              return false;
            }

            if (!item) {
              vm.report.clean.internals.push($scope.internal);
            } else {
              item.number = $scope.internal.number;
              item.maker = $scope.internal.maker;
              item.type = $scope.internal.type;
              item.model = $scope.internal.model;
              item.serial = $scope.internal.serial;
              item.drain_pump = $scope.internal.drain_pump;
              item.hose = $scope.internal.hose;
              item.heat_exchanger = $scope.internal.heat_exchanger;
              item.drain_pan = $scope.internal.drain_pan;
              item.grill = $scope.internal.grill;
              item.filter = $scope.internal.filter;
            }

            $scope.confirm();
          };

          $scope.modalMaker = function (maker) {
            if ($scope.internal) {
              $scope.internal.maker = maker;
            }
            $scope.maker = {
              input: maker
            };

            $scope.makers = vm.configs.makers;
            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-maker.client.view.html',
              scope: $scope,
              showClose: false,
              width: 400,
              controller: ['$scope', function ($scope) {

                $scope.confirmMaker = function () {
                  if ($scope.internal) {
                    $scope.internal.maker = $scope.maker.input;
                  }
                  $scope.confirm();
                };
                $scope.selectMaker = function (value) {
                  if ($scope.internal) {
                    $scope.internal.maker = value;
                  }
                  $scope.confirm();
                };
              }]
            })
              .then(function (res) {
                delete $scope.maker;
              }, function (res) {
                delete $scope.maker;
              });
          };

          $scope.modalType = function (type) {
            if ($scope.internal) {
              $scope.internal.type = type;
            }
            $scope.type = {
              input: type
            };

            $scope.types = vm.configs.types;
            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-type.client.view.html',
              scope: $scope,
              showClose: false,
              width: 400,
              controller: ['$scope', function ($scope) {

                $scope.confirmType = function () {
                  if ($scope.internal) {
                    $scope.internal.type = $scope.type.input;
                  }
                  $scope.confirm();
                };
                $scope.selectType = function (value) {
                  if ($scope.internal) {
                    $scope.internal.type = value;
                  }
                  $scope.confirm();
                };
              }]
            })
              .then(function (res) {
                delete $scope.type;
              }, function (res) {
                delete $scope.type;
              });
          };

          $scope.tapTwo = function (id, name) {
            $scope.internal[name] = !id;
          };
          $scope.tapThree = function (id, name) {
            if (id < 3) {
              $scope.internal[name] = id + 1;
            } else {
              $scope.internal[name] = 1;
            }
          };
          $scope.tapFour = function (id, name) {
            if (id < 4) {
              $scope.internal[name] = id + 1;
            } else {
              $scope.internal[name] = 1;
            }
          };

        }]
      })
        .then(function (res) {
          delete $scope.internal;
        }, function (res) {
          delete $scope.internal;
        });
    };

  }
}());
