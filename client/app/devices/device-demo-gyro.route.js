const _ = require('lodash')
const gyro = require('../../vendor/gyro.min')

/* @ngInject */
function deviceDemoGyroRoute ($stateProvider) {
  $stateProvider.state('devices.device-demo-gyro', {
    url: '/:id/demo-gyro-controller?header',
    template: `
      <div class="gyroWrapper">
        <p>Gathering data:</p>
        <div class="data-list">
        </div>
      </div>
    `,
    controllerAs: 'demogyro',
    resolve: {
      /* @ngInject */
      templates (devicesService) {
        return devicesService.getDeviceTemplates()
      },
      /* @ngInject */
      device ($stateParams, $state, devicesService) {
        const id = $stateParams.id
        return devicesService.getDevice(id)
        .catch(() => $state.go('devices'))
      }
    },
    /* @ngInject */
    controller ($log, $scope, $rootScope, $state, $location, $window, $document, device, templates, devicesService, socketService, modalService, DEVICES_CONFIG, CONFIG, EVENTS, segment) {
      gyro.frequency = 100;
      gyro.startTracking(function(o) {
        var value =o.alpha+"_"+o.beta+"_"+o.gamma;

        var data = document.getElementsByClassName('data-list')[0];
        var para = document.createElement("p");
        var textNode = document.createTextNode(value);
        para.appendChild(textNode);
        data.appendChild(para);
        device.update('gyro', value);
      });
    }
  })
}

module.exports = deviceDemoGyroRoute
