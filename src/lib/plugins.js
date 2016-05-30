'use strict';

var logger = require('log4js').getLogger('cloudify.plugins');

/**
 * @description Collection of API calls for plugins.
 * @class PluginsClient
 * @param {ClientConfig} config
 * @constructor
 */
function PluginsClient(config) {
    this.config = config;
}

/**
 * @description Lists all plugins.
 * @param {ApiCallback} callback
 */
PluginsClient.prototype.list = function(callback) {
    logger.trace('listing plugins');

    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': this.config.endpoint + '/plugins'
    }, callback);
};

/**
 * @description Gets a plugin.
 * @param {string} plugin_id - The id of the plugin.
 * @param {ApiCallback} callback
 */
PluginsClient.prototype.get = function(plugin_id, callback) {
    logger.trace('getting plugin by id');

    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': String.format(this.config.endpoint + '/plugins/{0}', plugin_id)
    }, callback);
};

/**
 * @description Deletes a plugin from the Cloudify manager.
 * @param {string} plugin_id - The id of the plugin.
 * @param {ApiCallback} callback
 */
PluginsClient.prototype.delete = function(plugin_id, callback) {
    logger.trace('deleting plugin');

    return this.config.request({
        'method': 'DELETE',
        'json': true,
        'url': String.format(this.config.endpoint + '/plugins/{0}', plugin_id)
    }, callback);
};

/**
 *
 * @description Downloads a plugin from Cloudify manager.
 * @param {string} plugin_id - The id of the plugin.
 * @param {ApiCallback} callback
 */
PluginsClient.prototype.download = function(plugin_id, callback) {
    logger.trace('downloading plugin');

    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': String.format(this.config.endpoint + '/plugins/{0}/archive', plugin_id)
    }, callback);
};

/**
 *
 * @description Uploads a new plugin to Cloudify manager.
 * @param {(string|file)} plugin - The plugin archive local path or a URL of the plugin archive to be uploaded.
 * The plugin will be downloaded by the manager.
 * @param {ApiCallback} callback
 */
PluginsClient.prototype.upload = function(plugin, callback) {
    logger.trace('uploading plugin');
    var qs;
    if (typeof plugin === 'string') {
        qs = {plugin_archive_url: plugin};
    }

    return this.config.request({
        'method': 'POST',
        'json': true,
        'url': this.config.endpoint + '/plugins',
        'body': !qs && plugin,
        'qs': qs
    }, callback);
};

module.exports = PluginsClient;