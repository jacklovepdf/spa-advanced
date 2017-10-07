/**
 * spa.model.js
 * Model module
 * Created by chengyong.lin on 17/10/3.
 */

/* jsLint setting */
/*jslint
 browser: true, continue: true, devel: true, indent: 4, maxerr: 50, newcap: true,
 nomen: true, plusplus: true, regexp: true, sloppy: true, vars: false, white: true
 */
/*global $, spa, TAFFY*/

spa.model = (function () {
    'use strict';
    
    var configMap = {
        anon_id: 'a0'
    },
    stateMap = {
        anon_user: null,
        cid_serial: 0,
        people_cid_map: {},
        people_db: TAFFY(),
        user: null
    },
    isFakeData = true,
    personProto, makePerson, people, initModule, makeCid, clearPeopleDb, completeLogin, removePerson;

    personProto = {
        get_is_user : function () {
            return this.cid === stateMap.user.cid;
        },
        get_is_anon : function () {
            return this.cid === stateMap.anon_user.cid;
        }
    };

    // 添加客户端id生产器，通常person对象的客户端id和服务器id是一样的， 但在客户端创建的person没有服务器端ID
    makeCid = function () {
        return 'c' + String( stateMap.cid_serial++ );
    };

    // 移除所有除匿名成员之外的person对象，如果已有用户登陆，则将当前用户对象除外
    clearPeopleDb = function () {
        var user = stateMap.user;
        stateMap.people_db      = TAFFY();
        stateMap.people_cid_map = {};
        if ( user ) {
            stateMap.people_db.insert( user );
            stateMap.people_cid_map[ user.cid ] = user;
        }
    };

    // callback
    // 登陆成功回调函数
    completeLogin = function ( user_list ) {
        var user_map = user_list[ 0 ];
        delete stateMap.people_cid_map[ user_map.cid ];
        stateMap.user.cid     = user_map._id;
        stateMap.user.id      = user_map._id;
        stateMap.user.css_map = user_map.css_map;
        stateMap.people_cid_map[ user_map._id ] = stateMap.user;

        // When we add chat, we should join here
        $.gevent.publish( 'spa-login', [ stateMap.user ] );
    };

    makePerson = function ( person_map ) {
        var person,
            cid     = person_map.cid,
            css_map = person_map.css_map,
            id      = person_map.id,
            name    = person_map.name;

        if ( cid === undefined || ! name ) {
            throw 'client id and name required';
        }

        person         = Object.create( personProto );
        person.cid     = cid;
        person.name    = name;
        person.css_map = css_map;

        if ( id ) { person.id = id; }

        stateMap.people_cid_map[ cid ] = person;

        stateMap.people_db.insert( person );
        return person;
    };

    removePerson = function ( person ) {
        if ( ! person ) { return false; }
        // cannot remove anonymous person
        if ( person.id === configMap.anon_id ) {
            return false;
        }

        stateMap.people_db({ cid : person.cid }).remove();
        if ( person.cid ) {
            delete stateMap.people_cid_map[ person.cid ];
        }
        return true;
    };

    people = (function () {
        var get_by_cid, get_db, get_user, login, logout;

        get_by_cid = function ( cid ) {
            return stateMap.people_cid_map[ cid ];
        };

        get_db = function () { return stateMap.people_db; };

        get_user = function () { return stateMap.user; };

        login = function ( name ) {
            var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

            stateMap.user = makePerson({
                cid     : makeCid(),
                css_map : {top : 25, left : 25, 'background-color':'#8f8'},
                name    : name
            });

            sio.on( 'userupdate', completeLogin );

            sio.emit( 'adduser', {
                cid     : stateMap.user.cid,
                css_map : stateMap.user.css_map,
                name    : stateMap.user.name
            });
        };

        logout = function () {
            var is_removed, user = stateMap.user;
            // when we add chat, we should leave the chatroom here

            is_removed    = removePerson( user );
            stateMap.user = stateMap.anon_user;

            $.gevent.publish( 'spa-logout', [ user ] );
            return is_removed;
        };

        return {
            get_by_cid : get_by_cid,
            get_db     : get_db,
            get_user   : get_user,
            login      : login,
            logout     : logout
        };
    }());

    initModule = function () {
        var i, people_list, person_map;

        // initialize anonymous person
        stateMap.anon_user = makePerson({
            cid   : configMap.anon_id,
            id    : configMap.anon_id,
            name  : 'anonymous'
        });
        stateMap.user = stateMap.anon_user;

        if ( isFakeData ) {
            people_list = spa.fake.getPeopleList();
            for ( i = 0; i < people_list.length; i++ ) {
                person_map = people_list[ i ];
                makePerson({
                    cid     : person_map._id,
                    css_map : person_map.css_map,
                    id      : person_map._id,
                    name    : person_map.name
                });
            }
        }
    };

    return {
        initModule : initModule,
        people     : people
    };
}());