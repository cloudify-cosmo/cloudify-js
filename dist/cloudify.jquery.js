/*********
* Copyright (c) 2016 GigaSpaces Technologies Ltd. All rights reserved
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*        http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*********/
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// UMD HEADER START 
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
// UMD HEADER END

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }
  
  //BEGIN QS Hack
  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }
  
  if(options.qs){
    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
    if(options.uri.indexOf('?') !== -1){ //no get params
        options.uri = options.uri+'&'+qs;
    }else{ //existing get params
        options.uri = options.uri+'?'+qs;
    }
  }
  //END QS Hack
  
  //BEGIN FORM Hack
  var multipart = function(obj) {
    //todo: support file type (useful?)
    var result = {};
    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var lines = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            lines.push(
                '--'+result.boundry+"\n"+
                'Content-Disposition: form-data; name="'+p+'"'+"\n"+
                "\n"+
                obj[p]+"\n"
            );
        }
    }
    lines.push( '--'+result.boundry+'--' );
    result.body = lines.join('');
    result.length = result.body.length;
    result.type = 'multipart/form-data; boundary='+result.boundry;
    return result;
  }
  
  if(options.form){
    if(typeof options.form == 'string') throw('form name unsupported');
    if(options.method === 'POST'){
        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
        options.headers['content-type'] = encoding;
        switch(encoding){
            case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, "+");
                break;
            case 'multipart/form-data':
                var multi = multipart(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
            default : throw new Error('unsupported encoding:'+encoding);
        }
    }
  }
  //END FORM Hack

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// defaults
//

request.defaults = function(options, requester) {
  var def = function (method) {
    var d = function (params, callback) {
      if(typeof params === 'string')
        params = {'uri': params};
      else {
        params = JSON.parse(JSON.stringify(params));
      }
      for (var i in options) {
        if (params[i] === undefined) params[i] = options[i]
      }
      return method(params, callback)
    }
    return d
  }
  var de = def(request)
  de.get = def(request.get)
  de.post = def(request.post)
  de.put = def(request.put)
  de.head = def(request.head)
  return de
}

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}
    return request;
//UMD FOOTER START
}));
//UMD FOOTER END

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],5:[function(require,module,exports){
/* eslint-env browser */
module.exports = FormData;

},{}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],7:[function(require,module,exports){
"use strict";
var layouts = require('../layouts')
, consoleLog = console.log.bind(console);

function consoleAppender (layout, timezoneOffset) {
  layout = layout || layouts.colouredLayout;
  return function(loggingEvent) {
    consoleLog(layout(loggingEvent, timezoneOffset));
  };
}

function configure(config) {
  var layout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  return consoleAppender(layout, config.timezoneOffset);
}

exports.appender = consoleAppender;
exports.configure = configure;

},{"../layouts":10}],8:[function(require,module,exports){
"use strict";
var levels = require("./levels");
var DEFAULT_FORMAT = ':remote-addr - -' +
  ' ":method :url HTTP/:http-version"' +
  ' :status :content-length ":referrer"' +
  ' ":user-agent"';
/**
 * Log requests with the given `options` or a `format` string.
 *
 * Options:
 *
 *   - `format`        Format string, see below for tokens
 *   - `level`         A log4js levels instance. Supports also 'auto'
 *
 * Tokens:
 *
 *   - `:req[header]` ex: `:req[Accept]`
 *   - `:res[header]` ex: `:res[Content-Length]`
 *   - `:http-version`
 *   - `:response-time`
 *   - `:remote-addr`
 *   - `:date`
 *   - `:method`
 *   - `:url`
 *   - `:referrer`
 *   - `:user-agent`
 *   - `:status`
 *
 * @param {String|Function|Object} format or options
 * @return {Function}
 * @api public
 */

function getLogger(logger4js, options) {
	if ('object' == typeof options) {
		options = options || {};
	} else if (options) {
		options = { format: options };
	} else {
		options = {};
	}

	var thislogger = logger4js
  , level = levels.toLevel(options.level, levels.INFO)
  , fmt = options.format || DEFAULT_FORMAT
  , nolog = options.nolog ? createNoLogCondition(options.nolog) : null;

  return function (req, res, next) {
    // mount safety
    if (req._logging) return next();

		// nologs
		if (nolog && nolog.test(req.originalUrl)) return next();
		if (thislogger.isLevelEnabled(level) || options.level === 'auto') {

			var start = new Date()
			, statusCode
			, writeHead = res.writeHead
			, url = req.originalUrl;

			// flag as logging
			req._logging = true;

			// proxy for statusCode.
			res.writeHead = function(code, headers){
				res.writeHead = writeHead;
				res.writeHead(code, headers);
				res.__statusCode = statusCode = code;
				res.__headers = headers || {};

				//status code response level handling
				if(options.level === 'auto'){
					level = levels.INFO;
					if(code >= 300) level = levels.WARN;
					if(code >= 400) level = levels.ERROR;
				} else {
					level = levels.toLevel(options.level, levels.INFO);
				}
			};

			//hook on end request to emit the log entry of the HTTP request.
			res.on('finish', function() {
				res.responseTime = new Date() - start;
				//status code response level handling
				if(res.statusCode && options.level === 'auto'){
					level = levels.INFO;
					if(res.statusCode >= 300) level = levels.WARN;
					if(res.statusCode >= 400) level = levels.ERROR;
				}
				if (thislogger.isLevelEnabled(level)) {
          var combined_tokens = assemble_tokens(req, res, options.tokens || []);
					if (typeof fmt === 'function') {
						var line = fmt(req, res, function(str){ return format(str, combined_tokens); });
						if (line) thislogger.log(level, line);
					} else {
						thislogger.log(level, format(fmt, combined_tokens));
					}
				}
			});
		}

    //ensure next gets always called
    next();
  };
}

/**
 * Adds custom {token, replacement} objects to defaults,
 * overwriting the defaults if any tokens clash
 *
 * @param  {IncomingMessage} req
 * @param  {ServerResponse} res
 * @param  {Array} custom_tokens
 *    [{ token: string-or-regexp, replacement: string-or-replace-function }]
 * @return {Array}
 */
function assemble_tokens(req, res, custom_tokens) {
  var array_unique_tokens = function(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i].token == a[j].token) { // not === because token can be regexp object
          a.splice(j--, 1);
        }
      }
    }
    return a;
  };

  var default_tokens = [];
  default_tokens.push({ token: ':url', replacement: req.originalUrl });
  default_tokens.push({ token: ':protocol', replacement: req.protocol });
  default_tokens.push({ token: ':hostname', replacement: req.hostname });
  default_tokens.push({ token: ':method', replacement: req.method });
  default_tokens.push({ token: ':status', replacement: res.__statusCode || res.statusCode });
  default_tokens.push({ token: ':response-time', replacement: res.responseTime });
  default_tokens.push({ token: ':date', replacement: new Date().toUTCString() });
  default_tokens.push({
    token: ':referrer',
    replacement: req.headers.referer || req.headers.referrer || ''
  });
  default_tokens.push({
    token: ':http-version',
    replacement: req.httpVersionMajor + '.' + req.httpVersionMinor
  });
  default_tokens.push({
    token: ':remote-addr',
    replacement:
      req.headers['x-forwarded-for'] ||
      req.ip ||
      req._remoteAddress ||
      (req.socket &&
        (req.socket.remoteAddress ||
          (req.socket.socket && req.socket.socket.remoteAddress)
        )
      )
    }
  );
  default_tokens.push({ token: ':user-agent', replacement: req.headers['user-agent'] });
  default_tokens.push({
    token: ':content-length',
    replacement:
      (res._headers && res._headers['content-length']) ||
      (res.__headers && res.__headers['Content-Length']) ||
      '-'
    }
  );
  default_tokens.push({ token: /:req\[([^\]]+)\]/g, replacement: function(_, field) {
    return req.headers[field.toLowerCase()];
  } });
  default_tokens.push({ token: /:res\[([^\]]+)\]/g, replacement: function(_, field) {
    return res._headers ?
      (res._headers[field.toLowerCase()] || res.__headers[field])
      : (res.__headers && res.__headers[field]);
  } });

  return array_unique_tokens(custom_tokens.concat(default_tokens));
}

/**
 * Return formatted log line.
 *
 * @param  {String} str
 * @param  {IncomingMessage} req
 * @param  {ServerResponse} res
 * @return {String}
 * @api private
 */

function format(str, tokens) {
  for (var i = 0; i < tokens.length; i++) {
    str = str.replace(tokens[i].token, tokens[i].replacement);
  }
  return str;
}

/**
 * Return RegExp Object about nolog
 *
 * @param  {String} nolog
 * @return {RegExp}
 * @api private
 *
 * syntax
 *  1. String
 *   1.1 "\\.gif"
 *         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.gif?fuga
 *         LOGGING http://example.com/hoge.agif
 *   1.2 in "\\.gif|\\.jpg$"
 *         NOT LOGGING http://example.com/hoge.gif and
 *           http://example.com/hoge.gif?fuga and http://example.com/hoge.jpg?fuga
 *         LOGGING http://example.com/hoge.agif,
 *           http://example.com/hoge.ajpg and http://example.com/hoge.jpg?hoge
 *   1.3 in "\\.(gif|jpe?g|png)$"
 *         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.jpeg
 *         LOGGING http://example.com/hoge.gif?uid=2 and http://example.com/hoge.jpg?pid=3
 *  2. RegExp
 *   2.1 in /\.(gif|jpe?g|png)$/
 *         SAME AS 1.3
 *  3. Array
 *   3.1 ["\\.jpg$", "\\.png", "\\.gif"]
 *         SAME AS "\\.jpg|\\.png|\\.gif"
 */
function createNoLogCondition(nolog) {
  var regexp = null;

	if (nolog) {
    if (nolog instanceof RegExp) {
      regexp = nolog;
    }

    if (typeof nolog === 'string') {
      regexp = new RegExp(nolog);
    }

    if (Array.isArray(nolog)) {
      var regexpsAsStrings = nolog.map(
        function convertToStrings(o) {
          return o.source ? o.source : o;
        }
      );
      regexp = new RegExp(regexpsAsStrings.join('|'));
    }
  }

  return regexp;
}

exports.connectLogger = getLogger;

},{"./levels":11}],9:[function(require,module,exports){
"use strict";
exports.ISO8601_FORMAT = "yyyy-MM-dd hh:mm:ss.SSS";
exports.ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ssO";
exports.DATETIME_FORMAT = "dd MM yyyy hh:mm:ss.SSS";
exports.ABSOLUTETIME_FORMAT = "hh:mm:ss.SSS";

function padWithZeros(vNumber, width) {
  var numAsString = vNumber + "";
  while (numAsString.length < width) {
    numAsString = "0" + numAsString;
  }
  return numAsString;
}

function addZero(vNumber) {
  return padWithZeros(vNumber, 2);
}

/**
 * Formats the TimeOffest
 * Thanks to http://www.svendtofte.com/code/date_format/
 * @private
 */
function offset(timezoneOffset) {
  // Difference to Greenwich time (GMT) in hours
  var os = Math.abs(timezoneOffset);
  var h = String(Math.floor(os/60));
  var m = String(os%60);
  if (h.length == 1) {
    h = "0" + h;
  }
  if (m.length == 1) {
    m = "0" + m;
  }
  return timezoneOffset < 0 ? "+"+h+m : "-"+h+m;
}

exports.asString = function(/*format,*/ date, timezoneOffset) {
  /*jshint -W071 */
  var format = exports.ISO8601_FORMAT;
  if (typeof(date) === "string") {
    format = arguments[0];
    date = arguments[1];
    timezoneOffset = arguments[2];
  }
  // make the date independent of the system timezone by working with UTC
  if (timezoneOffset === undefined) {
    timezoneOffset = date.getTimezoneOffset();
  }
  date.setUTCMinutes(date.getUTCMinutes() - timezoneOffset);
  var vDay = addZero(date.getUTCDate());
  var vMonth = addZero(date.getUTCMonth()+1);
  var vYearLong = addZero(date.getUTCFullYear());
  var vYearShort = addZero(date.getUTCFullYear().toString().substring(2,4));
  var vYear = (format.indexOf("yyyy") > -1 ? vYearLong : vYearShort);
  var vHour  = addZero(date.getUTCHours());
  var vMinute = addZero(date.getUTCMinutes());
  var vSecond = addZero(date.getUTCSeconds());
  var vMillisecond = padWithZeros(date.getUTCMilliseconds(), 3);
  var vTimeZone = offset(timezoneOffset);
  date.setUTCMinutes(date.getUTCMinutes() + timezoneOffset);
  var formatted = format
    .replace(/dd/g, vDay)
    .replace(/MM/g, vMonth)
    .replace(/y{1,4}/g, vYear)
    .replace(/hh/g, vHour)
    .replace(/mm/g, vMinute)
    .replace(/ss/g, vSecond)
    .replace(/SSS/g, vMillisecond)
    .replace(/O/g, vTimeZone);
  return formatted;

};
/*jshint +W071 */

},{}],10:[function(require,module,exports){
(function (process){
"use strict";
var dateFormat = require('./date_format')
, os = require('os')
, eol = os.EOL || '\n'
, util = require('util')
, replacementRegExp = /%[sdj]/g
, layoutMakers = {
  "messagePassThrough": function() { return messagePassThroughLayout; },
  "basic": function() { return basicLayout; },
  "colored": function() { return colouredLayout; },
  "coloured": function() { return colouredLayout; },
  "pattern": function (config) {
    return patternLayout(config && config.pattern, config && config.tokens);
	},
  "dummy": function() { return dummyLayout; }
}
, colours = {
  ALL: "grey",
  TRACE: "blue",
  DEBUG: "cyan",
  INFO: "green",
  WARN: "yellow",
  ERROR: "red",
  FATAL: "magenta",
  OFF: "grey"
};

function wrapErrorsWithInspect(items) {
  return items.map(function(item) {
    if ((item instanceof Error) && item.stack) {
      return { inspect: function() { return util.format(item) + '\n' + item.stack; } };
    } else {
      return item;
    }
  });
}

function formatLogData(logData) {
  var data = Array.isArray(logData) ? logData : Array.prototype.slice.call(arguments);
  return util.format.apply(util, wrapErrorsWithInspect(data));
}

var styles = {
    //styles
  'bold'      : [1,  22],
  'italic'    : [3,  23],
  'underline' : [4,  24],
  'inverse'   : [7,  27],
  //grayscale
  'white'     : [37, 39],
  'grey'      : [90, 39],
  'black'     : [90, 39],
  //colors
  'blue'      : [34, 39],
  'cyan'      : [36, 39],
  'green'     : [32, 39],
  'magenta'   : [35, 39],
  'red'       : [31, 39],
  'yellow'    : [33, 39]
};

function colorizeStart(style) {
  return style ? '\x1B[' + styles[style][0] + 'm' : '';
}
function colorizeEnd(style) {
  return style ? '\x1B[' + styles[style][1] + 'm' : '';
}
/**
 * Taken from masylum's fork (https://github.com/masylum/log4js-node)
 */
function colorize (str, style) {
  return colorizeStart(style) + str + colorizeEnd(style);
}

function timestampLevelAndCategory(loggingEvent, colour, timezoneOffest) {
  var output = colorize(
    formatLogData(
      '[%s] [%s] %s - '
      , dateFormat.asString(loggingEvent.startTime, timezoneOffest)
      , loggingEvent.level
      , loggingEvent.categoryName
    )
    , colour
  );
  return output;
}

/**
 * BasicLayout is a simple layout for storing the logs. The logs are stored
 * in following format:
 * <pre>
 * [startTime] [logLevel] categoryName - message\n
 * </pre>
 *
 * @author Stephan Strittmatter
 */
function basicLayout (loggingEvent, timezoneOffset) {
  return timestampLevelAndCategory(
    loggingEvent,
    undefined,
    timezoneOffset
  ) + formatLogData(loggingEvent.data);
}

/**
 * colouredLayout - taken from masylum's fork.
 * same as basicLayout, but with colours.
 */
function colouredLayout (loggingEvent, timezoneOffset) {
  return timestampLevelAndCategory(
    loggingEvent,
    colours[loggingEvent.level.toString()],
    timezoneOffset
  ) + formatLogData(loggingEvent.data);
}

function messagePassThroughLayout (loggingEvent) {
  return formatLogData(loggingEvent.data);
}

function dummyLayout(loggingEvent) {
  return loggingEvent.data[0];
}

/**
 * PatternLayout
 * Format for specifiers is %[padding].[truncation][field]{[format]}
 * e.g. %5.10p - left pad the log level by 5 characters, up to a max of 10
 * Fields can be any of:
 *  - %r time in toLocaleTimeString format
 *  - %p log level
 *  - %c log category
 *  - %h hostname
 *  - %m log data
 *  - %d date in various formats
 *  - %% %
 *  - %n newline
 *  - %z pid
 *  - %x{<tokenname>} add dynamic tokens to your log. Tokens are specified in the tokens parameter
 * You can use %[ and %] to define a colored block.
 *
 * Tokens are specified as simple key:value objects.
 * The key represents the token name whereas the value can be a string or function
 * which is called to extract the value to put in the log message. If token is not
 * found, it doesn't replace the field.
 *
 * A sample token would be: { "pid" : function() { return process.pid; } }
 *
 * Takes a pattern string, array of tokens and returns a layout function.
 * @param {String} Log format pattern String
 * @param {object} map object of different tokens
 * @param {number} timezone offset in minutes
 * @return {Function}
 * @author Stephan Strittmatter
 * @author Jan Schmidle
 */
function patternLayout (pattern, tokens, timezoneOffset) {
  // jshint maxstatements:22
  var TTCC_CONVERSION_PATTERN  = "%r %p %c - %m%n";
  var regex = /%(-?[0-9]+)?(\.?[0-9]+)?([\[\]cdhmnprzxy%])(\{([^\}]+)\})?|([^%]+)/;

  pattern = pattern || TTCC_CONVERSION_PATTERN;

  function categoryName(loggingEvent, specifier) {
    var loggerName = loggingEvent.categoryName;
    if (specifier) {
      var precision = parseInt(specifier, 10);
      var loggerNameBits = loggerName.split(".");
      if (precision < loggerNameBits.length) {
        loggerName = loggerNameBits.slice(loggerNameBits.length - precision).join(".");
      }
    }
    return loggerName;
  }

  function formatAsDate(loggingEvent, specifier) {
    var format = dateFormat.ISO8601_FORMAT;
    if (specifier) {
      format = specifier;
      // Pick up special cases
      if (format == "ISO8601") {
        format = dateFormat.ISO8601_FORMAT;
      } else if (format == "ISO8601_WITH_TZ_OFFSET") {
        format = dateFormat.ISO8601_WITH_TZ_OFFSET_FORMAT;
      } else if (format == "ABSOLUTE") {
        format = dateFormat.ABSOLUTETIME_FORMAT;
      } else if (format == "DATE") {
        format = dateFormat.DATETIME_FORMAT;
      }
    }
    // Format the date
    return dateFormat.asString(format, loggingEvent.startTime, timezoneOffset);
  }

  function hostname() {
    return os.hostname().toString();
  }

  function formatMessage(loggingEvent) {
    return formatLogData(loggingEvent.data);
  }

  function endOfLine() {
    return eol;
  }

  function logLevel(loggingEvent) {
    return loggingEvent.level.toString();
  }

  function startTime(loggingEvent) {
    return dateFormat.asString('hh:mm:ss', loggingEvent.startTime, timezoneOffset);
  }

  function startColour(loggingEvent) {
    return colorizeStart(colours[loggingEvent.level.toString()]);
  }

  function endColour(loggingEvent) {
    return colorizeEnd(colours[loggingEvent.level.toString()]);
  }

  function percent() {
    return '%';
  }

  function pid(loggingEvent) {
    if (loggingEvent && loggingEvent.pid) {
      return loggingEvent.pid;
    } else {
      return process.pid;
    }
  }

  function clusterInfo(loggingEvent, specifier) {
    if (loggingEvent.cluster && specifier) {
      return specifier
        .replace('%m', loggingEvent.cluster.master)
        .replace('%w', loggingEvent.cluster.worker)
        .replace('%i', loggingEvent.cluster.workerId);
    } else if (loggingEvent.cluster) {
      return loggingEvent.cluster.worker+'@'+loggingEvent.cluster.master;
    } else {
      return pid();
    }
  }

  function userDefined(loggingEvent, specifier) {
    if (typeof(tokens[specifier]) !== 'undefined') {
      if (typeof(tokens[specifier]) === 'function') {
        return tokens[specifier](loggingEvent);
      } else {
        return tokens[specifier];
      }
    }
    return null;
  }

  var replacers = {
    'c': categoryName,
    'd': formatAsDate,
    'h': hostname,
    'm': formatMessage,
    'n': endOfLine,
    'p': logLevel,
    'r': startTime,
    '[': startColour,
    ']': endColour,
    'y': clusterInfo,
    'z': pid,
    '%': percent,
    'x': userDefined
  };

  function replaceToken(conversionCharacter, loggingEvent, specifier) {
    return replacers[conversionCharacter](loggingEvent, specifier);
  }

  function truncate(truncation, toTruncate) {
    var len;
    if (truncation) {
      len = parseInt(truncation.substr(1), 10);
      return toTruncate.substring(0, len);
    }

    return toTruncate;
  }

  function pad(padding, toPad) {
    var len;
    if (padding) {
      if (padding.charAt(0) == "-") {
        len = parseInt(padding.substr(1), 10);
        // Right pad with spaces
        while (toPad.length < len) {
          toPad += " ";
        }
      } else {
        len = parseInt(padding, 10);
        // Left pad with spaces
        while (toPad.length < len) {
          toPad = " " + toPad;
        }
      }
    }
    return toPad;
  }

  function truncateAndPad(toTruncAndPad, truncation, padding) {
    var replacement = toTruncAndPad;
    replacement = truncate(truncation, replacement);
    replacement = pad(padding, replacement);
    return replacement;
  }

  return function(loggingEvent) {
    var formattedString = "";
    var result;
    var searchString = pattern;

    while ((result = regex.exec(searchString))) {
      var matchedString = result[0];
      var padding = result[1];
      var truncation = result[2];
      var conversionCharacter = result[3];
      var specifier = result[5];
      var text = result[6];

      // Check if the pattern matched was just normal text
      if (text) {
        formattedString += "" + text;
      } else {
        // Create a raw replacement string based on the conversion
        // character and specifier
        var replacement = replaceToken(conversionCharacter, loggingEvent, specifier);
        formattedString += truncateAndPad(replacement, truncation, padding);
      }
      searchString = searchString.substr(result.index + result[0].length);
    }
    return formattedString;
  };

}

module.exports = {
  basicLayout: basicLayout,
  messagePassThroughLayout: messagePassThroughLayout,
  patternLayout: patternLayout,
  colouredLayout: colouredLayout,
  coloredLayout: colouredLayout,
  dummyLayout: dummyLayout,
  addLayout: function(name, serializerGenerator) {
    layoutMakers[name] = serializerGenerator;
  },
  layout: function(name, config) {
    return layoutMakers[name] && layoutMakers[name](config);
  }
};

}).call(this,require('_process'))
},{"./date_format":9,"_process":15,"os":2,"util":17}],11:[function(require,module,exports){
"use strict";

function Level(level, levelStr) {
  this.level = level;
  this.levelStr = levelStr;
}

/**
 * converts given String to corresponding Level
 * @param {String} sArg String value of Level OR Log4js.Level
 * @param {Log4js.Level} defaultLevel default Level, if no String representation
 * @return Level object
 * @type Log4js.Level
 */
function toLevel(sArg, defaultLevel) {
  if (!sArg) {
    return defaultLevel;
  }
  if (typeof sArg === "string") {
    return module.exports[sArg.toUpperCase()] || defaultLevel;
  }
  return toLevel(sArg.toString());
}

Level.prototype.toString = function() {
  return this.levelStr;
};

Level.prototype.isLessThanOrEqualTo = function(otherLevel) {
  if (typeof otherLevel === "string") {
    otherLevel = toLevel(otherLevel);
  }
  return this.level <= otherLevel.level;
};

Level.prototype.isGreaterThanOrEqualTo = function(otherLevel) {
  if (typeof otherLevel === "string") {
    otherLevel = toLevel(otherLevel);
  }
  return this.level >= otherLevel.level;
};

Level.prototype.isEqualTo = function(otherLevel) {
  if (typeof otherLevel == "string") {
    otherLevel = toLevel(otherLevel);
  }
  return this.level === otherLevel.level;
};

module.exports = {
  ALL: new Level(Number.MIN_VALUE, "ALL"),
  TRACE: new Level(5000, "TRACE"),
  DEBUG: new Level(10000, "DEBUG"),
  INFO: new Level(20000, "INFO"),
  WARN: new Level(30000, "WARN"),
  ERROR: new Level(40000, "ERROR"),
  FATAL: new Level(50000, "FATAL"),
  MARK: new Level(9007199254740992, "MARK"), // 2^53
  OFF: new Level(Number.MAX_VALUE, "OFF"),
  toLevel: toLevel
};

},{}],12:[function(require,module,exports){
(function (process){
"use strict";
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview log4js is a library to log in JavaScript in similar manner
 * than in log4j for Java. The API should be nearly the same.
 *
 * <h3>Example:</h3>
 * <pre>
 *  var logging = require('log4js');
 *  //add an appender that logs all messages to stdout.
 *  logging.addAppender(logging.consoleAppender());
 *  //add an appender that logs "some-category" to a file
 *  logging.addAppender(logging.fileAppender("file.log"), "some-category");
 *  //get a logger
 *  var log = logging.getLogger("some-category");
 *  log.setLevel(logging.levels.TRACE); //set the Level
 *
 *  ...
 *
 *  //call the log
 *  log.trace("trace me" );
 * </pre>
 *
 * NOTE: the authors below are the original browser-based log4js authors
 * don't try to contact them about bugs in this version :)
 * @version 1.0
 * @author Stephan Strittmatter - http://jroller.com/page/stritti
 * @author Seth Chisamore - http://www.chisamore.com
 * @since 2005-05-20
 * @static
 * Website: http://log4js.berlios.de
 */
var events = require('events')
, fs = require('fs')
, path = require('path')
, util = require('util')
, layouts = require('./layouts')
, levels = require('./levels')
, loggerModule = require('./logger')
, LoggingEvent = loggerModule.LoggingEvent
, Logger = loggerModule.Logger
, ALL_CATEGORIES = '[all]'
, appenders = {}
, loggers = {}
, appenderMakers = {}
, appenderShutdowns = {}
, defaultConfig =   {
  appenders: [
    { type: "console" }
  ],
  replaceConsole: false
};

require('./appenders/console');

function hasLogger(logger) {
  return loggers.hasOwnProperty(logger);
}


function getBufferedLogger(categoryName) {
    var base_logger = getLogger(categoryName);
    var logger = {};
    logger.temp = [];
    logger.target = base_logger;
    logger.flush = function () {
        for (var i = 0; i < logger.temp.length; i++) {
            var log = logger.temp[i];
            logger.target[log.level](log.message);
            delete logger.temp[i];
        }
    };
    logger.trace = function (message) { logger.temp.push({level: 'trace', message: message}); };
    logger.debug = function (message) { logger.temp.push({level: 'debug', message: message}); };
    logger.info = function (message) { logger.temp.push({level: 'info', message: message}); };
    logger.warn = function (message) { logger.temp.push({level: 'warn', message: message}); };
    logger.error = function (message) { logger.temp.push({level: 'error', message: message}); };
    logger.fatal = function (message) { logger.temp.push({level: 'fatal', message: message}); };

    return logger;
}

function normalizeCategory (category) {
  return  category + '.';
}

function doesLevelEntryContainsLogger (levelCategory, loggerCategory) {
  var normalizedLevelCategory = normalizeCategory(levelCategory);
  var normalizedLoggerCategory = normalizeCategory(loggerCategory);
  return normalizedLoggerCategory.substring(0, normalizedLevelCategory.length) == normalizedLevelCategory; //jshint ignore:line
}

function doesAppenderContainsLogger (appenderCategory, loggerCategory) {
  var normalizedAppenderCategory = normalizeCategory(appenderCategory);
  var normalizedLoggerCategory = normalizeCategory(loggerCategory);
  return normalizedLoggerCategory.substring(0, normalizedAppenderCategory.length) == normalizedAppenderCategory; //jshint ignore:line
}


/**
 * Get a logger instance. Instance is cached on categoryName level.
 * @param  {String} categoryName name of category to log to.
 * @return {Logger} instance of logger for the category
 * @static
 */
function getLogger (loggerCategoryName) {

  // Use default logger if categoryName is not specified or invalid
  if (typeof loggerCategoryName !== "string") {
    loggerCategoryName = Logger.DEFAULT_CATEGORY;
  }

  if (!hasLogger(loggerCategoryName)) {

    var level;

    /* jshint -W073 */
    // If there's a "levels" entry in the configuration
    if (levels.config) {
      // Goes through the categories in the levels configuration entry,
      // starting with the "higher" ones.
      var keys = Object.keys(levels.config).sort();
      for (var idx = 0; idx < keys.length; idx++) {
        var levelCategory = keys[idx];
        if (doesLevelEntryContainsLogger(levelCategory, loggerCategoryName)) {
          // level for the logger
          level = levels.config[levelCategory];
        }
      }
    }
    /* jshint +W073 */

    // Create the logger for this name if it doesn't already exist
    loggers[loggerCategoryName] = new Logger(loggerCategoryName, level);

    /* jshint -W083 */
    var appenderList;
    for(var appenderCategory in appenders) {
      if (doesAppenderContainsLogger(appenderCategory, loggerCategoryName)) {
        appenderList = appenders[appenderCategory];
        appenderList.forEach(function(appender) {
          loggers[loggerCategoryName].addListener("log", appender);
        });
      }
    }
    /* jshint +W083 */

    if (appenders[ALL_CATEGORIES]) {
      appenderList = appenders[ALL_CATEGORIES];
      appenderList.forEach(function(appender) {
        loggers[loggerCategoryName].addListener("log", appender);
      });
    }
  }

  return loggers[loggerCategoryName];
}

/**
 * args are appender, then zero or more categories
 */
function addAppender () {
  var args = Array.prototype.slice.call(arguments);
  var appender = args.shift();
  if (args.length === 0 || args[0] === undefined) {
    args = [ ALL_CATEGORIES ];
  }
  //argument may already be an array
  if (Array.isArray(args[0])) {
    args = args[0];
  }

  args.forEach(function(appenderCategory) {
    addAppenderToCategory(appender, appenderCategory);

    if (appenderCategory === ALL_CATEGORIES) {
      addAppenderToAllLoggers(appender);
    } else {

      for(var loggerCategory in loggers) {
        if (doesAppenderContainsLogger(appenderCategory,loggerCategory)) {
          loggers[loggerCategory].addListener("log", appender);
        }
      }

    }
  });
}

function addAppenderToAllLoggers(appender) {
  for (var logger in loggers) {
    if (hasLogger(logger)) {
      loggers[logger].addListener("log", appender);
    }
  }
}

function addAppenderToCategory(appender, category) {
  if (!appenders[category]) {
    appenders[category] = [];
  }
  appenders[category].push(appender);
}

function clearAppenders () {
  appenders = {};
  for (var logger in loggers) {
    if (hasLogger(logger)) {
      loggers[logger].removeAllListeners("log");
    }
  }
}

function configureAppenders(appenderList, options) {
  clearAppenders();
  if (appenderList) {
    appenderList.forEach(function(appenderConfig) {
      loadAppender(appenderConfig.type);
      var appender;
      appenderConfig.makers = appenderMakers;
      try {
        appender = appenderMakers[appenderConfig.type](appenderConfig, options);
        addAppender(appender, appenderConfig.category);
      } catch(e) {
        throw new Error("log4js configuration problem for " + util.inspect(appenderConfig), e);
      }
    });
  }
}

function configureLevels(_levels) {
  levels.config = _levels; // Keep it so we can create loggers later using this cfg
  if (_levels) {
    var keys = Object.keys(levels.config).sort();
    for (var idx in keys) {
      var category = keys[idx];
      if(category === ALL_CATEGORIES) {
        setGlobalLogLevel(_levels[category]);
      }
      /* jshint -W073 */
      for(var loggerCategory in loggers) {
        if (doesLevelEntryContainsLogger(category, loggerCategory)) {
          loggers[loggerCategory].setLevel(_levels[category]);
        }
      }
      /* jshint +W073 */
    }
  }
}

function setGlobalLogLevel(level) {
  Logger.prototype.level = levels.toLevel(level, levels.TRACE);
}

/**
 * Get the default logger instance.
 * @return {Logger} instance of default logger
 * @static
 */
function getDefaultLogger () {
  return getLogger(Logger.DEFAULT_CATEGORY);
}

var configState = {};

function loadConfigurationFile(filename) {
  if (filename) {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
  }
  return undefined;
}

function configureOnceOff(config, options) {
  if (config) {
    try {
      configureLevels(config.levels);
      configureAppenders(config.appenders, options);

      if (config.replaceConsole) {
        replaceConsole();
      } else {
        restoreConsole();
      }
    } catch (e) {
      throw new Error(
        "Problem reading log4js config " + util.inspect(config) +
          ". Error was \"" + e.message + "\" (" + e.stack + ")"
      );
    }
  }
}

function reloadConfiguration(options) {
  var mtime = getMTime(configState.filename);
  if (!mtime) return;

  if (configState.lastMTime && (mtime.getTime() > configState.lastMTime.getTime())) {
    configureOnceOff(loadConfigurationFile(configState.filename), options);
  }
  configState.lastMTime = mtime;
}

function getMTime(filename) {
  var mtime;
  try {
    mtime = fs.statSync(configState.filename).mtime;
  } catch (e) {
    getLogger('log4js').warn('Failed to load configuration file ' + filename);
  }
  return mtime;
}

function initReloadConfiguration(filename, options) {
  if (configState.timerId) {
    clearInterval(configState.timerId);
    delete configState.timerId;
  }
  configState.filename = filename;
  configState.lastMTime = getMTime(filename);
  configState.timerId = setInterval(reloadConfiguration, options.reloadSecs*1000, options);
}

function configure(configurationFileOrObject, options) {
  var config = configurationFileOrObject;
  config = config || process.env.LOG4JS_CONFIG;
  options = options || {};

  if (config === undefined || config === null || typeof(config) === 'string') {
    if (options.reloadSecs) {
      initReloadConfiguration(config, options);
    }
    config = loadConfigurationFile(config) || defaultConfig;
  } else {
    if (options.reloadSecs) {
      getLogger('log4js').warn(
        'Ignoring configuration reload parameter for "object" configuration.'
      );
    }
  }
  configureOnceOff(config, options);
}

var originalConsoleFunctions = {
  log: console.log,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error
};

function replaceConsole(logger) {
  function replaceWith(fn) {
    return function() {
      fn.apply(logger, arguments);
    };
  }
  logger = logger || getLogger("console");
  ['log','debug','info','warn','error'].forEach(function (item) {
    console[item] = replaceWith(item === 'log' ? logger.info : logger[item]);
  });
}

function restoreConsole() {
  ['log', 'debug', 'info', 'warn', 'error'].forEach(function (item) {
    console[item] = originalConsoleFunctions[item];
  });
}

/**
 * Load an appenderModule based on the provided appender filepath. Will first
 * check if the appender path is a subpath of the log4js "lib/appenders" directory.
 * If not, it will attempt to load the the appender as complete path.
 *
 * @param {string} appender The filepath for the appender.
 * @returns {Object|null} The required appender or null if appender could not be loaded.
 * @private
 */
function requireAppender(appender) {
  var appenderModule;
  try {
    appenderModule = require('./appenders/' + appender);
  } catch (e) {
    appenderModule = require(appender);
  }
  return appenderModule;
}

/**
 * Load an appender. Provided the appender path to be loaded. If appenderModule is defined,
 * it will be used in place of requiring the appender module.
 *
 * @param {string} appender The path to the appender module.
 * @param {Object|void} [appenderModule] The pre-required appender module. When provided,
 * instead of requiring the appender by its path, this object will be used.
 * @returns {void}
 * @private
 */
function loadAppender(appender, appenderModule) {
  appenderModule = appenderModule || requireAppender(appender);

  if (!appenderModule) {
    throw new Error("Invalid log4js appender: " + util.inspect(appender));
  }

  module.exports.appenders[appender] = appenderModule.appender.bind(appenderModule);
  if (appenderModule.shutdown) {
    appenderShutdowns[appender] = appenderModule.shutdown.bind(appenderModule);
  }
  appenderMakers[appender] = appenderModule.configure.bind(appenderModule);
}

/**
 * Shutdown all log appenders. This will first disable all writing to appenders
 * and then call the shutdown function each appender.
 *
 * @params {Function} cb - The callback to be invoked once all appenders have
 *  shutdown. If an error occurs, the callback will be given the error object
 *  as the first argument.
 * @returns {void}
 */
function shutdown(cb) {
  // First, disable all writing to appenders. This prevents appenders from
  // not being able to be drained because of run-away log writes.
  loggerModule.disableAllLogWrites();

  // Call each of the shutdown functions in parallel
  var completed = 0;
  var error;
  var shutdownFcts = [];
  var complete = function(err) {
    error = error || err;
    completed++;
    if (completed >= shutdownFcts.length) {
      cb(error);
    }
  };
  for (var category in appenderShutdowns) {
    if (appenderShutdowns.hasOwnProperty(category)) {
      shutdownFcts.push(appenderShutdowns[category]);
    }
  }
  if (!shutdownFcts.length) {
    return cb();
  }
  shutdownFcts.forEach(function(shutdownFct) { shutdownFct(complete); });
}

module.exports = {
  getBufferedLogger: getBufferedLogger,
  getLogger: getLogger,
  getDefaultLogger: getDefaultLogger,
  hasLogger: hasLogger,

  addAppender: addAppender,
  loadAppender: loadAppender,
  clearAppenders: clearAppenders,
  configure: configure,
  shutdown: shutdown,

  replaceConsole: replaceConsole,
  restoreConsole: restoreConsole,

  levels: levels,
  setGlobalLogLevel: setGlobalLogLevel,

  layouts: layouts,
  appenders: {},
  appenderMakers: appenderMakers,
  connectLogger: require('./connect-logger').connectLogger
};

//set ourselves up
configure();

}).call(this,require('_process'))
},{"./appenders/console":7,"./connect-logger":8,"./layouts":10,"./levels":11,"./logger":13,"_process":15,"events":4,"fs":3,"path":14,"util":17}],13:[function(require,module,exports){
"use strict";
var levels = require('./levels')
, util = require('util')
, events = require('events')
, DEFAULT_CATEGORY = '[default]';

var logWritesEnabled = true;

/**
 * Models a logging event.
 * @constructor
 * @param {String} categoryName name of category
 * @param {Log4js.Level} level level of message
 * @param {Array} data objects to log
 * @param {Log4js.Logger} logger the associated logger
 * @author Seth Chisamore
 */
function LoggingEvent (categoryName, level, data, logger) {
  this.startTime = new Date();
  this.categoryName = categoryName;
  this.data = data;
  this.level = level;
  this.logger = logger;
}

/**
 * Logger to log messages.
 * use {@see Log4js#getLogger(String)} to get an instance.
 * @constructor
 * @param name name of category to log to
 * @author Stephan Strittmatter
 */
function Logger (name, level) {
  this.category = name || DEFAULT_CATEGORY;

  if (level) {
    this.setLevel(level);
  }
}
util.inherits(Logger, events.EventEmitter);
Logger.DEFAULT_CATEGORY = DEFAULT_CATEGORY;
Logger.prototype.level = levels.TRACE;

Logger.prototype.setLevel = function(level) {
  this.level = levels.toLevel(level, this.level || levels.TRACE);
};

Logger.prototype.removeLevel = function() {
  delete this.level;
};

Logger.prototype.log = function() {
  var logLevel = levels.toLevel(arguments[0], levels.INFO);
  if (!this.isLevelEnabled(logLevel)) {
    return;
  }
  var numArgs = arguments.length - 1;
  var args = new Array(numArgs);
  for (var i = 0; i < numArgs; i++) {
    args[i] = arguments[i + 1];
  }
  this._log(logLevel, args);
};

Logger.prototype.isLevelEnabled = function(otherLevel) {
  return this.level.isLessThanOrEqualTo(otherLevel);
};

['Trace','Debug','Info','Warn','Error','Fatal', 'Mark'].forEach(
  function(levelString) {
    var level = levels.toLevel(levelString);
    Logger.prototype['is'+levelString+'Enabled'] = function() {
      return this.isLevelEnabled(level);
    };

    Logger.prototype[levelString.toLowerCase()] = function () {
      if (logWritesEnabled && this.isLevelEnabled(level)) {
        var numArgs = arguments.length;
        var args = new Array(numArgs);
        for (var i = 0; i < numArgs; i++) {
          args[i] = arguments[i];
        }
        this._log(level, args);
      }
    };
  }
);

Logger.prototype._log = function(level, data) {
  var loggingEvent = new LoggingEvent(this.category, level, data, this);
  this.emit('log', loggingEvent);
};

/**
 * Disable all log writes.
 * @returns {void}
 */
function disableAllLogWrites() {
  logWritesEnabled = false;
}

/**
 * Enable log writes.
 * @returns {void}
 */
function enableAllLogWrites() {
  logWritesEnabled = true;
}

exports.LoggingEvent = LoggingEvent;
exports.Logger = Logger;
exports.disableAllLogWrites = disableAllLogWrites;
exports.enableAllLogWrites = enableAllLogWrites;

},{"./levels":11,"events":4,"util":17}],14:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":15}],15:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],16:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],17:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":16,"_process":15,"inherits":6}],18:[function(require,module,exports){
'use strict';

var Client = require('./lib/client');
var request = require('browser-request');

var log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern:'[ %d ] [ %c ] :: %m'
            }
        }
    ]
});
var logger = log4js.getLogger('cloudify.angular');

/**
 * @param {ClientConfig} config
 */
$.CloudifyClient = function (config) {
    if (!config.request) {
        config.request = request;
    }
    return new Client(config);
};

logger.trace('cloudifyjs is ready for use');
},{"./lib/client":20,"browser-request":1,"log4js":12}],19:[function(require,module,exports){
'use strict';


var logger = require('log4js').getLogger('cloudify.blueprints');
/**
 * @typedef {object} BlueprintsClient~Blueprint
 *
 * @property {string} id The identifier of the blueprint
 * @property {number} created_at timestamp of blueprint creation
 * @property {object} the contents of the blueprint. plan Gets the plan the blueprints represents: nodes, relationships etc..
 */

/**
 * @description
 * collection of API calls for blueprints
 * @class BlueprintsClient
 * @param {ClientConfig} config
 * @constructor
 */
function BlueprintsClient( config ){
    this.config = config;
}

/**
 * @param {IncludeParam} [_include] list of fields to include in response
 * @param {ApiCallback} callback body gets a list of blueprints
 */
BlueprintsClient.prototype.list = function( _include, callback ){
    logger.trace('listing blueprints');
    var qs = {};
    if ( !!_include ){
        qs._include = _include;
    }
    return this.config.request( {
        'method' : 'GET',
        'json': true,
        'url' : this.config.endpoint + '/blueprints',
        'qs' : qs
    }, callback );
};

/**
 * @description
 * Gets  a bluprint by its id.
 * @param {string} blueprint_id Blueprint's id to get
 * @param {IncludeParam} [_include] List of fields to include in response
 * @param {ApiCallback} callback body gets the blueprint
 */
BlueprintsClient.prototype.get = function (blueprint_id, _include, callback) {
    logger.trace('getting blueprint by id');
    var qs = {};
    if (!!_include) {
        qs._include = _include;
    }

    return this.config.request({
            'method': 'GET',
            'json': true,
            'url': String.format(this.config.endpoint + '/blueprints/{0}', blueprint_id ),
            'qs': qs
        }, callback );
};

/**
 * @description Deltes the blueprint whose id matches the provided blueprint id.
 * @param {string} blueprint_id the id of the blueprint to be deleted
 * @param {ApiCallback} callback body gets the deleted blueprint
 */
BlueprintsClient.prototype.delete = function(blueprint_id, callback ){
    logger.trace('deleting blueprint');
    return this.config.request({
        'method' : 'DELETE',
        'json': true,
        'url' : String.format(this.config.endpoint + '/blueprints/{0}', blueprint_id )
    }, callback );
};

///// ONLY ADD FUNCTION THAT MIGHT NOT BE IMPLEMENTED FROM THIS POINT ON..

// ignore undefined variables.
/* jshint unused: false */
/**
 *
 * @description
 * uploads a blueprint to cloudify's manager.
 *
 * NOTE: currently only supports uploading from URL
 *
 *
 * Archive file should contain a single directory in which there is a
 * blueprint file named `blueprint_filename` (if `blueprint_filename`
 * is None, this value will be passed to the REST service where a
 * default value should be used).
 * Blueprint ID parameter is available for specifying the
 * blueprint's unique Id.

 *
 * @exception error if function is not implemented. not all clients implement this function.
 *
 * @param {string} [blueprint_path] url to blueprint
 * @param {string} blueprint_id id of the uploaded blueprint
 * @param {ApiCallback} callback body gets the uploaded blueprint
 */
// this is not upload. upload also packs
BlueprintsClient.prototype.publish_archive = function( blueprint_path , blueprint_id, blueprint_filename, callback ){
    logger.trace('getting blueprint by id');
    var qs = {  'blueprint_archive_url' : blueprint_path , 'application_file_name' : blueprint_filename};

    return this.config.request({
        'method': 'PUT',
        //'json': true, // guy - for some reason, in frontend it causes REST server to fail..
        'url': String.format(this.config.endpoint + '/blueprints/{0}', blueprint_id ),
        'qs': qs
    }, function(err, response, body){
        if ( typeof(body) === 'string' ){
            try{
                body = JSON.parse(body);
            }catch(e){

            }
            callback(err, response, body);
        }
    } );
};

/**
 *
 * @description
 * downloads aa previously uploaded blueprint from cloudify's manager.
 *
 * @param {string} blueprint_id
 * @param {string} output_file
 * @param {ApiCallback} callback body gets the path of downloaded  blueprint
 */
BlueprintsClient.prototype.download = function( blueprint_id, output_file, callback  ){
    logger.trace('downloading blueprint');
    throw new Error('this function is not implemented');
};

/**
 *
 * @description
 * browse a previously downloaded blueprint.
 *
 * @param {string} blueprint_id
 * @param {number} last_update
 * @param {ApiCallback} callback body gets the content of blueprint files tree
 */
BlueprintsClient.prototype.browse = function (blueprint_id, last_update, _include, callback) {
    logger.trace('browse blueprint');
    throw new Error('this function is not implemented');
};

/**
 *
 * @description
 * browse a specific file content from a downloaded blueprint.
 *
 * @param {string} blueprint_id
 * @param {string} file_path
 * @param {ApiCallback} callback body gets the content of blueprint files tree
 */
BlueprintsClient.prototype.browseFile = function (blueprint_id, file_path, _include, callback) {
    logger.trace('browse blueprint');
    throw new Error('this function is not implemented');
};


module.exports = BlueprintsClient;
},{"log4js":12}],20:[function(require,module,exports){
'use strict';


/**
 * @typedef {object}  CloudifyClient~ClientConfig
 * @property {string} endpoint the cloudify rest api endpoint. (e.g. http://manager-host-ip)
 * @property {object} authHeaders - header  as map of {key,value} for authentication implementation with cloudify. This object will be merged with request opts when a request is generated. they will override if key exists.
 * @property {object} [request] a request implementation. {@see https://www.npmjs.com/package/browser-request} . {@see https://www.npmjs.com/package/request}
 * frontend implementations will pass the browser version, and nodejs version should pass the node version.
 *
 *
 **/


var Blueprints = require('./blueprints');
var Events = require('./events');
var Deployments = require('./deployments');
var Plugins = require('./plugins');
var Executions = require('./executions');
var Manager = require('./manager');
var NodeInstances = require('./nodeInstances');
var Nodes = require('./nodes');
var Search = require('./search');
var Evaluate = require('./evaluate');
var Maintenance = require('./maintenance');
var DeploymentUpdates = require('./deploymentUpdates');
var Snapshots = require('./snapshots');
var ProviderContext = require('./providerContext');
/**
 *
 * @param {ClientConfig} config
 * @constructor CloudifyClient
 */
function Client( config ){

    // add security support. currently basic username/password support
    var origRequest = config.request;

    config.request = function( opts, callback ){
        opts.auth = config.cloudifyAuth;
        return origRequest(opts, callback);
    };

    this.config = config; // keep config

    this.blueprints = new Blueprints( config );
    this.events = new Events( config );
    this.deployments = new Deployments( config );
    this.plugins = new Plugins( config );
    this.executions = new Executions( config );
    this.manager = new Manager( config );
    this.nodeInstances = new NodeInstances( config );
    this.nodes = new Nodes( config );
    this.search = new Search( config );
    this.evaluate = new Evaluate( config );
    this.maintenance = new Maintenance( config );
    this.deploymentUpdates = new DeploymentUpdates( config );
    this.snapshots = new Snapshots( config );
    this.providerContext = new ProviderContext( config );
}

module.exports = Client;




/*****************************
 * Add 'format' message to String.
 ******************************/

String.format = function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        theString = theString.replace(regEx, arguments[i]);
    }

    return theString;
};
},{"./blueprints":19,"./deploymentUpdates":21,"./deployments":22,"./evaluate":23,"./events":24,"./executions":25,"./maintenance":26,"./manager":27,"./nodeInstances":28,"./nodes":29,"./plugins":30,"./providerContext":31,"./search":32,"./snapshots":33}],21:[function(require,module,exports){
'use strict';
var logger = require('log4js').getLogger('cloudify.deploymentUpdates');
var FormData = FormData || require('form-data');

function DeploymentUpdatesClient( config ){
    this.config = config;
}

DeploymentUpdatesClient.prototype.list = function(options, callback){
    logger.trace('listing deployment updates');
    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': this.config.endpoint + '/deployment-updates',
        'qs': options
    }, callback );
};

DeploymentUpdatesClient.prototype.get = function(updateId, callback){
    logger.trace('getting deployment update '+updateId);
    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': this.config.endpoint + '/deployment-updates/'+updateId
    }, callback );
};

/**
* @param {string} [deploymentId] deployment id to update
* @param {object | string} [archive] the new deployment archive / url to archive
* @param {string} [fileName] the blueprint.yaml file name within the archive
* @param {object} [executionOptions] should run a custom exection?
    * @param {string} [executionOptions.workflowId] the workflow id to execute on the changes
    * @param {boolean} [executionOptions.skipInstall] should not install added
    * @param {boolean} [executionOptions.skipUninstall] should not install removed
*/
DeploymentUpdatesClient.prototype.update = function (deploymentId, archive, inputs, fileName, executionOptions, callback) {
    logger.trace('updating deployment '+deploymentId);
    var json = true;
    var qs = {};
    var body = new FormData();
    if(typeof archive === 'string'){
        qs.blueprint_archive_url = archive;
    } else if(archive !== undefined){
        body.append('blueprint_archive', archive);
        json = false;
    }
    if(inputs !== undefined){
        body.append('inputs', inputs);
        json = false;
    }
    qs.application_file_name = fileName !== undefined ? fileName : undefined;
    if(typeof executionOptions === 'object'){
        if(executionOptions.workflowId !== undefined){
            qs.workflow_id = executionOptions.workflowId;
        } else{
            qs.skip_install = executionOptions.skipInstall;
            qs.skip_uninstall = executionOptions.skipUninstall;
        }
    }

    return this.config.request({
        'method': 'POST',
        'json': json,
        'url': this.config.endpoint + '/deployment-updates/'+deploymentId+'/update/initiate',
        'qs': qs,
        'body': body
    }, callback );
};

module.exports = DeploymentUpdatesClient;

},{"form-data":5,"log4js":12}],22:[function(require,module,exports){
'use strict';

var logger = require('log4js').getLogger('cloudify.deployments');

/**
 * @typedef {object} DeploymentsClient~Inputs
 */

/**
 * @typedef {object} DeploymentsClient~Outputs
 */

/**
 * @typedef {object} DeploymentsClient~Deployment
 * @property {string} id the identifier of the deployment
 * @property {string} blueprint_id the identifier of the blueprint this deployment elongs to.
 * @property {Array<Workflow>} the workflows of this deployment.
 * @property {Inputs} The inputs provided on deployment creation
 * @property {Outputs} The outputs definition of this deployment
 *
 */

/**
 * @typedef {object} DeploymentsClient~Workflow
 * @property {string} id the workflow's id
 * @property {string} name the workflow's name
 * @property {object} parameters the workflows parameters
 */

/**
 * @typedef {object} DeploymentOutputsClient~DeploymentOutputs
 * @property {string} deployment_id
 * @property {object} outputs
 */


/**
 * @class DeploymentOutputsClient
 * @description
 * handles rest api calls specific for deployment outputs
 * @constructor
 */
function DeploymentOutputsClient( config ){
    this.config = config;
}

/**
 *
 * @description
 * gets the outputs for the provided deployment's id.
 * @param {string} deployment_id
 * @param {ApiCallback} callback the body gets the outputs.
 */
DeploymentOutputsClient.prototype.get = function( deployment_id, callback  ){
    logger.trace('getting deployment outputs');
    if ( !deployment_id ){
        callback(new Error('deployment_id is missing'));
        return;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : String.format(this.config.endpoint + '/deployments/{0}/outputs', deployment_id )
        },
        callback
    );
};

/**
 * @typedef {object} DeploymentModificationClient~DeploymentModificationNodeInstances
 * @property {object} added_and_related list of added nodes and nodes that related to them
 * @property {object} removed_and_related list of removed nodes and nodes that related to them
 */

/**
 * @typedef {object} DeploymentModificationClient~DeploymentModification
 * @property {string} deployment_id deployment id the outputs belong to
 * @property {object} node_instances
 * @property {object} node_instances.added_and_related
 * @property {object} node_instances.remove_and_related
 * @property {object} modified_nodes original request modified nodes dict
 */


/**
 * @class DeploymentModificationClient
 * @param {ClientConfig} config
 * @constructor
 */
function DeploymentModificationClient( config ){
    this.config = config;
}


/**
 * @description
 * start deployment modification
 * @param {string} deployment_id the deployment id
 * @param {object} nodes the nodes to modify
 * @param {ApiCallback} callback body get the deployment modification
 */
DeploymentModificationClient.prototype.start = function( deployment_id, nodes, callback){
    logger.trace('starting deployment modification');
    if ( !deployment_id ){
        callback(new Error('deployment_id is missing'));
        return;
    }

    return this.config.request(
        {
            'method' : 'PATCH',
            'json' : true,
            'url' : String.format(this.config.endpoint + '/deployments/{0}/modify', deployment_id ),
            'body' : {
                'stage' : 'start',
                'nodes' : nodes
            }
        },
        callback
    );
};

/**
 * @description
 * finish deployment modification
 * @param  {string} deployment_id the deployment id
 * @param {object} modification the modification response received on 'start'
 * @param {ApiCallback} callback body gets the deployment modification
 */
DeploymentModificationClient.prototype.finish = function( deployment_id, modification, callback ){
    logger.trace('finishing deployment modification');

    if ( !deployment_id ){
        callback(new Error('deployment_id is missing'));
        return;
    }
    return this.config.request(
        {
            'method' : 'PATCH',
            'json' : true,
            'url' : String.format(this.config.endpoint + '/deployments/{0}/modify', deployment_id ),
            'body' : {
                'stage' : 'finish',
                'modification' : modification
            }
        },
        callback
    );
};

/**
 *
 * @class DeploymentsClient
 * @description api calls for deployments
 * @param {ClientConfig} config
 * @constructor
 */

function DeploymentsClient( config ){
    this.config = config;
    this.outputs = new DeploymentOutputsClient( config );
}

/**
 * @description
 * returns a list of all deployments
 * @param {IncludeParam} [_include] list of fields to include in response
 * @param {ApiCallback} callback body gets a list of deployments
 */
DeploymentsClient.prototype.list = function( _include, callback ){
    logger.trace('listing deployments');
    var qs = {};

    if ( !!_include ){
        qs._include = _include;
    }


    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint + '/deployments',
            qs : qs
        },
        callback
    );

};

/**
 * @description
 * returns a deployment by its id.
 * @param {string} deployment_id id of the deployment to get
 * @param {IncludeParam} [_include] list of fields to include in response
 * @param {ApiCallback} callback body gets deployment
 */
DeploymentsClient.prototype.get = function (deployment_id, _include, callback) {
    logger.trace('getting deployment');
    if (!deployment_id) {
        callback(new Error('blueprint_id is missing'));
        return;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : String.format( this.config.endpoint  + '/deployments/{0}', deployment_id )
        },
        callback
    );
};


/**
 * @description
 * creates a new deployment for the provided blueprint id and deployment id
 * @param {string} blueprint_id blueprint id to create a deployment of
 * @param {string} deployment_id deployment id of the new created deployment
 * @param {object|null} [inputs] inputs obj for the deployment
 * @param {ApiCallback} callback body get the created deployment
 */
DeploymentsClient.prototype.create = function( blueprint_id, deployment_id, inputs, callback ){
    logger.trace('creating deployment');
    if ( !blueprint_id ){
        callback( new Error('blueprint_id is missing'));
        return;
    }

    if ( !deployment_id ){
        callback( new Error('deployment_id is missing'));
        return;
    }

    var body = {
        'blueprint_id': blueprint_id
    };

    if ( inputs ){
        body.inputs = inputs;
    }

    return this.config.request(
        {
            'method' : 'PUT',

            // we recommend the following algorithm to know if you need Content-Type: application/json
            // if json: true ==> set header Content-Type application/json.
            // you should not rely on overriding the header as the github issue below specified so.

            // https://github.com/iriscouch/browser-request/issues/54

            //'headers' : { // https://cloudifysource.atlassian.net/browse/CFY-2996
            //    'Content-Type' : 'application/json'
            //},
            'json' : true,
            'url' : String.format( this.config.endpoint + '/deployments/{0}', deployment_id ),
            'body' : body
        },
        callback // expected status code 201
    );
};

/**
 *
 * @description
 * delets the deployment whose id matches the provided deployment id.
 * by default, deployment with live nodes deletion is not allowed and
 * this behavior can be changed using the ignore_live_nodes arguments.
 *
 * @param {string} deployment_id the deployment's to be deleted id.
 * @param {boolean|null} [ignore_live_nodes=false] determines whether to ignore live nodes.
 * @param {ApiCallback} callback body gets the deleted deployment
 */
DeploymentsClient.prototype.delete = function( deployment_id, ignore_live_nodes, callback ){
    logger.trace('deleting deployment');
    if ( !deployment_id ){
        callback(new Error('deployment_id is missing'));
        return;
    }

    var qs = {};

    if ( ignore_live_nodes === true ){
        qs.ignore_live_nodes = 'true';
    }

    return this.config.request(
        {
            'method' : 'DELETE',
            'json': true,
            'url' : String.format( this.config.endpoint + '/deployments/{0}', deployment_id ),
            qs: qs
        },
        callback
    );
};

/**
 * @description
 * returns a deployment workflows by deployment id
 * @param {string} deployment_id id of the deployment to get its workflows
 * @param {IncludeParam} [_include] list of fields to include in response
 * @param {ApiCallback} callback body gets workflows
 */
DeploymentsClient.prototype.get_workflows = function( deployment_id, _include, callback ){
    logger.trace('getting workflows');
    if ( !deployment_id ){
        callback(new Error('blueprint_id is missing'));
        return;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : String.format( this.config.endpoint  + '/deployments/{0}/workflows', deployment_id )
        },
        callback
    );
};




module.exports = DeploymentsClient;
},{"log4js":12}],23:[function(require,module,exports){
'use strict';

var logger = require('log4js').getLogger('cloudify.nodeInstances');


/**
 * @typedef {object} EvaluateClient~EvaluatedFunc
 * @property {string} deployment_id
 * @property {object} payload
 */

/**
 * @description
 * collection of API calls for remote execution
 * @class EvaluateClient
 * @param {ClientConfig} config
 * @constructor
 */
function EvaluateClient( config ){
    this.config = config;
}

/**
 * @description evaluate intrinsic functions in payload in respect tohe provided context
 * @param {string} deployment_id the deployment's id of the node
 * @param {object} context the processing context
 * @param {string} [context.self]
 * @param {string} [context.source]
 * @param {string} [context.target]
 * @param {object} payload the payload to process
 *
 * @param {ApiCallback} callback body gets the payload with its intrinsic functions references evaluated.
 */
EvaluateClient.prototype.functions = function( deployment_id, context, payload, callback ){
    logger.trace('evaluating');
    this.config.request(
        {
            'method' : 'POST',
            'url' : this.config.endpoint + '/evaluate/functions',
            'json' : true,
            'body' : {
                'deployment_id' : deployment_id,
                'context' : context,
                'payload' : payload
            }
        },
        callback
    );
};

module.exports = EvaluateClient;

},{"log4js":12}],24:[function(require,module,exports){
'use strict';
var logger = require('log4js').getLogger('cloudify.events');

/**
 * @description
 * collection of API calls for events
 * @class EventsClient
 * @param options - request options
 * @param callback
 * @constructor
 */
function EventsClient( config ){
    this.config = config;
}

EventsClient.prototype.get = function(options, callback){
    logger.trace('getting logs and events');
    return this.config.request( {
        'method' : 'GET',
        'json': true,
        'url' : this.config.endpoint + '/events',
        'qs' : options
    }, callback );
};

module.exports = EventsClient;

},{"log4js":12}],25:[function(require,module,exports){
'use strict';


var logger = require('log4js').getLogger('cloudify.executions');
/**
 * @typedef {object} ExecutionsClient~Execution
 *
 * @property {string} id The execution's id.
 * @property {string} deployment_id the deployment's id this execution is related to.
 * @property {string} the execution's status
 * @property {string} error the execution error in a case of failure, otherwise null.
 * @property {string} workflow_id the id of the workflow this execution represents.
 * @property {object} parameters the execution's parameters
 * @property {CloudifyTimestamp} created_at the execution creation time
 */

/**
 * @description
 * collection of API calls for executions
 * @class ExecutionsClient
 * @param {ClientConfig} config
 * @constructor
 */
function ExecutionsClient( config ){
    this.config = config;
}


/**
 *
 * @description
 * returns a list of executions
 * @param {object} opts
 * @param {string} opts._include - list of fields to include in response
 * @param {string} opts.deployment_id - id of the deployment, leave null to get executions of all deployments
 * @param {Array} opts.status - optional Array of statuses of executions to be listed, e.g. ['pending', 'started']
 *
 * @param {ApiCallback} callback body gets executions list
 */
ExecutionsClient.prototype.list = function( opts, callback  ){
    logger.trace('listing executions');

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint + '/executions',
            'qs': opts
        },
        callback
    );
};


/**
 * @description
 * get execution by its id.
 * @param {string} execution_id id of the execution to get.
 * @param {IncludeParam|null} [_include] list of fields to include in response.
 * @param {ApiCallback} callback body gets the execution
 */
ExecutionsClient.prototype.get = function( execution_id, _include, callback ){
    logger.trace('getting execution');
    if ( !execution_id ){
        callback(new Error('execution_id is missing'));
        return;
    }

    var qs = {};

    if ( _include ){
        qs._include = _include;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : String.format( this.config.endpoint + '/executions/{0}', execution_id ),
            'qs' : qs
        },
        callback
    );
};


/**
 *
 * @description
 * update execution with the provided status and optional error.
 * @param {string} execution_id id of the execution to update
 * @param {string} status updated execution status
 * @param {string|null} [error] updated execution error
 * @param {ApiCallback} callback body gets updated execution
 */
ExecutionsClient.prototype.update = function( execution_id, status, error, callback ){
    logger.trace('updating execution');
    if ( !execution_id ){
        callback( new Error('execution_id is missing'));
        return;
    }

    var body = { 'status' : status };
    if ( !error ){
        body.error = error;
    }

    return this.config.request(
        {
            'method' : 'PATCH',
            'url' : String.format( this.config.endpoint + '/executions/{0}', execution_id ),
            'json' : true,
            'body' : body
        },
        callback
    );
};

/**
 *
 * @description
 * starts a deployment's workflow execution whose id is provided.
 *
 * @param {string} deployment_id the deployment's id to execute a workflow for.
 * @param {string} workflow_id the workflow to be executed id.
 * @param {object|null} [parameters] parameters for the workflow execution.
 * @param {boolean|null} [allow_custom_parameters=false] determines whether to allow parameters which weren't defined in
 * the workflow parameters schema in the blueprint.
 * @param {boolean|null} [force=false] determines whether to force the execution of the workflow in a case where there's
 * an already running execution for this deployment.
 * @param {ApiCallback} callback the body gets the created execution
 */
ExecutionsClient.prototype.start = function( deployment_id, workflow_id, parameters, allow_custom_parameters, force, callback ){
    logger.trace('starting execution');
    if ( !deployment_id ){
        callback( new Error('deployment_id is missing'));
        return;
    }
    if ( !workflow_id ){
        callback( new Error('workflow_id is missing'));
        return;
    }

    var body = {
        'deployment_id' : deployment_id,
        'workflow_id' : workflow_id
    };

    if ( parameters ){
        body.parameters = parameters;
    }

    if ( allow_custom_parameters === true ){
        body.allow_custom_parameters = 'true';
    }else{
        body.allow_custom_parameters = 'false';
    }

    if ( force === true ){
        body.force = 'true';
    }else{
        body.force = 'false';
    }

    return this.config.request(
        {
            'method' : 'POST',
            'url' : this.config.endpoint + '/executions',
            'body' : body,
            'json' : true
        },
        callback
    );
};

/**
 *
 * @description
 * cancels the execution which matches the provided execution id.
 * @param {string} execution_id id of the execution to cancel
 * @param {boolean|null} [force=false] whether to send a 'cancel' or a 'force-cancel' action
 * @param {ApiCallback} callback body gets cancelled execution
 */
ExecutionsClient.prototype.cancel = function( execution_id, force, callback ){
    logger.trace('cancelling execution');
    if ( !execution_id ){
        callback( new Error('execution_id is missing'));
        return;
    }

    var body = {  };

    if ( force === true ){
        body.action = 'force-cancel';
    }else{
        body.action = 'cancel';
    }

    return this.config.request(
        {
            'method' : 'POST',
            'url' : String.format(this.config.endpoint + '/executions/{0}', execution_id),
            'json' : true,
            'body' : body
        },
        callback // expected status code = 201
    );
};


module.exports = ExecutionsClient;
},{"log4js":12}],26:[function(require,module,exports){
'use strict';
var logger = require('log4js').getLogger('cloudify.maintenance');


function MaintenanceClient(config){
    this.config = config;
}

MaintenanceClient.prototype.get = function(callback){
    logger.trace('getting maintenance details');
    return this.config.request( {
        'method' : 'GET',
        'json': true,
        'url' : this.config.endpoint + '/maintenance'
    }, callback );
};

MaintenanceClient.prototype.activate = function(callback){
    logger.trace('activating maintenance mode');
    return this.config.request( {
        'method' : 'POST',
        'json': true,
        'url' : this.config.endpoint + '/maintenance/activate'
    }, callback );
};

MaintenanceClient.prototype.deactivate = function(callback){
    logger.trace('deactivating maintenance mode');
    return this.config.request( {
        'method' : 'POST',
        'json': true,
        'url' : this.config.endpoint + '/maintenance/deactivate'
    }, callback );
};

module.exports = MaintenanceClient;
},{"log4js":12}],27:[function(require,module,exports){
'use strict';



var logger = require('log4js').getLogger('cloudify.manager');


/**
 * @description
 * collection of API calls for manager
 * @class ManagerClient
 * @param {ClientConfig} config
 * @constructor
 */
function ManagerClient( config ){
    this.config = config;
}

/**
 * @description
 * management machine status
 * @param {ApiCallback} callback body gets the status
 */
ManagerClient.prototype.get_status = function( callback ){
    logger.trace('getting status');
    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint + '/status'
        },
        callback
    );
};

/**
 * @description
 * cloudify's management machine version information
 * @param {ApiCallback} callback body gets the version information
 */
ManagerClient.prototype.get_version = function( callback ){
    logger.trace('getting version');
    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint + '/version'
        },
        callback
    );
};

/**
 * @description
 * gets the context which was stored on management machine bootstrap.
 * The context contains cloudify specific information and cloud provider specific information

 * @param {IncludeParam|null} [_include=null] list of fields to include in response
 * @param {ApiCallback} callback body gets the context stored in manager
 */
ManagerClient.prototype.get_context = function( _include, callback ){
    logger.trace('getting context');
    var qs = {};
    if ( _include ){
        qs._include = _include;
    }
    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint +  '/provider/context',
            'qs': qs
        },
        callback
    );
};

/**
 * @description
 * creates context in cloudify's management machine.
 * this method is usually invoked right after management machine
 * bootstrap with relevant cloudify and cloud provider context information
 *
 * @param {string} name cloud provider name
 * @param {object} context context
 * @param {ApiCallback} callback body gets create context result
 */
ManagerClient.prototype.create_context = function( name, context, callback ){
    logger.trace('creating context');
    if ( !name ){
        callback(new Error('name is missing'));
        return;
    }

    if ( !context ){
        callback(new Error('context is missing'));
        return;
    }

    var body = { 'name': name, 'context' : context };

    return this.config.request(
        {
            'method' : 'POST',
            'json': true,
            'url' : this.config.endpoint + '/provider/context',
            body: body
        },
        callback // expected status code 201
    );
};


module.exports = ManagerClient;
},{"log4js":12}],28:[function(require,module,exports){
'use strict';

var logger = require('log4js').getLogger('cloudify.nodeInstances');

/**
 * @typedef {object} NodeInstancesClient~NodeInstance
 * @property {string} id the identifier of the node instance
 * @property {string} node_id the identifier of the node whom this is the instance of.
 * @property {object} relationships the node instance relationships
 * @property {string} host_id the node instance host_id
 * @property {string} deployment_id the deployment id the node instance belongs to
 * @property {object} runtime_properties the runtime properties of the node instance
 * @property {string} state the current state of the node instance
 * @property {number} version the current version of the node instance - used for optimistic locking on update)
 */

/**
 * @description
 * collection of API calls for node instances
 * @class NodeInstancesClient
 * @param {ClientConfig} config
 * @constructor
 */
function NodeInstancesClient( config ){
    this.config = config;
}

/**
 * @description
 * returns the node instance for the provided node instance id.
 * @param {string} node_instance_id the identifier of the node instance to get
 * @param {IncludeParam|null} [_include=null] list of fields to include in response
 * @param {ApiCallback} callback body gets the retrieved node instance
 */
NodeInstancesClient.prototype.get = function( node_instance_id, _include, callback ){
    logger.trace('getting node instances');
    if ( !node_instance_id ){
        callback( new Error('node_instance_id is missing'));
        return;
    }

    var qs = {};

    if ( _include ){
        qs._include = _include;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : String.format( this.config.endpoint + '/node-instances/{0}', node_instance_id),
            'qs': qs
        },
        callback
    );
};

/**
 * @description
 * update node instance with the provided state & runtime_properties
 *
 * @param {string} node_instance_id the identifier of the node instance to update
 * @param {string|null} [state] the updated state
 * @param {object|null} [runtime_properties=null] the updated runtime properties
 * @param {number} [version=0] current version value of this node instance in cloudify's storage (used for optimistic locking)
 * @param {ApiCallback} callback body gets the updated node instance
 */
NodeInstancesClient.prototype.update = function( node_instance_id, state, runtime_properties, version , callback ){
    logger.trace('updating node instance');
    if ( !node_instance_id ){
        callback(new Error('node_instance_id is missing'));
    }

    if ( isNaN(parseInt(version))){
        version = 0;
    }

    var body = {
        'version' : version
    };

    if ( runtime_properties ){
        body.runtime_properties = runtime_properties;
    }

    if ( state ){
        body.state = state;
    }

    return this.config.request(
        {
            'method' : 'PATCH',
            'url' : String.format( this.config.endpoint + '/node-instances/{0}', node_instance_id ),
            'json'  : true,
            'body' : body
        },
        callback
    );
};


/**
 * @description
 * returns a list of node instances which belong to the deployment identified by the provided deployment id.
 * @param {string|null} [deployment_id=null] deployment id to list node instances for.
 * @param {string|null} [node_name=null] node id to only fetch node instances with this name.
 * @param {IncludeParam|null} [_include=null] list of fields to include in response
 * @param {ApiCallback} callback body gets list of node instances
 */
NodeInstancesClient.prototype.list = function( deployment_id, _include , callback ){
    logger.trace('listing node instances');
    var qs = {};

    if ( deployment_id ){
        qs.deployment_id = deployment_id;
    }

    if (_include){
        qs._include = _include;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint + '/node-instances',
            'qs' : qs
        },
        callback
    );
};


module.exports = NodeInstancesClient;
},{"log4js":12}],29:[function(require,module,exports){
'use strict';

var logger = require('log4js').getLogger('cloudify.nodeInstances');


/**
 * @typedef {object} NodesClient~Node
 * @property {string} id the identifier of the node
 * @property {string} deployment_id the deployment id the node instance belongs to
 * @property {object} properties the static properties of the node
 * @property {object} operations the node operations mapped to plugins
 * @property {string} blueprint_id the id of the blueprint this node belongs to.
 * @property {object} plugins the plug
 * @property {number} number_of_instances the umber of instances this node has
 * @property {number} deploy_number_of_instances the number of instances set for this node when the deployment was created
 * @property {string} host_id the id of the node instance which hosts this node
 * @property {Array<string>} type_hierarchy the type hierarchy of this node
 * @property {string} type the type of this node
 */

/**
 * @description
 * collection of API calls for node
 * @class NodesClient
 * @param {ClientConfig} config
 * @constructor
 */
function NodesClient( config ){
    this.config = config;
}


/**
 * @description
 * returns a list of nodes which belongs to the deployment identified by the provided deployment id.
 * @param {string|null} [deployment_id=null] the deployment's id to list nodes for.
 * @param {string|null} [node_id=null] response will filter nodes by this id.
 * @param {IncludeParam|null} [_include=null] list of fields to include in response
 * @param {ApiCallback} callback body gets list of nodes
 */
NodesClient.prototype.list = function( deployment_id, node_id, _include , callback ){
    logger.trace('listing nodes');
    var qs = {};

    if ( deployment_id ){
        qs.deployment_id = deployment_id;
    }

    if ( node_id ){
        qs.id = node_id;
    }

    return this.config.request(
        {
            'method' : 'GET',
            'json': true,
            'url' : this.config.endpoint + '/nodes',
            qs: qs
        },
        callback
    );
};

/**
 * @description
 * returns the node which belongs to the deployment identified by the provided deployment id.
 * @param {string} deployment_id the deployment's id of the node.
 * @param {string} node_id the node id
 * @param {IncludeParam|null} [_include=null]
 * @param {ApiCallback} callback body gets list of nodes
 */
NodesClient.prototype.get = function( deployment_id, node_id, _include, callback ){
    logger.trace('getting nodes');
    if ( !deployment_id ){
        callback( new Error('deployment_id is missing'));
        return;
    }

    if ( !node_id ){
        callback( new Error('node_id is missing'));
        return;
    }

    this.list( deployment_id, node_id, _include, function( err, response, body ){
            if ( !!body && body.length > 0 ){
                body = body[0];
            }
            callback(err, response, body);
        }
    );
};

module.exports = NodesClient;

},{"log4js":12}],30:[function(require,module,exports){
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
        'url': String.format(this.config.endpoint + '/plugins/{0}', plugin_id),
        'body': {}
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
},{"log4js":12}],31:[function(require,module,exports){
'use strict';

var logger = require('log4js').getLogger('cloudify.providerContext');

function ProviderContextClient( config ){
    this.config = config;
}

ProviderContextClient.prototype.get = function (callback) {
    logger.trace('getting provider context');
    return this.config.request({
        'method': 'GET',
        'json': true,
        'url': this.config.endpoint + '/provider/context'
    }, callback );
};

ProviderContextClient.prototype.update = function (name, context, callback) {
    logger.trace('updating provider context');
    var body = {
        name: name,
        context: context
    };
    return this.config.request({
        'method': 'POST',
        'json': true,
        'url': this.config.endpoint + '/provider/context?update=true',
        'body': body
    }, callback );
};


module.exports = ProviderContextClient;
},{"log4js":12}],32:[function(require,module,exports){
'use strict';

var logger = require('log4js').getLogger('cloudify.nodeInstances');

/**
 * @description
 * collection of API calls for searching
 * @class SearchClient
 * @param {ClientConfig} config
 * @constructor
 */
function SearchClient( config ){
    this.config = config;
}

/**
 * @description run the provided elasticsearch query
 * @param {string} query elasticsearch query
 * @param {ApiCallback} callback body gets result hits
 */
SearchClient.prototype.run_query = function( query, callback ){
    logger.trace('running query');
    return this.config.request(
        {
            'method' : 'POST',
            'json': true,
            'url' : this.config.endpoint + '/search',
            'body' : query
        },
        callback
    );
};

module.exports = SearchClient;

},{"log4js":12}],33:[function(require,module,exports){
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

},{"log4js":12}]},{},[18]);
