(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportConstructFormController', ReportConstructFormController);

  ReportConstructFormController.$inject = ['$scope', '$state', 'reportResolve', 'ReportsApi', 'UnitsApi', 'ngDialog', 'uploadService'];

  function ReportConstructFormController($scope, $state, report, ReportsApi, UnitsApi, ngDialog, uploadService) {
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
      vm.image1Url = $scope.getImageDefault(vm.report.construct.image1);
      vm.image2Url = $scope.getImageDefault(vm.report.construct.image2);
      prepareUploader();
    }

    function update(isValid) {
      vm.isSaveClick = true;
      if (vm.report.status !== 4 && (!isValid || !handlerStartEnd())) {
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

    vm.removeWorker = function (worker) {
      $scope.handleShowConfirm({
        message: 'この作業者を削除します。よろしいですか？'
      }, function () {
        var index = vm.report.workers.indexOf(worker);
        if (index !== -1) {
          vm.report.workers.splice(index, 1);
        }
      });
    };

    vm.modalInternal = function (item) {
      $scope.block_number = false;
      if (item) {
        $scope.internal = Object.create(item);
        vm.report.construct.externals.forEach(exter => {
          if (exter.internals && exter.internals.split(',').indexOf(item.number + '') > -1) {
            $scope.block_number = true;
          }
        });
      } else {
        $scope.internal = {};
        var maxObj = _.maxBy(vm.report.construct.internals, 'number');
        var max = maxObj ? maxObj.number : 0;
        if (max < 9999) {
          $scope.internal.number = max + 1;
        } else {
          $scope.block_add_inter = true;
          return;
        }
      }

      $scope.four_taps = vm.configs.four_taps;
      if (!$scope.internal.pressure_test) {
        $scope.internal.pressure_test = 1;
      }
      if (!$scope.internal.Water_flow) {
        $scope.internal.Water_flow = 1;
      }
      if (!$scope.internal.test) {
        $scope.internal.test = 1;
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-construct-internal.client.view.html',
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
              vm.report.construct.internals.push($scope.internal);
            } else {
              item.number = $scope.internal.number;
              item.lineage_name = $scope.internal.lineage_name;

              item.old_maker = $scope.internal.old_maker;
              item.old_model = $scope.internal.old_model;
              item.old_serial = $scope.internal.old_serial;

              item.new_maker = $scope.internal.new_maker;
              item.new_model = $scope.internal.new_model;
              item.new_serial = $scope.internal.new_serial;

              item.pressure_test = $scope.internal.pressure_test;
              item.Water_flow = $scope.internal.Water_flow;
              item.test = $scope.internal.test;

              item.suction_temperature = $scope.internal.suction_temperature;
              item.blowing_temperature = $scope.internal.blowing_temperature;
            }

            $scope.confirm();
          };

          $scope.handlerNumberInternal = function (_number) {
            if (!_number) {
              return;
            }
            var isValid = false;
            vm.report.construct.internals.forEach(inter => {
              if (inter !== item && inter.number === _number) {
                isValid = true;
              }
            });

            if (isValid) {
              vm.modalInternalForm.number.$setValidity('dupl', false);
              return false;
            } else {
              vm.modalInternalForm.number.$setValidity('dupl', true);
              return true;
            }
          };

          $scope.modalMaker = function (maker, key) {
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
                  if (key === 'old_maker') {
                    $scope.internal.old_maker = $scope.input;
                  } else {
                    $scope.internal.new_maker = $scope.input;
                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
                  if (key === 'old_maker') {
                    $scope.internal.old_maker = value;
                  } else {
                    $scope.internal.new_maker = value;
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

    vm.removeInternal = function (item) {
      $scope.handleShowConfirm({
        message: 'この内機を削除します。よろしいですか？'
      }, function () {
        var index = vm.report.construct.internals.indexOf(item);
        if (index !== -1) {
          vm.report.construct.internals.splice(index, 1);
        }
      });
    };

    vm.modalExternal = function (item) {
      if (item) {
        $scope.external = Object.create(item);
      } else {
        $scope.external = {};
        var maxObj = _.maxBy(vm.report.construct.externals, 'number');
        var max = maxObj ? maxObj.number : 0;
        if (max < 9999) {
          $scope.external.number = max + 1;
        } else {
          $scope.block_add_exter = true;
          return;
        }
      }

      if (!$scope.external) {
        $scope.external = {};
      }
      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-construct-external.client.view.html',
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
              vm.report.construct.externals.push($scope.external);
            } else {
              item.number = $scope.external.number;
              item.lineage_name = $scope.external.lineage_name;
              item.old_maker = $scope.external.old_maker;
              item.old_model = $scope.external.old_model;
              item.old_serial = $scope.external.old_serial;
              item.new_maker = $scope.external.new_maker;
              item.new_model = $scope.external.new_model;
              item.new_serial = $scope.external.new_serial;
              item.pressure_test = $scope.external.pressure_test;
              item.Water_flow = $scope.external.Water_flow;
              item.test = $scope.external.test;
              item.old_spec = $scope.external.old_spec;
              item.new_spec = $scope.external.new_spec;
              item.recovery_refrigerant_kind = $scope.external.recovery_refrigerant_kind;
              item.recovery_amount = $scope.external.recovery_amount;
              item.specified_refrigerant_kind = $scope.external.specified_refrigerant_kind;
              item.specified_amount = $scope.external.specified_amount;
              item.filling_amount = $scope.external.filling_amount;
              item.target = $scope.external.target;
              item.remarks = $scope.external.remarks;
            }

            $scope.confirm();
          };

          $scope.handlerNumberExternal = function (_number) {
            if (!_number) {
              return;
            }
            var isValid = false;
            vm.report.construct.externals.forEach(inter => {
              if (inter !== item && inter.number === _number) {
                isValid = true;
              }
            });

            if (isValid) {
              vm.modalExternalForm.number.$setValidity('dupl', false);
              return false;
            } else {
              vm.modalExternalForm.number.$setValidity('dupl', true);
              return true;
            }
          };

          $scope.modalMaker = function (maker, key) {
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
                  if (key === 'old_maker') {
                    $scope.external.old_maker = $scope.input;
                  } else {
                    $scope.external.new_maker = $scope.input;
                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
                  if (key === 'old_maker') {
                    $scope.external.old_maker = value;
                  } else {
                    $scope.external.new_maker = value;
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

          $scope.modalSpec = function (spec, key) {
            $scope.specs = vm.configs.specifications;
            if (spec) {
              var index = _.indexOf($scope.specs, spec);
              if (index >= 0) {
                $scope.selected = spec;
                $scope.input = '';
              } else {
                $scope.input = spec;
                $scope.selected = '';
              }
            }

            ngDialog.openConfirm({
              templateUrl: '/modules/reports/client/views/admin/modal-spec.client.view.html',
              scope: $scope,
              showClose: false,
              closeByDocument: false,
              width: 600,
              controller: ['$scope', function ($scope) {
                $scope.confirmForm = function () {
                  if (key === 'old_spec') {
                    $scope.external.old_spec = $scope.input;
                  } else {
                    $scope.external.new_spec = $scope.input;
                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
                  if (key === 'old_spec') {
                    $scope.external.old_spec = value;
                  } else {
                    $scope.external.new_spec = value;
                  }
                  $scope.confirm();
                };
              }]
            })
              .then(function (res) {
                delete $scope.spec;
              }, function (res) {
                delete $scope.spec;
              });
          };

          $scope.modalRefrigerantKind = function (refrigerant_kind, key) {
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
                  if (key === 'recovery_refrigerant_kind') {
                    $scope.external.recovery_refrigerant_kind = $scope.input;
                  } else {
                    $scope.external.specified_refrigerant_kind = $scope.input;
                  }
                  $scope.confirm();
                };
                $scope.selectValue = function (value) {
                  if (key === 'recovery_refrigerant_kind') {
                    $scope.external.recovery_refrigerant_kind = value;
                  } else {
                    $scope.external.specified_refrigerant_kind = value;
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

        }]
      })
        .then(function (res) {
          delete $scope.external;
        }, function (res) {
          delete $scope.external;
        });
    };

    vm.removeExternal = function (item) {
      $scope.handleShowConfirm({
        message: 'この外機を削除します。よろしいですか？'
      }, function () {
        var index = vm.report.construct.externals.indexOf(item);
        if (index !== -1) {
          vm.report.construct.externals.splice(index, 1);
        }
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

    vm.modalConstructImage = function (image) {
      if (image === 1) {
        $scope.upload = { url: '/api/report/image1', name: 'image1' };
        $scope.imageUrl = $scope.getImageDefault(vm.report.construct.image1);
      } else {
        $scope.upload = { url: '/api/report/image2', name: 'image2' };
        $scope.imageUrl = $scope.getImageDefault(vm.report.construct.image2);
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-pic-upload.client.view.html',
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
            $scope.uploader = uploadService.prepareUploader($scope.upload.url, $scope.upload.name);
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
              if (image === 1) {
                vm.report.construct.image1 = response.image;
                vm.image1Url = $scope.getImageDefault(vm.report.construct.image1);
              } else {
                vm.report.construct.image2 = response.image;
                vm.image2Url = $scope.getImageDefault(vm.report.construct.image2);
              }
              $scope.uploader.clearQueue();
            }, function () {
              // onWhenAddingFileFailed
              $scope.selected = false;
            }, function (response) {
              // onErrorItem
              if (image === 1) {
                $scope.imageUrl = $scope.getImageDefault(vm.report.construct.image1);
              } else {
                $scope.imageUrl = $scope.getImageDefault(vm.report.construct.image2);
              }
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

    vm.removeConstructImage = function (image) {
      $scope.handleShowConfirm({
        message: 'この写真を削除します。よろしいですか？'
      }, function () {
        if (image === 1) {
          vm.report.construct.image1 = '';
          vm.image1Url = $scope.getImageDefault('');
        } else {
          vm.report.construct.image2 = '';
          vm.image2Url = $scope.getImageDefault('');
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
        $state.go('admin.reports.construct_detail', { reportId: vm.report._id });
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
      vm.imageUrl = $scope.getImageDefault('');
      $('#signature').attr('src', vm.imageUrl);
    };


    vm.handlerWorkKindChanged = function () {
      var work_kind = vm.report.construct.work_kind;
      console.log('TCL: vm.handlerWorkKindChanged -> work_kind', work_kind);
      if (work_kind) {
        var find = _.find(vm.configs.construct_work_kind, { 'title': work_kind });
        if (find) {
          vm.report.construct.summary = find.content;
        }
      } else {
        vm.report.construct.summary = '';
      }
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
  }
}());
