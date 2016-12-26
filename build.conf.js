module.exports = {
    module: {
        name: 'pipLocations',
        styles: 'locations',
        export: 'pip.locations',
        standalone: 'pip.locations'
    },
    build: {
        js: false,
        ts: false,
        tsd: true,
        bundle: true,
        html: true,
        less: true,
        lib: true,
        images: true,
        dist: false
    },
    file: {
        lib: [
            '../pip-webui-lib/dist/**/*',            
            // '../pip-webui-test/dist/**/*',
            '../pip-webui-services/dist/**/*',
            '../pip-webui-themes/dist/**/*'
        ]
    },
    samples: {
        port: 8090,
        // https: false
    },
    api: {
        port: 8091
    }
};
