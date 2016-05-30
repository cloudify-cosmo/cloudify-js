'use strict';
var logger = require('log4js').getLogger('cloudify.snapshots');


function SnapshotsClient(config){
    this.config = config;
}

/**
 * @description Lists all snapshots.
 * @param {ApiCallback} callback
 */
SnapshotsClient.prototype.list = function(callback) {
    logger.trace('listing snapshots');

    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': this.config.endpoint + '/snapshots'
    }, callback);
};

/**
 * @description Creates a new snapshot.
 * @param {string} snapshot_id - The id of the new snapshot.
 * @param include_metrics - Specifies whether metrics stored in InfluxDB should be included in the created snapshot.
 * It defaults to false.
 * @param include_credentials - Specifies whether agent SSH keys (including those specified in uploaded blueprints)
 * should be included in the created snapshot. It defaults to false.
 * @param {ApiCallback} callback
 */
SnapshotsClient.prototype.create = function(snapshot_id, include_metrics, include_credentials, callback) {
    logger.trace('creating snapshot');
    var qs = {};
    if (include_metrics) {
        qs.include_metrics = include_metrics;
    }
    if (include_credentials) {
        qs.include_credentials = include_credentials;
    }

    return this.config.request({
        'method': 'PUT',
        'json': true,
        'url': String.format(this.config.endpoint + '/snapshots/{0}', snapshot_id),
        'body': {},
        'qs': qs
    }, callback);
};

/**
 * @description Deletes an existing snapshot.
 * @param {string} snapshot_id - The id of the snapshot to be deleted.
 * @param {ApiCallback} callback
 */
SnapshotsClient.prototype.delete = function(snapshot_id, callback) {
    logger.trace('deleting snapshot');

    return this.config.request({
        'method': 'DELETE',
        'json': true,
        'url': String.format(this.config.endpoint + '/snapshots/{0}', snapshot_id)
    }, callback);
};

/**
 * @description Restores the specified snapshot on the manager.
 * @param {string} snapshot_id - The id of the snapshot to be restored.
 * @param force - Specifies whether to force restoring the snapshot on a manager that already contains
 * blueprints/deployments.
 * @param recreate_deployments_envs - Specifies whether deployment environments should be created for restored
 * deployments.
 * @param {ApiCallback} callback
 */
SnapshotsClient.prototype.restore = function(snapshot_id, force, recreate_deployments_envs, callback) {
    logger.trace('restoring snapshot');

    return this.config.request({
        'method': 'POST',
        'json': true,
        'url': String.format(this.config.endpoint + '/snapshots/{0}/restore', snapshot_id),
        'body': {
            'force': !!force,
            'recreate_deployments_envs': !!recreate_deployments_envs
        }
    }, callback);
};

/**
 *
 * @description Downloads an existing snapshot.
 * @param {string} snapshot_id - The id of the snapshot to be downloaded.
 * @param {ApiCallback} callback
 */
SnapshotsClient.prototype.download = function(snapshot_id, callback) {
    logger.trace('downloading snapshot');

    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': String.format(this.config.endpoint + '/snapshots/{0}/archive', snapshot_id)
    }, callback);
};

/**
 *
 * @description Uploads a snapshot to the Cloudify Manager. The call expects a application/octet-stream content type
 * where the content is a zip archive. It is possible to upload a snapshot from a URL by specifying the URL in the
 * snapshot_archive_url request body property.
 * @param snapshot_id - The id of the snapshot to be uploaded.
 * @param {(string|file)} snapshot - The snapshot archive local path or a URL of the snapshot archive to be uploaded.
 * The snapshot will be downloaded by the manager.
 * @param {ApiCallback} callback
 */
SnapshotsClient.prototype.upload = function(snapshot_id, snapshot, callback) {
    logger.trace('uploading snapshot');
    var qs;
    if (typeof snapshot === 'string') {
        qs = {snapshot_archive_url: snapshot};
    }

    return this.config.request({
        'method': 'PUT',
        'json': true,
        'url': String.format(this.config.endpoint + '/snapshots/{0}/archive', snapshot_id),
        'body': !qs && snapshot,
        'qs': qs
    }, callback);
};

module.exports = SnapshotsClient;
