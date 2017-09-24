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
                chat: {open: true, closed: true}
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
                + '<div class="spa-shell-chat"></div>'
                + '<div class="spa-shell-modal"></div>',
            chat_extend_time: 1000,
            chat_retract_time: 300,
            chat_extend_height: 450,
            chat_retract_height: 15,
            chat_extended_title: 'Click to retract',
            chat_retracted_title: 'Click to extend'
        },
        stateMap = {
            $container: null,
            is_chat_retracted: true,
            anchor_map: {}  // 将当前锚的值保存在表示模块状态的映射中
        }, // share info
        jqueryMap = {}, // dom ele
        setJqueryMap, initModule, toggleChat, onClickChat, copyAnchorMap, changeAnchorPart, onHashChange,
        // deep copy
        copyAnchorMap = function () {
            return $.extend(true, {}, stateMap.anchor_map);
        };

    // change part of the uri anchor component (atomically update)
    // arguments:
    //      arg_map -  desc what part of the uri was update
    changeAnchorPart = function (arg_map) {
        var anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;
        KEYVAL:
        for(key_name in arg_map){
            if(arg_map.hasOwnProperty(key_name)){
                if(key_name.index('_') === 0){ continue KEYVAL;}
                anchor_map_revise[key_name] = arg_map[key_name];
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
            $container: $container,
            $chat: $container.find('.spa-shell-chat')
        };
    };

    toggleChat = function (do_extend, callback) {
        var chat_height = jqueryMap.$chat.height(),
            isOpen = chat_height === configMap.chat_extend_height,
            isClosed = chat_height === configMap.chat_retract_height,
            isSliding = !isClosed && !isOpen;
        if(isSliding){
            return false;
        }
        if(do_extend){
            jqueryMap.$chat.animate(
                {height: configMap.chat_extend_height},
                configMap.chat_extend_time,
                function () {
                    jqueryMap.$chat.attr('title', configMap.chat_extended_title);
                    stateMap.is_chat_retracted = false;
                    if(callback){callback(jqueryMap.$chat)}
                }
            );
            return true;
        }else {
            jqueryMap.$chat.animate(
                {height: configMap.chat_retract_height},
                configMap.chat_retract_time,
                function () {
                    jqueryMap.$chat.attr('title', configMap.chat_retracted_title);
                    stateMap.is_chat_retracted = true;
                    if(callback){callback(jqueryMap.$chat)}
                }
            );
            return true;
        }
    };

    // eventHandler
    onClickChat = function (e) {
        changeAnchorPart({
           chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
        });
        return false;
    };

    // handles the hashchange event
    onHashChange = function (e) {
        var anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous,
            _s_chat_proposed,
            s_chat_proposed;
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();

        }catch (error){
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;
        _s_chat_previous =  anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
        if(!anchor_map_previous || _s_chat_previous !== _s_chat_proposed){
            s_chat_proposed = anchor_map_proposed.chat;
            switch (s_chat_proposed){
                case 'open':
                    toggleChat(true);
                    break;
                case 'closed':
                    toggleChat(false);
                    break;
                default:
                    toggleChat(false);
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        return false;
    };

    // public method
    initModule = function ($container) {
        // init share status
        stateMap.$container = $container;
        stateMap.is_chat_retracted = true;
        // init shell
        $container.html(configMap.main_Html);
        // init dom
        setJqueryMap();
        // init module chat
        jqueryMap.$chat
            .attr('title', configMap.chat_retracted_title)
            .click(onClickChat);
        // init uri anchor to use our schema
        // 配置uriAnchor插件，用于检测模式（schema）
        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });
        // 绑定事件并立即触发
        $(window)
            .bind('hashchange', onHashChange)
            .trigger('hashchange');
    };

    return {initModule: initModule};

}());