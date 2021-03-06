"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var v4_1 = __importDefault(require("uuid/v4"));
var serialize_error_1 = require("serialize-error");
// serializeError requires an Object.entries polyfill on node <= 6.
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill
/* eslint-disable */
if (!Object.entries) {
    Object.entries = function (obj) {
        var ownProps = Object.keys(obj), i = ownProps.length, resArray = new Array(i); // preallocate the Array
        while (i--)
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        return resArray;
    };
}
var PromiseIpcBase = /** @class */ (function () {
    function PromiseIpcBase(opts, eventEmitter) {
        if (opts && opts.maxTimeoutMs) {
            this.maxTimeoutMs = opts.maxTimeoutMs;
        } // either ipcRenderer or ipcMain
        this.eventEmitter = eventEmitter;
        this.routeListenerMap = new Map();
        this.listenerMap = new Map();
    }
    PromiseIpcBase.prototype.send = function (route, sender) {
        var _this = this;
        var dataArgs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            dataArgs[_i - 2] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var replyChannel = route + "#" + v4_1["default"]();
            var timeout;
            var didTimeOut = false; // ipcRenderer will send a message back to replyChannel when it finishes calculating
            _this.eventEmitter.once(replyChannel, function (event, status, returnData) {
                clearTimeout(timeout);
                if (didTimeOut) {
                    return null;
                }
                switch (status) {
                    case 'success':
                        return resolve(returnData);
                    case 'failure':
                        return reject(returnData);
                    default:
                        return reject(new Error("Unexpected IPC call status \"" + status + "\" in " + route));
                }
            });
            sender.send.apply(sender, __spreadArrays([route, replyChannel], dataArgs));
            if (_this.maxTimeoutMs) {
                timeout = setTimeout(function () {
                    didTimeOut = true;
                    reject(new Error(route + " timed out."));
                }, _this.maxTimeoutMs);
            }
        });
    };
    PromiseIpcBase.prototype.on = function (route, listener) {
        var prevListener = this.routeListenerMap.get(route); // If listener has already been added for this route, don't add it again.
        if (prevListener === listener) {
            return this;
        } // Only one listener may be active for a given route. // If two are active promises it won't work correctly - that's a race condition.
        if (this.routeListenerMap.has(route)) {
            this.off(route, prevListener);
        } // This function _wraps_ the listener argument. We maintain a map of // listener -> wrapped listener in order to implement #off().
        var wrappedListener = function (event, replyChannel) {
            var dataArgs = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                dataArgs[_i - 2] = arguments[_i];
            }
            // Chaining off of Promise.resolve() means that listener can return a promise, or return
            // synchronously -- it can even throw. The end result will still be handled promise-like.
            Promise.resolve()
                .then(function () { return listener.apply(void 0, __spreadArrays(dataArgs, [event])); })
                .then(function (results) {
                event.sender.send(replyChannel, 'success', results);
            })["catch"](function (e) {
                if (e && e.then) {
                    e.then((v) => event.sender.send(replyChannel, 'failure', v));
                } else {
                    event.sender.send(replyChannel, 'failure', e);
                }
            });
        };
        this.routeListenerMap.set(route, listener);
        this.listenerMap.set(listener, wrappedListener);
        this.eventEmitter.on(route, wrappedListener);
        return this;
    };
    PromiseIpcBase.prototype.off = function (route, listener) {
        var registeredListener = this.routeListenerMap.get(route);
        if (listener && listener !== registeredListener) {
            return; // trying to remove the wrong listener, so do nothing.
        }
        var wrappedListener = this.listenerMap.get(registeredListener);
        this.eventEmitter.removeListener(route, wrappedListener);
        this.listenerMap["delete"](registeredListener);
        this.routeListenerMap["delete"](route);
    };
    PromiseIpcBase.prototype.removeListener = function (route, listener) {
        this.off(route, listener);
    };
    return PromiseIpcBase;
}());
exports["default"] = PromiseIpcBase;
