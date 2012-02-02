var redis = require("redis"),
    util = require("util");

module.exports = function(gzippo) {
  var Store = gzippo.Store;

/**
 * gzippo-redis is a redis cache store for gzippo. Requires redis >= `1.3.10`
 *
 * Options:
 *
 *  -   `client` an exisiting redis client
 *  -   `host` - the redis server hostname
 *  -   `port` - the redis server port
 *  -   `db` - Database index to be used
 *  -   `pass` - Password for redis
 *  -   `prefix` - Key prefix defaulting to `gzippo:`
 *  -   The other options are passed to the redis `createClient()` methos
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

  function RedisStore(options) {
    options = options || {};
    Store.call(this, options);
    this.prefix = options.prefix === null ? 'gzippo:' : options.prefix;
    this.client = options.client || new redis.createClient(options.port || options.socket, options.host, options);
    if (options.pass) {
      this.client.auth(options.pass, function(err){
        if (err) throw err;
      });
    }

    if (options.db) {
      var self = this;
      self.client.select(options.db);
      self.client.on("connect", function() {
        self.client.send_anyways = true;
        self.client.select(options.db);
        self.client.send_anyways = false;
      });
    }
  }

  util.inherits(RedisStore, Store);

/**
 * get an asset to the RedisStore
 * @param {FileAsset} asset
 * @param {Function} cb
 * @api public
 */

  RedisStore.prototype.get = function(fileName, cb){
    fileName = this.prefix + fileName;
    this.client.get(sid, function(err, data){
      try {
        if (!data) return cb();
        cb(null, data);
      } catch (err) {
        cb(err);
      }
    });
  };

/**
 * Add an asset to the RedisStore
 * @param {FileAsset} asset
 * @param {Function} cb
 * @api public
 */

  RedisStore.prototype.set = function(asset, cb){
    var fileName = this.prefix + asset.name;
    try {
      var sess = JSON.stringify(sess);
      // Todo: Add lifetime for cached item, maybe on instantiation.
      this.client.setex(fileName, 86400, asset, function(){
        if(cb instanceof Function) cb.apply(this, arguments);
      });
    } catch (err) {
      if(cb instanceof Function) cb(err);
    }
  };

  /**
   * purge the an item from the RedisStore
   *
   * @param {FileAsset} asset
   * @param {Function} cb
   * @api public
   */

  RedisStore.prototype.purgeFile = function(asset, cb){
    var fileName = this.prefix + asset.fileName;
    this.client.del(fileName, cb);
  };

  return RedisStore;
};