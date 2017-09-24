/**
 * Created by chengyong.lin on 17/9/23.
 */

'use strict';

/* jsLint setting */
/*jslint
 browser: true, continue: true, devel: true, indent: 4, maxerr: 50, newcap: true,
 nomen: true, plusplus: true, regexp: true, sloppy: true, vars: false, white: true
 */
/*global $, spa*/

// Module spa
var spa = (function () {
    var initModule = function ($container) {
        spa.shell.initModule($container);
    };
    return {initModule: initModule};
}());