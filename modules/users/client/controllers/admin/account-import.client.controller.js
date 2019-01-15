(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('AccountImportController', AccountImportController);

  AccountImportController.$inject = ['$scope', '$state', 'FileUploader', 'ngDialog'];

  function AccountImportController($scope, $state, FileUploader, ngDialog) {
    var vm = this;
    vm.isSelected = false;
    prepareUploader();

    function prepareUploader() {
      FileUploader.FileSelect.prototype.isEmptyAfterSelection = function () {
        return false; // true|false
      };
      vm.uploader = new FileUploader({
        url: '/api/users/import',
        alias: 'import'
      });
      vm.uploader.filters.push({
        name: 'import',
        fn: function (item, options) {
          return this.queue.length < 10;
        }
      });
      vm.uploader.onAfterAddingFile = function () {
        vm.isSelected = true;
      };
      vm.uploader.onBeforeUploadItem = function (item) {
        $scope.handleShowWaiting();
      };
      vm.uploader.onSuccessItem = function (fileItem, response, status, headers) {
        $scope.handleCloseWaiting();
        if (response.status && response.result) {
          vm.result = response.result;
          $scope.handleShowToast('アカウントインポートが完了しました');
        } else {
          vm.errors = response.errors;
          $scope.handleShowToast('データのインポートが失敗しました。', true);
        }

        $('#file-selection').val(null);
        vm.uploader.clearQueue();
        vm.isSelected = false;
      };
      vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
        $scope.handleCloseWaiting();
        var message = 'データのインポートが失敗しました。';
        if (response && response.message) {
          message = response.message;
        } else if (response.data && response.data.message) {
          message = response.data.message;
        }

        vm.errors = [message];
        $scope.handleShowToast(message, true);

        $('#file-selection').val(null);
        vm.uploader.clearQueue();
        vm.isSelected = false;
      };
    }

    vm.handleUpload = function () {
      if (!vm.isSelected) {
        $scope.handleShowToast('Excelファイルを選択してください。', true);
        return;
      }

      $scope.handleShowConfirm({
        message: 'アカウント情報を更新します。よろしいですか？'
      }, function () {
        delete vm.result;
        delete vm.errors;
        vm.uploader.uploadAll();
      });
    };
  }
}());
