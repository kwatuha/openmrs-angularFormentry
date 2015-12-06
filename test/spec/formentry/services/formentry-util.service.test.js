/*
jshint -W098, -W003, -W068, -W004, -W033, -W030, -W117, -W069, -W106
*/
/*jscs:disable disallowMixedSpacesAndTabs, requireDotNotation, requirePaddingNewLinesBeforeLineComments, requireTrailingComma*/
(function(){
    'use strict';
    var utils;
    var zone;
    describe('Util Service tests', function() {
        beforeEach(function() {
            //debugger;
            module('openmrs.angularFormentry');    
        });
        
        beforeEach(inject(function($injector){
            utils = $injector.get('FormEntryUtil');
            zone = utils.getLocalTimezone();
        }))
        
        describe('getLocalTimezone tests', function() {
            it('should start with + or -', function(){
                expect(['+', '-']).to.include.members([zone[0]]);
            });
            
            it('should return a string of length 5', function() {
                expect(zone).to.have.length(5);
            });
            
            it('should give correct offset when converted back', function() {
                var sign = zone[0];
                var hours = zone.substring(1,3);
                var mins = zone.substring(3);
                var offset = sign + (hours * 60 + new Number(mins));
                offset = new Number(offset);
                offset = -offset;
                expect(offset).to.equal(new Date().getTimezoneOffset());
            });
        });
        
        describe('formatDate tests', function() {
            it('should format date as expected', function() {
                // default format 
                var d = 'Thu Sep 09 2004 11:59:59 GMT+0300 (EAT)';
                expect(utils.formatDate(d,null,'+0300')).to.equal('2004-09-09 11:59:59');
                
                expect(utils.formatDate(d,'yyyy/MM/dd'))
                .to.equal('2004/09/09');
                
                expect(utils.formatDate(d,'MMM d, yyyy'))
                .to.equal('Sep 9, 2004');
            })
        });
    });
})();
