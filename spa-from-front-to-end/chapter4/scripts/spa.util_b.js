/**
 * 创建浏览器端的工具方法
 * spa.util_b.js
 * Created by chengyong.lin on 17/10/6.
 */

'use strict';

/* jsLint setting */
/*jslint
 browser: true, continue: true, devel: true, indent: 4, maxerr: 50, newcap: true,
 nomen: true, plusplus: true, regexp: true, sloppy: true, vars: false, white: true
 */
/*global $, spa*/

spa.util_b = (function () {

    var decodeHtml,  encodeHtml,
        decodeHtmlByReg, encodeHtmlByReg, getEmSize;

    decodeHtml = function ( str ) {
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
        temp.innerHTML = str;
        //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    };
    // End decodeHtml

    encodeHtmlByReg =  function (str) {
        if(typeof str === "string"){
            if(str.length === 0){
                return "";
            }else {
                return str.replace(/&/g, '&amp;')
                    .replace('/\'/g','&#39;')
                    .replace('/>/g','&gt;')
                    .replace('/</', '&lt;')
                    .replace('/\"/g','&quot;')
                    .replace(/ /g,"&nbsp;");
            }
        }else {
            throw new Error("请输入字符串");
            return false;
        }
    };

    decodeHtmlByReg = function (str) {
        if(typeof str === "string"){
            if(str.length === 0){
                return "";
            }else {
                return str.replace(/&amp;/g,"&")
                    .replace(/&#39;/g,"\'")
                    .replace(/&gt;/g,">")
                    .replace(/&lt;/g,"<")
                    .replace(/&quot;/g,"\"")
                    .replace(/&nbsp;/g," ");
            }
        }else {
            throw new Error("请输入字符串");
            return false;
        }
    };
    // Begin encodeHtml
    // This is single pass encoder for html entities and handles
    // an arbitrary number of characters
    //
    encodeHtml = function () {
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement ("div");
        //2.然后将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
        (temp.textContent != undefined ) ? (temp.textContent = html) : (temp.innerText = html);
        //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
        var output = temp.innerHTML;
        temp = null;
        return output;
    };
    // End encodeHtml

    // Begin getEmSize
    // returns size of ems in pixels
    //
    getEmSize = function ( elem ) {
        return Number(
            getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
        );
    };
    // End getEmSize

    // export methods
    return {
        decodeHtml : decodeHtml,
        encodeHtmlByReg: encodeHtmlByReg,
        decodeHtmlByReg: decodeHtmlByReg,
        encodeHtml : encodeHtml,
        getEmSize  : getEmSize
    };
}());