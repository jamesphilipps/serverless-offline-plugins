"use strict";
exports.__esModule = true;
exports.SecretStore = void 0;
var SecretStore = /** @class */ (function () {
    function SecretStore() {
        this.secrets = {};
    }
    //TODO: binary secret
    SecretStore.prototype.add = function (name, value) {
        this.secrets[name] = value;
    };
    SecretStore.prototype.get = function (name) {
        return this.secrets[name];
    };
    SecretStore.prototype["delete"] = function (name) {
        var secret = this.secrets[name];
        delete this.secrets[name];
        return secret;
    };
    SecretStore.prototype.all = function () {
        return Object.values(this.secrets);
    };
    return SecretStore;
}());
exports.SecretStore = SecretStore;
