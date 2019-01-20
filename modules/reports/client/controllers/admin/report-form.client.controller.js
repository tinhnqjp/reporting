(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportFormController', ReportFormController);

  ReportFormController.$inject = ['$scope', '$state', 'reportResolve', 'ReportsApi', 'UnitsApi', 'ngDialog', 'uploadService'];

  function ReportFormController($scope, $state, report, ReportsApi, UnitsApi, ngDialog, uploadService) {
    var vm = this;
    vm.report = report;
    vm.update = update;
    vm.configs = {};
    vm.units = [];
    onCreate();

    function onCreate() {

      convertDateTime();
      ReportsApi.config()
        .success(function (res) {
          if (res.config) {
            vm.configs = res.config;
          }
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });
      UnitsApi.units()
        .success(function (res) {
          vm.units = res;
          if (vm.report.unit) {
            vm.report.unit = _.find(vm.units, { '_id': vm.report.unit });
          }
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });

      vm.imageUrl = $scope.getImageDefault(vm.report.signature);
      prepareUploader();
    }

    function update(isValid) {
      vm.isSaveClick = true;
      if (!isValid || !handlerStartEnd()) {
        $scope.$broadcast('show-errors-check-validity', 'vm.reportForm');
        return false;
      }

      if (vm.report.unit) {
        vm.report.unit_id = vm.report.unit._id;
        vm.report.unit_name = vm.report.unit.name;
      }

      $scope.handleShowConfirm({
        message: 'この報告書を保存します。よろしいですか？'
      }, function () {
        $scope.handleShowWaiting();
        if (vm.isGetImageFromFile) {
          vm.uploader.uploadAll();
        } else {
          handlerSave();
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
        closeByDocument: false,
        width: 1000,
        controller: ['$scope', function ($scope) {
          $scope.confirmWorker = function (isValid) {
            $scope.isSaveClick = true;
            if (!isValid || !handlerStartEnd()) {
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

          $scope.handlerStartEndBlur = function () {
            if (!handlerStartEnd()) {
              $scope.$broadcast('show-errors-check-validity', 'vm.modalWorkerForm');
              return false;
            }
          };

          function handlerStartEnd() {
            if ($scope.worker.work_end && $scope.worker.work_start && $scope.worker.work_end < $scope.worker.work_start) {
              vm.modalWorkerForm.work_start.$setValidity('work_end', false);
              return false;
            } else {
              vm.modalWorkerForm.work_start.$setValidity('work_end', true);
              return true;
            }
          }
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
      $scope.pic_taps = vm.configs.pic_taps;
      $scope.type_taps = vm.configs.type_taps;
      $scope.two_taps = vm.configs.two_taps;
      $scope.three_taps = vm.configs.three_taps;
      $scope.four_taps = vm.configs.four_taps;
      if (!$scope.internal) {
        $scope.internal = {};
      }
      if (!$scope.internal.has_picture) {
        $scope.internal.has_picture = false;
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
        $scope.internal.damage = false;
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
        $scope.internal.measure = false;
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-internal.client.view.html',
        scope: $scope,
        showClose: false,
        closeByDocument: false,
        width: 1000,
        controller: ['$scope', function ($scope) {
          if (!$scope.internal) {
            $scope.internal = {};
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
              item.has_picture = $scope.internal.has_picture;
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
              item.before_confirmed = $scope.internal.before_confirmed;
              item.damage = $scope.internal.damage;
              item.drainage = $scope.internal.drainage;
              item.noise_and_vibration = $scope.internal.noise_and_vibration;
              item.after_confirmed = $scope.internal.after_confirmed;
              item.measure = $scope.internal.measure;

              item.temp_before_suction = $scope.internal.temp_before_suction;
              item.temp_before_blow = $scope.internal.temp_before_blow;
              item.temp_before_diff = $scope.internal.temp_before_diff;
              item.temp_after_suction = $scope.internal.temp_after_suction;
              item.temp_after_blow = $scope.internal.temp_after_blow;
              item.temp_after_diff = $scope.internal.temp_after_diff;

              item.wind_before_suction = $scope.internal.wind_before_suction;
              item.wind_before_blow = $scope.internal.wind_before_blow;
              item.wind_before_diff = $scope.internal.wind_before_diff;
              item.wind_after_suction = $scope.internal.wind_after_suction;
              item.wind_after_blow = $scope.internal.wind_after_blow;
              item.wind_after_diff = $scope.internal.wind_after_diff;

              item.assembler = $scope.internal.assembler;
              item.exterior_type = $scope.internal.exterior_type;
              item.description = $scope.internal.description;
            }

            $scope.confirm();
          };

          $scope.modalMaker = function (maker) {
            $scope.makers = vm.configs.makers;
            if (maker) {
              var index = _.indexOf($scope.makers, maker);
              if (index >= 0) {
                $scope.selected = maker;
                $scope.input = '';
              } else {
                $scope.input = maker;
                $scope.selected = '';
              }
            }

            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-maker.client.view.html',
              scope: $scope,
              showClose: false,
              closeByDocument: false,
              width: 600,
              controller: ['$scope', function ($scope) {
                $scope.confirmForm = function () {
                  if ($scope.internal) {
                    $scope.internal.maker = $scope.input;

                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
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
            $scope.types = vm.configs.types;
            if (type) {
              var index = _.indexOf($scope.types, type);
              if (index >= 0) {
                $scope.selected = type;
                $scope.input = '';
              } else {
                $scope.input = type;
                $scope.selected = '';
              }
            }

            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-type.client.view.html',
              scope: $scope,
              showClose: false,
              closeByDocument: false,
              width: 600,
              controller: ['$scope', function ($scope) {

                $scope.confirmForm = function () {
                  if ($scope.internal) {
                    $scope.internal.type = $scope.input;
                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
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

          $scope.modalDescription = function (description) {
            $scope.descriptions = vm.configs.phrases;
            if (description) {
              var index = _.indexOf($scope.descriptions, description);
              if (index >= 0) {
                $scope.selected = description;
                $scope.input = '';
              } else {
                $scope.input = description;
                $scope.selected = '';
              }
            }

            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-description.client.view.html',
              scope: $scope,
              showClose: false,
              closeByDocument: false,
              width: 600,
              controller: ['$scope', function ($scope) {
                $scope.confirmForm = function () {
                  if ($scope.internal) {
                    $scope.internal.description = $scope.input;
                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
                  if ($scope.internal) {
                    $scope.internal.description = value;
                  }
                  $scope.confirm();
                };
              }]
            })
              .then(function (res) {
                delete $scope.description;
              }, function (res) {
                delete $scope.description;
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

          $scope.changeTempBefore = function () {
            var temp_before_suction = $scope.internal.temp_before_suction || 0;
            var temp_before_blow = $scope.internal.temp_before_blow || 0;
            $scope.internal.temp_before_diff = roundAbs(temp_before_suction - temp_before_blow);
          };
          $scope.changeTempAfter = function () {
            var temp_after_suction = $scope.internal.temp_after_suction || 0;
            var temp_after_blow = $scope.internal.temp_after_blow || 0;
            $scope.internal.temp_after_diff = roundAbs(temp_after_suction - temp_after_blow);
          };

          $scope.changeWindBefore = function () {
            var wind_before_suction = $scope.internal.wind_before_suction || 0;
            var wind_before_blow = $scope.internal.wind_before_blow || 0;
            $scope.internal.wind_before_diff = roundAbs(wind_before_suction - wind_before_blow);
          };
          $scope.changeWindAfter = function () {
            var wind_after_suction = $scope.internal.wind_after_suction || 0;
            var wind_after_blow = $scope.internal.wind_after_blow || 0;
            $scope.internal.wind_after_diff = roundAbs(wind_after_suction - wind_after_blow);
          };

          function roundAbs(num) {
            return Math.round(Math.abs(num) * 100) / 100;
          }
        }]
      })
        .then(function (res) {
          delete $scope.internal;
        }, function (res) {
          delete $scope.internal;
        });
    };

    vm.modalExternal = function (item) {
      if (item) {
        $scope.external = Object.create(item);
      }
      $scope.pic_taps = vm.configs.pic_taps;
      $scope.four_taps = vm.configs.four_taps;

      if (!$scope.external) {
        $scope.external = {};
      }
      if (!$scope.external.has_picture) {
        $scope.external.has_picture = false;
      }
      if (!$scope.external.before_noise_and_vibration) {
        $scope.external.before_noise_and_vibration = 1;
      }
      if (!$scope.external.breakage_dent) {
        $scope.external.breakage_dent = 1;
      }
      if (!$scope.external.heat_exchanger) {
        $scope.external.heat_exchanger = 1;
      }
      if (!$scope.external.exterior_clean) {
        $scope.external.exterior_clean = 1;
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-external.client.view.html',
        scope: $scope,
        showClose: false,
        closeByDocument: false,
        width: 1000,
        controller: ['$scope', function ($scope) {
          if (!$scope.external) {
            $scope.external = {};
          }

          $scope.confirmExternal = function (isValid) {
            $scope.isSaveClick = true;
            if (!isValid) {
              $scope.$broadcast('show-errors-check-validity', 'vm.modalExternalForm');
              return false;
            }

            if (!item) {
              vm.report.clean.externals.push($scope.external);
            } else {
              item.has_picture = $scope.external.has_picture;
              item.number = $scope.external.number;
              item.maker = $scope.external.maker;
              item.internals = $scope.external.internals;
              item.model = $scope.external.model;
              item.serial = $scope.external.serial;
              item.refrigerant_kind = $scope.external.refrigerant_kind;
              item.made_date = $scope.external.made_date;

              item.before_noise_and_vibration = $scope.external.before_noise_and_vibration;
              item.breakage_dent = $scope.external.breakage_dent;
              item.heat_exchanger = $scope.external.heat_exchanger;
              item.exterior_clean = $scope.external.exterior_clean;
              item.after_noise_and_vibration = $scope.external.after_noise_and_vibration;

              item.description = $scope.external.description;
            }

            $scope.confirm();
          };

          $scope.modalMaker = function (maker) {
            $scope.makers = vm.configs.makers;
            if (maker) {
              var index = _.indexOf($scope.makers, maker);
              if (index >= 0) {
                $scope.selected = maker;
                $scope.input = '';
              } else {
                $scope.input = maker;
                $scope.selected = '';
              }
            }

            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-maker.client.view.html',
              scope: $scope,
              showClose: false,
              closeByDocument: false,
              width: 600,
              controller: ['$scope', function ($scope) {
                $scope.confirmForm = function () {
                  if ($scope.external) {
                    $scope.external.maker = $scope.input;
                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
                  if ($scope.external) {
                    $scope.external.maker = value;
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

          $scope.modalInternals = function (internals) {
            $scope.internals = vm.report.clean.internals;
            if (internals && typeof internals === 'string') {
              $scope.external.internals = internals.split(',').map(function (value) {
                return parseInt(value, 10);
              });
            }

            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-internals.client.view.html',
              scope: $scope,
              showClose: false,
              closeByDocument: false,
              width: 600,
              controller: ['$scope', function ($scope) {
                $scope.confirmForm = function () {
                  if ($scope.external) {
                    $scope.external.internals = $scope.external.internals.join();
                  }
                  $scope.confirm();
                };
              }]
            })
              .then(function (res) {
                delete $scope.internals;
              }, function (res) {
                delete $scope.internals;
              });
          };

          $scope.modalRefrigerantKind = function (refrigerant_kind) {
            $scope.refrigerant_kinds = vm.configs.refrigerant_kinds;
            if (refrigerant_kind) {
              var index = _.indexOf($scope.refrigerant_kinds, refrigerant_kind);
              if (index >= 0) {
                $scope.selected = refrigerant_kind;
                $scope.input = '';
              } else {
                $scope.input = refrigerant_kind;
                $scope.selected = '';
              }
            }

            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-refrigerant-kind.client.view.html',
              scope: $scope,
              showClose: false,
              closeByDocument: false,
              width: 600,
              controller: ['$scope', function ($scope) {
                $scope.confirmForm = function () {
                  if ($scope.external) {
                    $scope.external.refrigerant_kind = $scope.input;
                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
                  if ($scope.external) {
                    $scope.external.refrigerant_kind = value;
                  }
                  $scope.confirm();
                };
              }]
            })
              .then(function (res) {
                delete $scope.refrigerant_kind;
              }, function (res) {
                delete $scope.refrigerant_kind;
              });
          };

          $scope.modalDescription = function (description) {
            $scope.descriptions = vm.configs.phrases;
            if (description) {
              var index = _.indexOf($scope.descriptions, description);
              if (index >= 0) {
                $scope.selected = description;
                $scope.input = '';
              } else {
                $scope.input = description;
                $scope.selected = '';
              }
            }

            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-description.client.view.html',
              scope: $scope,
              showClose: false,
              closeByDocument: false,
              width: 600,
              controller: ['$scope', function ($scope) {
                $scope.confirmForm = function () {
                  if ($scope.external) {
                    $scope.external.description = $scope.input;
                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
                  if ($scope.external) {
                    $scope.external.description = value;
                  }
                  $scope.confirm();
                };
              }]
            })
              .then(function (res) {
                delete $scope.description;
              }, function (res) {
                delete $scope.description;
              });
          };

          $scope.tapTwo = function (id, name) {
            $scope.external[name] = !id;
          };

          $scope.tapFour = function (id, name) {
            if (id < 4) {
              $scope.external[name] = id + 1;
            } else {
              $scope.external[name] = 1;
            }
          };
        }]
      })
        .then(function (res) {
          delete $scope.external;
        }, function (res) {
          delete $scope.external;
        });
    };

    vm.modalOtherWork = function (otherWorker) {
      $scope.otherWorker = {};
      if (otherWorker) {
        $scope.otherWorker = Object.create(otherWorker);
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-other-worker.client.view.html',
        scope: $scope,
        showClose: false,
        closeByDocument: false,
        width: 1000,
        controller: ['$scope', function ($scope) {

          $scope.confirmWorker = function (isValid) {
            $scope.isSaveClick = true;
            if (!isValid) {
              $scope.$broadcast('show-errors-check-validity', 'vm.modalWorkerForm');
              return false;
            }

            if (!otherWorker) {
              vm.report.clean.other_works.push($scope.otherWorker);
            } else {
              otherWorker.title = $scope.otherWorker.title;
              otherWorker.detail = $scope.otherWorker.detail;
            }

            $scope.confirm();
          };

          $scope.modalTitle = function (title) {
            $scope.work_title = vm.configs.work_title;
            if (title) {
              $scope.selected = title;
            }
            if ($scope.otherWorker) {
              $scope.otherWorker.title = '';
            }

            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-work-title.client.view.html',
              scope: $scope,
              showClose: false,
              closeByDocument: false,
              width: 600,
              controller: ['$scope', function ($scope) {

                $scope.selectValue = function (value) {
                  if ($scope.otherWorker) {
                    $scope.otherWorker.title = value;
                  }
                  $scope.confirm();
                };
              }]
            })
              .then(function (res) {
                delete $scope.title;
              }, function (res) {
                delete $scope.title;
              });
          };
        }]
      })
        .then(function (res) {
          delete $scope.otherWorker;
        }, function (res) {
          delete $scope.otherWorker;
        });
    };

    vm.modalLocation = function (location) {
      if (location) {
        $scope.selected = location;
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-location.client.view.html',
        scope: $scope,
        showClose: false,
        closeByDocument: false,
        width: 600,
        controller: ['$scope', function ($scope) {
          $scope.selectValue = function (value) {
            if (value) {
              vm.report.location = value;
            }
            $scope.confirm();
          };
        }]
      })
        .then(function (res) {
          delete $scope.selected;
        }, function (res) {
          delete $scope.selected;
        });
    };

    vm.modalDrawing = function (image) {
      $scope.imageUrl = $scope.getImageDefault(image);

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-drawing.client.view.html',
        scope: $scope,
        showClose: false,
        closeByDocument: false,
        width: 600,
        controller: ['$scope', function ($scope) {
          prepareUploader();

          $scope.confirmImage = function (isValid) {
            $scope.isSaveClick = true;
            if (!isValid) {
              $scope.$broadcast('show-errors-check-validity', 'vm.modalImageForm');
              return false;
            }
            if ($scope.selected) {
              $scope.uploader.uploadAll();
            }
            $scope.confirm();
          };

          function prepareUploader() {
            $scope.uploader = uploadService.prepareUploader('/api/report/drawing', 'drawings');
            uploadService.setCallBack(function (fileItem) {
              // onAfterAddingFile
              $scope.selected = true;
              var reader = new FileReader();
              reader.onload = function (e) {
                $('#image').attr('src', e.target.result);
                $scope.imageUrl = e.target.result;
              };
              reader.readAsDataURL(fileItem._file);
            }, function (response) {
              // onSuccessItem
              if (!image) {
                vm.report.drawings.push(response.image);
              } else {
                var index = vm.report.drawings.indexOf(image);
                if (index !== -1) {
                  vm.report.drawings[index] = response.image;
                }
              }
              $scope.uploader.clearQueue();
            }, function () {
              // onWhenAddingFileFailed
              $scope.selected = false;
            }, function (response) {
              // onErrorItem
              $scope.imageUrl = $scope.getImageDefault(image);
              $scope.selected = false;
              $scope.handleCloseWaiting();
              $scope.handleShowToast(response.message, 'エラー');
            });
          }

          vm.removeImage = function () {
            $scope.uploader.clearQueue();
            $scope.image = '';
            $scope.selected = false;
            $scope.imageUrl = $scope.getImageDefault($scope.image);
            $('#image').attr('src', $scope.imageUrl);
          };
        }]
      })
        .then(function (res) {
          delete $scope.image;
        }, function (res) {
          delete $scope.image;
        });
    };

    vm.removeDrawing = function (image) {
      $scope.handleShowConfirm({
        message: 'この見取り図を削除します。よろしいですか？'
      }, function () {
        var index = vm.report.drawings.indexOf(image);
        if (index !== -1) {
          vm.report.drawings.splice(index, 1);
        }
      });
    };

    vm.handlerStartEndBlur = function () {
      if (!handlerStartEnd()) {
        $scope.$broadcast('show-errors-check-validity', 'vm.reportForm');
        return false;
      }
    };

    function handlerStartEnd() {
      if (vm.report.end && vm.report.start && vm.report.end < vm.report.start) {
        vm.reportForm.start.$setValidity('end', false);
        return false;
      } else {
        vm.reportForm.start.$setValidity('end', true);
        return true;
      }
    }

    function convertDateTime() {
      if (vm.report.start) {
        vm.report.start = $scope.parseDate(vm.report.start);
      }
      if (vm.report.end) {
        vm.report.end = $scope.parseDate(vm.report.end);
      }

      vm.report.workers.forEach(worker => {
        if (worker.work_start) {
          worker.work_start = $scope.parseDate(worker.work_start);
        }
        if (worker.work_end) {
          worker.work_end = $scope.parseDate(worker.work_end);
        }
      });
    }

    function prepareUploader() {
      vm.uploader = uploadService.prepareUploader('/api/report/signature', 'signature');
      uploadService.setCallBack(function (fileItem) {
        // onAfterAddingFile
        vm.isGetImageFromFile = true;

        var reader = new FileReader();
        reader.onload = function (e) {
          $('#signature').attr('src', e.target.result);
          vm.imageUrl = e.target.result;
        };
        reader.readAsDataURL(fileItem._file);

      }, function (response) {
        // onSuccessItem
        vm.report.signature = response.image;
        handlerSave();
        vm.uploader.clearQueue();
      }, function () {
        // onWhenAddingFileFailed
        vm.isGetImageFromFile = false;
      }, function (response) {
        // onErrorItem
        vm.imageUrl = $scope.getImageDefault(vm.report.signature);
        vm.isGetImageFromFile = false;
        $scope.handleCloseWaiting();
        $scope.handleShowToast(response.message, 'エラー');
      });
    }

    function handlerSave() {
      vm.report.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $scope.handleCloseWaiting();
        $state.go('admin.reports.detail', { reportId: vm.report._id });
        $scope.handleShowToast('この報告書の保存が完了しました。');
      }

      function errorCallback(res) {
        $scope.handleCloseWaiting();
        var message = (res) ? res.message || res.data.message : '報告書の保存が失敗しました。';
        $scope.handleShowToast(message, true);
      }
    }

    vm.removeImage = function () {
      vm.uploader.clearQueue();
      vm.report.signature = '';
      vm.isGetImageFromFile = false;
      vm.imageUrl = $scope.getImageDefault(vm.report.signature);
      $('#signature').attr('src', vm.imageUrl);
    };
  }
}());
