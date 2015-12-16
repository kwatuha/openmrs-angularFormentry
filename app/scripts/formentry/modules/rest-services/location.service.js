/*
jshint -W003,-W109, -W106, -W098, -W003, -W068, -W004, -W033, -W030, -W117, -W116, -W069, -W026
*/
/*jscs:disable safeContextKeyword, requireDotNotation, requirePaddingNewLinesBeforeLineComments, requireTrailingComma*/
(function() {
  'use strict';

  angular
    .module('openmrs.RestServices')
    .service('LocationResService', LocationResService);

  LocationResService.$inject = ['$resource'];

  function LocationResService($resource) {
    var serviceDefinition;

    var cachedLocations = [];

    serviceDefinition = {
      initialize:initialize,
      getResource: getResource,
      searchResource: searchResource,
      getListResource: getListResource,
      getLocations: getLocations,
      getLocationByUuid: getLocationByUuid,
      getLocationByUuidFromEtl:getLocationByUuidFromEtl,
      findLocation: findLocation,
      cachedLocations: cachedLocations,
      getTestLocations:getTestLocations,
      getSelectedTestLocation:getSelectedTestLocation
      
    };

    return serviceDefinition;

    function initialize() {
      getLocations(function() {}, function() {});
    }

    function getResource() {
      return $resource('/location/:uuid',
        { uuid: '@uuid' },
        { query: { method: 'GET', isArray: false } });
    }

    function getResourceFromEtl() {
      return $resource('/custom_data/location/uuid/:uuid',
        { uuid: '@uuid' },
        { query: { method: 'GET', isArray: false } });
    }

    function getListResource() {
      return $resource('/location?v=default',
        { uuid: '@uuid' },
        { query: { method: 'GET', isArray: false } });
    }

    function searchResource() {
      return $resource('/location?q=:search&v=default',
        { search: '@search' },
        { query: { method: 'GET', isArray: false } });
    }

    function getLocationByUuid(uuid, successCallback, failedCallback) {
      var resource = getResource();
      return resource.get({ uuid: uuid }).$promise
        .then(function(response) {
          successCallback(response);
        })
        .catch(function(error) {
          failedCallback('Error processing request', error);
          console.error(error);
        });
    }

    function getLocationByUuidFromEtl(uuid, successCallback, failedCallback) {
      var resource = getResourceFromEtl();
      return resource.get({ uuid: uuid }).$promise
        .then(function(response) {
          successCallback(response);
        })
        .catch(function(error) {
          alert(JSON.stringify(error));
          console.error(error);
        });
    }

    function findLocation(searchText, successCallback, failedCallback) {       
      var resource = searchResource();
      return resource.get({ search: searchText }).$promise
        .then(function(response) {
          successCallback(response.results ? response.results : response);
        })
        .catch(function(error) {
          failedCallback('Error processing request', error);
          console.error(error);
        });  
    }

    function getLocations(successCallback, failedCallback, refreshCache) {
      var resource = getListResource();
      //console.log(serviceDefinition.cachedLocations);
      if (refreshCache === false && serviceDefinition.cachedLocations.length !== 0) {
        successCallback(serviceDefinition.cachedLocations);
        return { results: serviceDefinition.cachedLocations };
      }

      return resource.get().$promise
        .then(function(response) {
          serviceDefinition.cachedLocations = response.results ? response.results : response;
          successCallback(response.results ? response.results : response);
        })
        .catch(function(error) {
          failedCallback('Error processing request', error);
          console.error(error);
        });
    }
    
    //hardcoded locations for testing
    
    function findTestLocations (searchText) {       
        var testAttrs=getTestLocations ();              
        return _.filter(testAttrs, function(attr){ return  attr.display.toLowerCase().indexOf(searchText.toLowerCase())>-1 });      
    }
    
    function getTestLocations (){
      return [{
                display:  'Health Center 2 = 9',
                uuid:  'location5-uuid',
                name:  'Location 5 = 5',
                value: {
                  uuid:  'location5-uuid',
                  display:  'Location 5 = 5',
                  name:  'Health Center 2'
                },
                attributeType: {
                  uuid:  'fb121d9dc370',
                  display:  'Health Center 2'
                }
              },
              {
                display:  'Health Center = 4',
                uuid:  'location9-uuid',
                name:  'Location 9 = 9',
                value: {
                  uuid:  'location9-uuid',
                  display:  'Location 9 '
                },
                attributeType: {
                  uuid:  '8d87236c-c2cc-11de-8d13-0010c6dffd0f',
                  display:  'Health Center 2'
                }
              },
              {
                display:  'Test Health Center = 4',
                uuid:  'location10-uuid',
                name:  'Location 10 = 10',
                value: {
                  uuid:  'location3-uuid',
                  display:  'Location 10 '
                },
                attributeType: {
                  uuid:  '8d87236c-c2cc-11de-8d13-0010c6dffd0f',
                  display:  'Health Center 2'
                }
              }];
      
    }
    
    function getSelectedTestLocation(locationId,onSuccess, onError){
      var locations=getTestLocations();
      return locations[locationId];
    }
    
     
  }               
})();
