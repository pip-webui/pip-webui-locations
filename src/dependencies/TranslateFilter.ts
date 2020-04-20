{
    function translateFilter($injector) {
        "ngInject";
        let pipTranslate = $injector.has('pipTranslate')
            ? $injector.get('pipTranslate') : null;

        return function (key) {
            return pipTranslate ? pipTranslate.translate(key) || key : key;
        }
    }

    angular
        .module('pipLocations.Translate', [])
        .filter('translate', translateFilter);
}