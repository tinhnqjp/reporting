(function () {
  'use strict';

  angular
    .module('core')
    .factory('uploadService', uploadService);

  uploadService.$inject = ['FileUploader'];
  function uploadService(FileUploader) {
    var service = {
      uploader: {},
      prepareUploader: prepareUploader,
      setCallBack: setCallBack
    };

    return service;

    function prepareUploader(url, alias) {
      service.uploader = new FileUploader({
        url: url,
        alias: alias
      });

      service.uploader.filters.push({
        name: alias,
        fn: function (item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
      service.uploader.onErrorItem = function (fileItem, response, status, headers) {
        // console.log('service.uploader.onErrorItem -> response', response);
        service.uploader.clearQueue();
      };

      return service.uploader;
    }

    function setCallBack(onAfterAddingFile, onSuccessItem) {
      service.uploader.onAfterAddingFile = function (fileItem) {
        onAfterAddingFile(fileItem);
      };
      service.uploader.onSuccessItem = function (fileItem, response, status, headers) {
        onSuccessItem(response);
      };
    }
  }
}());
