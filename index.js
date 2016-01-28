'use strict';

let redis = require('redis');

module.exports = function (options) {
    options = options || {};
    let client = options.client ? options.client : (global[Symbol.for('__reddiz-client__')] || redis.createClient(options || {}));
    global[Symbol.for('__reddiz-client__')] = client;

    return {
        get: function (id) {
            return new Promise((resolve, reject) => {
                client.hgetall(id, (error, session) => {
                    if (error) {
                        reject(error);
                    } else if (session) {
                        try {
                            session.data = JSON.parse(session.data);
                            session.loaded = true;
                            session.timeout = +session.timeout || null;
                            resolve(session);
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        resolve(null);
                    }
                });
            });
        },

        set: function (id, data, timeout, time) {
            return new Promise((resolve, reject) => {
                id += '';
                time = +time || Date.now();

                let expire = timeout >= 0 && timeout !== null ? timeout : 7 * 86400,
                    session = {id, time, timeout, data: JSON.stringify(data)};

                client.multi()
                    .hmset(id, session)
                    .expire(id, expire)
                    .exec(error => {
                        if (error) {
                            reject(error);
                        } else {
                            session.data = data;
                            session.loaded = false;
                            resolve(session);
                        }
                    });
            });
        }
    };
};
