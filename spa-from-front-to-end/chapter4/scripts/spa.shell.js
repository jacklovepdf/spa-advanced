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

spa.shell = (function () {
    var configMap = {
            anchor_schema_map: {
                chat: {opened: true, closed: true}
            },
            main_Html: String()
                + '<div class="spa-shell-head">'
                    +'<div class="spa-shell-head-logo"></div>'
                    +'<div class="spa-shell-head-account"></div>'
                    +'<div class="spa-shell-head-search"></div>'
                + '</div>'
                + '<div class="spa-shell-main">'
                    + '<div class="spa-shell-main-nav"></div>'
                    + '<div class="spa-shell-main-content"></div>'
                + '</div>'
                + '<div class="spa-shell-foot"></div>'
                + '<div class="spa-shell-modal"></div>',

            resize_interval: 200
        },
        stateMap = {
            anchor_map: {},  // 将当前锚的值保存在表示模块状态的映射中
            resize_idto: undefined
        }, // share info
        jqueryMap = {}, // dom ele
        setJqueryMap, initModule, copyAnchorMap, onResize,
        changeAnchorPart, onHashChange, setChatAnchor;
        // deep copy
        copyAnchorMap = function () {
            return $.extend(true, {}, stateMap.anchor_map);
        };

    // change part of the uri anchor component (atomically update)
    // Only independent keys and their matching dependent keys are processed
    // arguments:
    //      arg_map -  desc what part of the uri was update
    changeAnchorPart = function (arg_map) {
        var anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;
        KEYVAL:
        for(key_name in arg_map){
            if(arg_map.hasOwnProperty(key_name)){

                // skip dependent keys during iteration
                if(key_name.indexOf('_') === 0){ continue KEYVAL;}

                // update independent key value
                anchor_map_revise[key_name] = arg_map[key_name];

                // update matching dependent key
                key_name_dep = '_' + key_name;
                if(arg_map[key_name_dep]){
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                }else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }
        try {
            $.uriAnchor.setAnchor(anchor_map_revise);
        }catch (error){
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }
        return bool_return;
    };
        // DOM method
    setJqueryMap =  function () {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container
        };
    };

    // handles the hashchange event
    onHashChange = function (e) {
        var anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous,
            _s_chat_proposed,
            is_ok = true,
            s_chat_proposed;
        try {
            // Parses URI anchor and returns as map
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        }catch (error){
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;
        _s_chat_previous =  anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
        // Begin adjust chat component if changed
        if(!anchor_map_previous || _s_chat_previous !== _s_chat_proposed){
            s_chat_proposed = anchor_map_proposed.chat;
            switch (s_chat_proposed){
                case 'opened':
                    is_ok = spa.chat.setSliderPosition('opened');
                    break;
                case 'closed':
                    is_ok = spa.chat.setSliderPosition('closed');
                    break;
                default:
                    spa.chat.setSliderPosition('closed');
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        if(!is_ok){
            if(anchor_map_previous){
                $.uriAnchor.setAnchor(anchor_map_previous, null, true);
                stateMap.anchor_map = anchor_map_previous;
            }else {
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        return false;
    };

    // 函数节流
    onResize = function () {
        // 只要当前没有尺寸调整计时器在运作，就运行onResize
        if(stateMap.resize_idto){
            return true;
        }
        spa.chat.handleResize();
        stateMap.resize_idto = setTimeout(function () {
            stateMap.resize_idto = undefined;
        }, configMap.resize_interval);

        return true;
    };

    // begin callback
    setChatAnchor = function (position_type) {
        return changeAnchorPart({chat: position_type});
    };

    // public method
    initModule = function ($container) {
        // init share status
        stateMap.$container = $container;
        // init shell
        $container.html(configMap.main_Html);
        // init dom
        setJqueryMap();
        // init uri anchor to use our schema
        // 配置uriAnchor插件，用于检测模式（schema）
        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });
        // config and init module chat
        spa.chat.configModule({
            set_chat_anchor: setChatAnchor,
            chat_model: spa.model.chat,
            people_model: spa.model.people
        });
        spa.chat.initModule(jqueryMap.$container);
        // 绑定事件并立即触发
        $(window)
            .bind('resize', onResize)
            .bind('hashchange', onHashChange)
            .trigger('hashchange');
    };

    return {initModule: initModule};

}());