describe('pipEnums', function () {
    'use strict';

    var pipEnums;

    beforeEach(module('pipRest.Enums'));

    beforeEach(inject(function (_pipEnums_) {
        pipEnums = _pipEnums_;
    }));
    
    it('SHARE_LEVEL', function () {
        expect(pipEnums.SHARE_LEVEL).to.isDefined;
    });

    it('GENDER', function () {
        expect(pipEnums.GENDER).to.isDefined;

        expect(pipEnums.GENDERS).to.have.lengthOf(3);
        expect(pipEnums.GENDERS).to.include('male');
        expect(pipEnums.GENDERS).to.include('female');
        expect(pipEnums.GENDERS).to.include('n/s');

    });
});
