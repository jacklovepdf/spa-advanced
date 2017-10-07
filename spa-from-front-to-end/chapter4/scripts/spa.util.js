/**
 * 创建通用工具方法
 * spa.util.js
 * Created by chengyong.lin on 17/10/3.
 */

'use strict';

/* jsLint setting */
/*jslint
 browser: true, continue: true, devel: true, indent: 4, maxerr: 50, newcap: true,
 nomen: true, plusplus: true, regexp: true, sloppy: true, vars: false, white: true
 */
/*global $, spa*/

spa.util = (function () {
    var makeError, setConfigMap;
    makeError = function (name_text, msg_text, data) {
        var err = new Error();
        err.name = name_text;
        err.message = msg_text;
        if(data){
            err.data = data;
        }
        return err;
    };

    setConfigMap = function (arg_map) {
        var input_map = arg_map.input_map,
            settable_map = arg_map.settable_map,
            config_map = arg_map.config_map,
            key_name, error;

        for(key_name in input_map){
            if(input_map.hasOwnProperty(key_name)){
                if(settable_map.hasOwnProperty(key_name)){
                    config_map[key_name] =  input_map[key_name];
                }else {
                    error = makeError('Bad Input', 'Setting config key |' + key_name + '| is not supported');
                    throw error;
                }
            }
        }
    };

    return {
        makeError: makeError,
        setConfigMap: setConfigMap
    };
}());