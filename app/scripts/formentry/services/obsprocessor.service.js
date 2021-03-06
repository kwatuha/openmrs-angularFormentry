/*
jshint -W098, -W003, -W068, -W004, -W033, -W030, -W117, -W069, -W106, -W026
*/
/*
jscs:disable disallowMixedSpacesAndTabs, requireDotNotation, requirePaddingNewLinesBeforeLineComments, requireTrailingComma
*/
(function() {
  'use strict';

  angular
        .module('openmrs.angularFormentry')
        .factory('ObsProcessorService', ObsProcessService);

  ObsProcessService.$inject = ['$filter', '$log'];

  function ObsProcessService($filter, $log) {
      var service = {
        generateObsPayload: generateObsPayload
      };

      return service;

      function generateObsPayload(model, callback) {
        callback(_getSections(model));
      }

      function _parseDate(value, format, offset) {
        var format = format || 'yyyy-MM-dd HH:mm:ss';
        var offset = offset || '+0300';

        if (!(value instanceof Date)) {
          value = new Date(value);
          if (value === null || value === undefined) {
            return '';
          }
        }

        return $filter('date')(value, format, offset);
      }

      function _getSections(model) {
        var obsRestPayload = [];
        // $log.debug('Model', model);
        var sectionKeys = Object.keys(model);
        // $log.debug('Section Keys', sectionKeys);
        _.each(sectionKeys, function(section) {
          var sectionModel = model[section];
          // $log.debug('Section Models', sectionModel);
          _generateSectionPayLoad(sectionModel, obsRestPayload);
        });

        return obsRestPayload;
      }

      function _generateSectionPayLoad(sectionModel, obsRestPayload) {
        var fieldKeys = Object.keys(sectionModel);
        // $log.debug('fieldKeys', fieldKeys);
        _.each(fieldKeys, function(fieldKey) {
          if (fieldKey.startsWith('obsGroup')) {
            var sectionFields = sectionModel[fieldKey];
            var sectionKeys = Object.keys(sectionFields);
            var concept = sectionFields[sectionKeys[0]];
            var sectionObs = [];
            var obs = {
                concept:concept,
                groupMembers:sectionObs
              };

            _generateSectionPayLoad(sectionFields, sectionObs);
            if (sectionObs.length > 0) {
              obsRestPayload.push(obs);
            }

          } else if (fieldKey.startsWith('obsRepeating')) {
            var sectionFields = sectionModel[fieldKey];
            var sectionKeys = Object.keys(sectionFields[0]);
            // some repeating sections may miss the concept and schemaQuestion
            // attributes, therefore we will be need to rebuild this b4 passing
            // it on for processing
            _.each(sectionFields, function(_sectionFields) {
              var sectionObs = [];
              var concept = sectionFields[0][sectionKeys[0]];
              var obs = {
                  concept:concept,
                  groupMembers:sectionObs
                };
              _generateSectionPayLoad(_sectionFields, sectionObs);
              if (sectionObs.length > 0) {
                obsRestPayload.push(obs);
              }
            });

          } else if (fieldKey.startsWith('obs')) {
            var field = sectionModel[fieldKey];
            _generateFieldPayload(field, obsRestPayload);
          }

        });
      }

      function _setValue(field) {
        // $log.debug('Field b4 payload', field);
        // $log.debug('Field b4 payload  value', field.value);
        var obs = {};
        var initialValue = field.initialValue;
        var value = field.value;
        if (field.schemaQuestion.questionOptions.rendering === 'date') {
          if (_.isDate(value)) {
            value = _parseDate(field.value);
          }
        }

        if (_.isUndefined(initialValue) && (!_.isNull(value) &&
        value !== '' && !_.isUndefined(value))) {

          obs = {
            concept: field.concept,
            value:value
          };

        } else if (initialValue !== value && (!_.isNull(value) &&
        value !== '' && !_.isUndefined(value))) {
          obs = {
            uuid:field.initialUuid,
            concept: field.concept,
            value:value
          };
        }

        return obs;
      }

      function _generateFieldPayload(field, obsRestPayload) {
        var obs = {};
        var qRender = field.schemaQuestion.questionOptions.rendering;
        if (qRender === 'number' || qRender === 'text' || qRender === 'select' ||
        qRender === 'radio') {
          obs = _setValue(field);
          if (Object.keys(obs).length > 0) {obsRestPayload.push(obs);}
        } else if (qRender === 'multiCheckbox') {
          initialValue = field.initialValue;
          value = field.value;
          if (initialValue === undefined && (!_.isNull(value) &&
          value !== '' && !_.isUndefined(value))) {
            _.each(value, function(val) {
              obs = {
                concept: field.concept,
                value:val
              };
              if (obs) {
                $log.debug('obs payload', obs);
                obsRestPayload.push(obs);
              }

              $log.debug('obs REST payload', obsRestPayload);
            });

          } else if (initialValue !== value && (!_.isNull(value) &&
          value !== '' && !_.isUndefined(value))) {
            var existingObs = _.intersection(initialValue, value);
            var newObs = [];
            var obsToFilter = [];
            var obsToVoid = [];
            var i = 0;
            _.each(initialValue, function(val) {
              if (!(val in value)) {
                obs = {
                  concept: field.concept,
                  value:val,
                  uuid: initialUuid[i]
                };
                obsToVoid.push(val);
                obsRestPayload.push(obs);
              }

              i++;
            });

            obsToFilter = _.union(obsToVoid, existingObs);
            newObs = _.difference(value, obsToFilter);
            _.each(newObs, function(val) {
              obs = {
                concept: field.concept,
                value:val
              };
              obsRestPayload.push(obs);
            });
          }
        } else if (qRender === 'date') {
          obs = _setValue(field);
          if (Object.keys(obs).length > 0) {obsRestPayload.push(obs);}
        }

      }
    }
})();
