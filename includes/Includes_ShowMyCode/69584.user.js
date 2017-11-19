// ==UserScript==
// @name           Includes : ShowMyCode
// @namespace      http://gm.wesley.eti.br/include
// @description    ShowMyCode Function
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2012+, w35l3y (http://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       http://gm.wesley.eti.br
// @version        2.2.0
// @language       en
// @include        nowhere
// @exclude        *
// @grant          GM_addStyle
// @grant          GM.addStyle
// @grant          GM_getValue
// @grant          GM.getValue
// @grant          GM_setValue
// @grant          GM.setValue
// @grant          GM_deleteValue
// @grant          GM.deleteValue
// @grant          GM_getResourceText
// @grant          GM.getResourceText
// @grant          GM_xmlhttpRequest
// @grant          GM.xmlHttpRequest
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require        ../../includes/Includes_HttpRequest/56489.user.js
// @require        ../../includes/Includes_WinConfig/163374.user.js
// ==/UserScript==

/**************************************************************************

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

**************************************************************************/

ShowMyCode = function () {};

ShowMyCode.execute = function (params) {
    function x (_params) {
        HttpRequest.open({
            "method"    : "post",
            "url"        : "http://www.showmycode.com/",
            "headers"    : {
                "Referer" : "http://www.showmycode.com/"
            },
            "onsuccess"    : function (xhr) {
                _params.response = xhr.response;

                if (/Wrong captcha/i.test(xhr.response.text)) {
                    _params.error = 4;

                    _params.onsuccess(_params);
                } else if (/Decoding engine is died/i.test(xhr.response.text)) {
                    _params.error = 2;

                    _params.onsuccess(_params);
                } else {
                    HttpRequest.open({
                        "method"    : "get",
                        "url"        : "http://www.showmycode.com/?download",
                        "headers"    : {
                            "Referer" : "http://www.showmycode.com/"
                        },
                        "onsuccess"    : function (xhr) {
                            _params.response = xhr.response;
                            _params.error = (xhr.response.text.length == 0?1:0);

                            _params.onsuccess(_params);
                        }
                    }).send();
                }
            }
        }).send({
            "MAX_FILE_SIZE" : "2097152",
            "decodingurl" : _params.url,
            "upload"    : "",
            "captcha" : _params.captcha
            //"showmycodebutton" : "Show My Code!"
        });
    }
    
    if (params.captcha) {
        x(params);
    } else if (typeof(WinConfig) != "undefined") {
        WinConfig.init({
            "title" : "Captcha",
            "type" : WinConfig.WindowType.PROMPT,
            "description" : "<center><img src='http://www.showmycode.com/?c' width='30' height='22' /><br /><br />Enter the code from the image above</center>",
            "load" : function(cfg) {
                params.captcha = cfg.text.toUpperCase();
                
                x(params);
            }
        });
    } else {
        throw "Missing parameter 'captcha'";
    }
};
