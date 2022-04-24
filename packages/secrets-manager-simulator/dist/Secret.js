"use strict";
exports.__esModule = true;
exports.createSecret = void 0;
var nanoid_1 = require("nanoid");
var createSecret = function (region, Name, SecretString) {
    var nanoid = (0, nanoid_1.customAlphabet)('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
    return ({
        ARN: "arn:aws:secretsmanager:".concat(region, ":111222333:secret:local/aes256-").concat(nanoid()),
        CreatedDate: new Date().getTime(),
        Name: Name,
        SecretString: SecretString,
        VersionId: "AWSCURRENT",
        VersionStages: []
    });
};
exports.createSecret = createSecret;
