(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportPictureFormController', ReportPictureFormController);

  ReportPictureFormController.$inject = ['$scope', '$state', 'reportResolve', 'ReportsApi', 'UnitsApi', 'ngDialog', 'uploadService'];

  function ReportPictureFormController($scope, $state, report, ReportsApi, UnitsApi, ngDialog, uploadService) {
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

      vm.imageUrl = $scope.getImageDefault(vm.report.picture.store_image);
      prepareUploader();
    }

    function update(isValid) {
      vm.isSaveClick = true;
      if (vm.report.status !== 4 && !isValid) {
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

    vm.modalMachine = function (machine) {
      var defaultImg = $scope.getImageDefault('');
      if (!machine) {
        $scope.machine = { number: '', note: '', sets: [{ comment: '', before: defaultImg, after: defaultImg }] };
      } else {
        $scope.machine = machine;
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-machine.client.view.html',
        scope: $scope,
        showClose: false,
        closeByDocument: false,
        width: 1000,
        controller: ['$scope', function ($scope) {
          prepareUploaderBefore();

          $scope.confirmMachine = function (isValid) {
            $scope.isSaveClick = true;
            if (!isValid) {
              $scope.$broadcast('show-errors-check-validity', 'vm.modalMachineForm');
              return false;
            }

            if (!machine) {
              vm.report.picture.machines.push($scope.machine);
            } else {
              machine.number = $scope.machine.number;
              machine.note = $scope.machine.note;
              machine.sets = $scope.machine.sets;
            }

            $scope.confirm();
          };

          $scope.addSet = function () {
            $scope.machine.sets.push({ comment: '', before: defaultImg, after: defaultImg });
          };
          $scope.removeSet = function (set) {
            var index = $scope.machine.sets.indexOf(set);
            if (index !== -1) {
              $scope.machine.sets.splice(index, 1);
            }
          };
          $scope.removeImage = function (set, before) {
            if (before) {
              set.before = defaultImg;
            } else {
              set.after = defaultImg;
            }
          };

          $scope.modalPicUpload = function (set, before) {
            setImageDefault(set, before);

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
                  var api = { url: '/api/report/after', name: 'after' };
                  if (before) {
                    api = { url: '/api/report/before', name: 'before' };
                  }
                  $scope.uploader = uploadService.prepareUploader(api.url, api.name);
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
                    if (before) {
                      set.before = response.image;
                    } else {
                      set.after = response.image;
                    }
                    $scope.uploader.clearQueue();
                  }, function () {
                    // onWhenAddingFileFailed
                    $scope.selected = false;
                  }, function (response) {
                    // onErrorItem
                    setImageDefault(set, before);
                    $scope.selected = false;
                    $scope.handleCloseWaiting();
                    $scope.handleShowToast(response.message, 'エラー');
                  });
                }

                vm.removeImage = function () {
                  $scope.uploader.clearQueue();
                  $scope.image = '';
                  $scope.selected = false;
                  setImageDefault(set, before);
                  $('#image').attr('src', $scope.imageUrl);
                };
              }]
            })
              .then(function (res) {
                delete $scope.image;
              }, function (res) {
                delete $scope.image;
              });

            function setImageDefault(set, before) {
              if (before) {
                $scope.imageUrl = $scope.getImageDefault(set.before);
              } else {
                $scope.imageUrl = $scope.getImageDefault(set.after);
              }
            }
          };

          function prepareUploaderBefore() {
            $scope.uploaderBefore = uploadService.prepareUploader('/api/report/before', 'before');
            uploadService.setCallBack(function (fileItem) {
              // onAfterAddingFile
              $scope.selectedBefore = true;
              var reader = new FileReader();
              reader.onload = function (e) {
                $('#before').attr('src', e.target.result);
                $scope.beforeUrl = e.target.result;
              };
              reader.readAsDataURL(fileItem._file);
            }, function (response) {
              // onSuccessItem
              machine.before = response.image;
              $scope.uploaderBefore.clearQueue();
              if ($scope.selectedAfter) {
                vm.uploaderAfter.uploadAll();
              } else {
                handlerSave();
              }
            }, function () {
              // onWhenAddingFileFailed
              $scope.selectedBefore = false;
            }, function (response) {
              // onErrorItem
              $scope.beforeUrl = $scope.getImageDefault(before);
              $scope.selectedBefore = false;
              $scope.handleCloseWaiting();
              $scope.handleShowToast(response.message, 'エラー');
            });
          }
        }]
      })
        .then(function (res) {
          delete $scope.machine;
        }, function (res) {
          delete $scope.machine;
        });
    };

    vm.removeMachine = function (machine) {
      $scope.handleShowConfirm({
        message: 'この機器を削除します。よろしいですか？'
      }, function () {
        var index = vm.report.picture.machines.indexOf(machine);
        if (index !== -1) {
          vm.report.picture.machines.splice(index, 1);
        }
      });
    };

    function convertDateTime() {
      if (vm.report.start) {
        vm.report.start = $scope.parseDate(vm.report.start);
      }
    }

    function prepareUploader() {
      vm.uploader = uploadService.prepareUploader('/api/report/storeimage', 'store_image');
      uploadService.setCallBack(function (fileItem) {
        // onAfterAddingFile
        vm.isGetImageFromFile = true;

        var reader = new FileReader();
        reader.onload = function (e) {
          $('#store_image').attr('src', e.target.result);
          vm.imageUrl = e.target.result;
        };
        reader.readAsDataURL(fileItem._file);

      }, function (response) {
        // onSuccessItem
        vm.report.picture.store_image = response.image;
        handlerSave();
        vm.uploader.clearQueue();
      }, function () {
        // onWhenAddingFileFailed
        vm.isGetImageFromFile = false;
      }, function (response) {
        // onErrorItem
        vm.imageUrl = $scope.getImageDefault(vm.report.picture.store_image);
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
        $state.go('admin.reports.picture_detail', { reportId: vm.report._id });
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
      vm.report.picture.store_image = '';
      vm.isGetImageFromFile = false;
      vm.imageUrl = $scope.getImageDefault(vm.report.picture.store_image);
      $('#store_image').attr('src', vm.imageUrl);
    };
  }
}());
