'use strict';

var through = require('through2');
var pluginError = require('plugin-error');
var path = require('path');
var fancyLog = require("fancy-log");
var deploy = require('deploy-azure-cdn');

/**
 * gulp plugin for deploying files to azure storage
 */
module.exports = function (opt) {
    var PLUGIN_NAME = 'gulp-deploy-azure-cdn ';
    var files = [];
    // upload files all at once, not one by one because we want to get some speed
    // doing it concurrently
    return through.obj(
        function (file, enc, cb) {
            var self = this;
            if (path.basename(file.path)[0] === '_') {
                return cb();
            }
            if (file.isNull()) {
                self.push(file);
                return cb();
            }
            if (file.isStream()) {
                self.emit('error', new pluginError(PLUGIN_NAME, 'Streaming not supported'));
                return cb();
            }
            files.push(file);
            return cb();
        },
        function (cb) {
            var self = this;
            var logger = fancyLog.bind(PLUGIN_NAME);
            try {
                deploy(opt, files, logger, function (err) {
                    if (err) {
                        self.emit('error', new pluginError(PLUGIN_NAME, err));
                    } else {
                        self.emit('end');
                    }
                    cb();
                })
            } catch (err) {
                self.emit('error', new pluginError(PLUGIN_NAME, err));
                cb();
            }
        });
};
