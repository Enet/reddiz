# reddiz
This module provides API to store sessions using redis database. There are only two easy methods: get and set. To process user request properly you need firstly read session, then probably change it and finally save changes.

## require('reddiz')(options<sup>{ }</sup>)
To use reddiz you need to require a module and call an imported function with options. These options just are passed to redis-client constructor (read more about available settings [here](https://github.com/NodeRedis/node_redis)). Now you are able to use reddiz.

You may want to use some crutches or hacks, when working with a redis-client. So keep in mind that one is available here:
```javascript
global[Symbol.for('__reddiz-client__')]
```

**returns reddiz<sup>{ }</sup>**

## get(id<sup>abc</sup>)
This method returns a promise and calls resolve-function with a session by id. Object of session contains the following fields:
+ **id** - session's identifier;
+ **time** - the time of the last update;
+ **data** - JSON-compatible object.

If session, having required id, is not found, null is passed to resolve.

**returns promise<sup>A+</sup>**

## set(id<sup>abc</sup>, data<sup>{ }</sup>, timeout<sup>123</sup>, time<sup>123</sup>)
This method returns a promise and calls resolve-function with a new session object. It gets the following parameters:
+ **id** - string unique identifier of a new session;
+ **data** - JSON-compatible object;
+ **timeout** - expiration time in redis (by default 7 * 86400 that is one week);
+ **time** - the time of the last update, which you are able to set manually (by default current time).

**returns promise<sup>A+</sup>**

## Usage example
Let's look at an easy example:
```javascript
'use strict';
let http = require('http'),
    reddiz = require('reddiz')(),
    oneDay = 24 * 3600;

http.createServer((request, response) => {
    let sessionId = request.url;

    function onError (error) {
        response.write('Something has gone wrong!\n');
        response.write(error + '');
        response.end();
    };

    function onSuccess (session) {
        response.write(session.data.counter + '');
        session.data.counter++;

        reddiz
            .set(session.id, session.data, oneDay)
            .then(session => {
                response.end();
            })
            .catch(onError);
    };

    reddiz
        .get(sessionId)
        .then(session => {
            if (session) {
                onSuccess(session);
            } else {
                reddiz
                    .set(sessionId, {counter: 0}, oneDay)
                    .then(onSuccess)
                    .catch(onError);
            }
        })
        .catch(onError);
}).listen(80);
```
Also there is [another example](https://github.com/Enet/demo-es2015), how to use reddiz in a real project.
