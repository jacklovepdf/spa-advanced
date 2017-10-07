/**
 * spa.js
 * Created by chengyong.lin on 17/9/23.
 */

/* jsLint setting */
/*jslint
 browser: true, continue: true, devel: true, indent: 4, maxerr: 50, newcap: true,
 nomen: true, plusplus: true, regexp: true, sloppy: true, vars: false, white: true
 */
/*global $, spa*/

// Module spa
var spa = (function () {
    'use strict';

    var initModule = function ($container) {
        spa.model.initModule();
        spa.shell.initModule($container);
    };
    return {
        initModule: initModule
    };
}());