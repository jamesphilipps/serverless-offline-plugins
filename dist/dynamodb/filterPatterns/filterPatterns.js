"use strict";
exports.__esModule = true;
exports.allowEvent = void 0;
var AWSDataKeys = new Set(["S", "N", "B", "BOOL", "L", "M", "NS", "SS", "BS", "NULL"]);
var AWSRuleKeys = new Set(["anything-but"]);
var isDataContainer = function (v) { return !!(v && typeof v === 'object' && Object.keys(v).length === 1); };
var dataContainerKey = function (v) { return Object.keys(v)[0]; };
var dataContainerValue = function (v) { return v[dataContainerKey(v)]; };
var isPrimitiveScalar = function (v) { return new Set(['boolean', 'string', 'number']).has(typeof v); };
var isArrayScalar = function (v) { return Array.isArray(v); };
var isAwsScalar = function (v) { return isDataContainer(v) && AWSDataKeys.has((Object.keys(v))[0]); };
var isEmptyScalar = function (v) { return v === undefined || v === null; };
var isScalar = function (v) { return isPrimitiveScalar(v) || isArrayScalar(v) || isAwsScalar(v) || isEmptyScalar(v); };
var isAwsRule = function (v, ruleKey) {
    if (!isDataContainer(v))
        return false;
    return ruleKey ? ruleKey === dataContainerKey(v) : AWSRuleKeys.has(dataContainerKey(v));
};
var toScalar = function (data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (isAwsScalar(data)) {
        var dataTypeKey = Object.keys(data)[0];
        if (dataTypeKey === 'NULL') {
            return null;
        }
        return toScalar(data[dataTypeKey]);
    }
    return data;
};
var isAnythingButMatch = function (p, data) {
    return isAwsRule(p, 'anything-but') && evalReduceAnd(dataContainerValue(p), function (v) { return v !== data; });
};
var isExistsMatch = function (p, data) {
    return isAwsRule(p, 'exists') && (!!(p.exists && data) || !!(!p.exists && !data));
};
var isNumericMatch = function (p, data) {
    var applyMatchRules = function (operator, operand) {
        switch (operator) {
            case '=':
                return data === operand;
            case '<':
                return data < operand;
            case '<=':
                return data <= operand;
            case '>':
                return data > operand;
            case '>=':
                return data >= operand;
            default:
                throw Error("Unknown numeric rule operand: '".concat(operand, "'"));
        }
    };
    if (isAwsRule(p, 'numeric')) {
        var numericRules = dataContainerValue(p);
        if (numericRules.length === 2) {
            var _a = numericRules, operator = _a[0], operand = _a[1];
            return applyMatchRules(operator, operand);
        }
        else {
            var _b = numericRules, operator1 = _b[0], operand1 = _b[1], operator2 = _b[2], operand2 = _b[3];
            return applyMatchRules(operator1, operand1) && applyMatchRules(operator2, operand2);
        }
    }
    return false;
};
var isEqualityMatch = function (p, data) {
    return p === null && data === null ||
        (isPrimitiveScalar(p) && isPrimitiveScalar(data) && p === data) ||
        (isArrayScalar(p) && isPrimitiveScalar(data) && evalReduceOr(p, function (v) { return v === data; }));
};
var isBeginsWithMatch = function (p, data) {
    return isAwsRule(p, 'prefix') && data.startsWith(dataContainerValue(p));
};
var isMatch = function (p, data) { return evalReduceOr([
    isEqualityMatch,
    isAnythingButMatch,
    isNumericMatch,
    isExistsMatch,
    isBeginsWithMatch
], function (f) { return f.apply(null, [p, data]); }); };
var evalNested = function (patternData, eventData) {
    if (isScalar(patternData) && isScalar(eventData)) {
        var patternDataScalar = toScalar(patternData);
        var eventDataScalar_1 = toScalar(eventData);
        return evalReduceOr(patternDataScalar, function (p) { return isMatch(p, eventDataScalar_1); });
    }
    else {
        return evalReduceAnd(Object.keys(patternData), function (k) { return evalNested(patternData === null || patternData === void 0 ? void 0 : patternData[k], eventData === null || eventData === void 0 ? void 0 : eventData[k]); });
    }
};
function evalReduceAnd(data, evalFunc) {
    return evalReduce(data, evalFunc, function (acc, v) { return acc && v; });
}
function evalReduceOr(data, evalFunc) {
    return evalReduce(data, evalFunc, function (acc, v) { return acc || v; });
}
function evalReduce(data, evalFunc, reduceFunc) {
    return data.map(function (d, i) { return evalFunc(d, i); }).reduce(reduceFunc);
}
var allowEvent = function (filterPatterns, event) { return evalReduceOr(filterPatterns, function (p) { return evalNested(p, event); }); };
exports.allowEvent = allowEvent;
