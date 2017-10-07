/**
 * 创建fake模块
 * spa.fake.js
 * Created by chengyong.lin on 17/10/6.
 */
/* jsLint setting */
/*jslint
 browser: true, continue: true, devel: true, indent: 4, maxerr: 50, newcap: true,
 nomen: true, plusplus: true, regexp: true, sloppy: true, vars: false, white: true
 */
/*global $, spa*/

spa.fake = (function () {
    'use strict';

    var getPeopleList, fakeIdSerial, makeFakeId, mockSio;

    fakeIdSerial = 5;

    makeFakeId = function () {
        return 'id_' + String( fakeIdSerial++ );
    };

    getPeopleList = function () {
        return [
            {
                name: 'jack',
                _id: '001',
                css_map: {
                    top: 20,
                    left: 20,
                    'background-color': 'rgb(128,128,128)'
                }
            },
            {
                name: 'mike',
                _id: '002',
                css_map: {
                    top: 60,
                    left: 20,
                    'background-color': 'rgb(128,255,128)'
                }
            },
            {
                name: 'kathy',
                _id: '003',
                css_map: {
                    top: 100,
                    left: 20,
                    'background-color': 'rgb(128,192,192)'
                }
            },
            {
                name: 'andy',
                _id: '004',
                css_map: {
                    top: 140,
                    left: 20,
                    'background-color': 'rgb(192,128,128)'
                }
            }
        ];
    };

    mockSio = (function () {
        var on_sio, emit_sio, callback_map = {};

        on_sio = function ( msg_type, callback ) {
            callback_map[ msg_type ] = callback;
        };

        emit_sio = function ( msg_type, data ) {

            // respond to 'adduser' event with 'userupdate'
            // callback after a 3s delay
            //
            if ( msg_type === 'adduser' && callback_map.userupdate ) {
                setTimeout( function () {
                    callback_map.userupdate(
                        [{  _id     : makeFakeId(),
                            name    : data.name,
                            css_map : data.css_map
                        }]
                    );
                }, 3000 );
            }
        };

        return { emit : emit_sio, on : on_sio };
    }());

    return {
        getPeopleList: getPeopleList,
        mockSio: mockSio
    };
}());