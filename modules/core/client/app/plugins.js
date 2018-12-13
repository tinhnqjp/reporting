(function () {
  'use strict';
  // Angular-ui-notification configuration
  angular.module('ui-notification').config(function (NotificationProvider) {
    NotificationProvider.setOptions({
      delay: 2000,
      startTop: 20,
      startRight: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'right',
      positionY: 'bottom'
    });
  });

  angular
    .module('core')
    // .config(loadingBarConfig)
    // .config(breadcrumbConfig)
    // .config(toastConfig)
    // .config(toolTipConfig)
    // .config(calendarCf)
    .config(httpConnectionConfig)
    .run(uibPaginationConfig)
    .run(uibDatepickerConfig)
    .run(uibDatepickerPopupConfig)
    .run(runConfig);

  uibPaginationConfig.$inject = ['uibPaginationConfig'];
  function uibPaginationConfig(uibPaginationConfig) {
    uibPaginationConfig.firstText = '最初';
    uibPaginationConfig.lastText = '最後';
    uibPaginationConfig.previousText = '前';
    uibPaginationConfig.nextText = '次';
    uibPaginationConfig.maxSize = '5';
    uibPaginationConfig.boundaryLinks = 'true';
  }

  uibDatepickerConfig.$inject = ['uibDatepickerConfig'];
  function uibDatepickerConfig(uibDatepickerConfig) {
    uibDatepickerConfig.showWeeks = false;
    uibDatepickerConfig.format = 'yyyy/MM/dd';
  }

  uibDatepickerPopupConfig.$inject = ['uibDatepickerPopupConfig'];
  function uibDatepickerPopupConfig(uibDatepickerPopupConfig) {
    uibDatepickerPopupConfig.closeText = 'Close';
    uibDatepickerPopupConfig.showWeeks = false;
    uibDatepickerPopupConfig.placement = 'auto bottom';
    uibDatepickerPopupConfig.format = 'yyyy/MM/dd';
  }

  // toastConfig.$inject = ['toastrConfig'];
  // function toastConfig(toastrConfig) {
  //   angular.extend(toastrConfig, {
  //     allowHtml: false,
  //     autoDismiss: true,
  //     closeButton: true,
  //     // containerId: 'toast-container',
  //     maxOpened: 8,
  //     newestOnTop: false,
  //     positionClass: 'toast-bottom-right',
  //     preventDuplicates: false,
  //     preventOpenDuplicates: false,
  //     target: 'body'
  //   });
  // }

  // toolTipConfig.$inject = ['$tooltipProvider'];
  // function toolTipConfig($tooltipProvider) {
  //   var parser = new UAParser();
  //   var result = parser.getResult();
  //   var touch = result.device && (result.device.type === 'tablet' || result.device.type === 'mobile');
  //   if (touch) {
  //     var options = {
  //       trigger: 'dontTrigger'
  //     };
  //     $tooltipProvider.options(options);
  //   }
  // }

  // calendarCf.$inject = ['calendarConfig'];
  // function calendarCf(calendarConfig) {
  //   calendarConfig.dateFormatter = 'moment';
  // }

  // ngTagsInputConfig.$inject = ['tagsInputConfigProvider'];
  // function ngTagsInputConfig(tagsInputConfigProvider) {
  //   tagsInputConfigProvider.setDefaults('tagsInput', {
  //     placeholder: ''
  //   });
  // }
  httpConnectionConfig.$inject = ['$httpProvider'];
  function httpConnectionConfig($httpProvider) {
    $httpProvider.defaults.timeout = 5000;
  }

  function runConfig(amMoment) { // amMoment
    amMoment.changeLocale('ja');
  }
}());
