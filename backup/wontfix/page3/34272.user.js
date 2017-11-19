// ==UserScript==
// @name           Userscripts : Watch script
// @namespace      http://gm.wesley.eti.br/userscripts
// @description    Tells you the stats of watched scripts since your last access
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @version        1.3.3
// @copyright      w35l3y 2008
// @license        GNU GPL
// @homepage       http://www.wesley.eti.br
// @include        http://userscripts-mirror.org/users/*
// @include        http://userscripts-mirror.org/scripts/show/*
// @include        http://userscripts-mirror.org/scripts/search?q=*
// @include        http://userscripts-mirror.org/scripts
// @grant          GM_addStyle
// @grant          GM.addStyle
// @grant          GM_getValue
// @grant          GM.getValue
// @grant          GM_setValue
// @grant          GM.setValue
// @grant          GM_openInTab
// @grant          GM.openInTab
// @grant          GM_deleteValue
// @grant          GM.deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM.xmlHttpRequest
// @grant          GM_getResourceText
// @grant          GM.getResourceText
// @icon           http://gm.wesley.eti.br/icon.php?desc=34272
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require        http://www.wesley.eti.br/includes/js/php.js
// @require        http://www.wesley.eti.br/includes/js/php2js.js
// @require        http://gm.wesley.eti.br/gm_default.js?v=1
// @require        http://gm.wesley.eti.br/userscripts/WatchScript/watchscript_default.js?v=2
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

checkForUpdate({
    'file':'https://github.com/w35l3y/userscripts/raw/master/backup/wontfix/page3/34272.user.js',
    'name':'Userscripts : Watch script',
    'namespace':'http://gm.wesley.eti.br/userscripts',
    'version':'1.4.0'
});

(async function() {    // script scope
    var user = {
        watch:JSON.parse(await GM.getValue('watch',        JSON.stringify(['Watch script','Watching script']))),
        owner:JSON.parse(await GM.getValue('owner',        Watch.All&~Watch.Name)),    // = Watch.Comments|Watch.Installs|Watch.Fans (scripts you owns)
        other:JSON.parse(await GM.getValue('other',        Watch.All&~Watch.Installs))    // = Watch.Name|Watch.Comments|Watch.Fans (other scripts)
    };

    var script = {
        list:JSON.parse(await GM.getValue('list','{}')),
        'author':xpath("string(//div[1]/span/a[contains(@href,'/users/')]/text())"),
        'user':xpath("string(id('mainmenu')/li/a[contains(@href,'/home')]/text())")
    };

    var showScript = location.href.match(/\/show\/(\d+)$/);
    if (!!showScript)
    {
        var loc = xpath("id('install_script')")[0];

        var watch = document.createElement("div");
        watch.setAttribute('style','margin-top:0em; text-align:right;');
        var s = (showScript[1] in script.list ? 1 : 0 );
        watch.innerHTML = '<input id="monitor_checkbox" type="checkbox"'+(!!s ? ' checked="checked"' : '')+' /> <label id="monitor_label" for="monitor_checkbox">'+user.watch[s]+'</label>';

        loc.parentNode.insertBefore(watch,loc);

        var monitor = xpath("id('monitor_checkbox')")[0];
        monitor.addEventListener("click",function(e)
        {
            var list = JSON.parse(await GM.getValue('list','{}'));
            var script = showScript[1];
            xpath('id("monitor_label")')[0].innerHTML = user.watch[(e.target.checked ? 1 : 0)];
            if (e.target.checked)
            {
                var temp = ( script.user == script.author ? user.owner : user.other );
                list[script] = [false,(temp & Watch.Name ? '' : void 0),(temp & Watch.Comments ? 0 : void 0),(temp & Watch.Installs ? 0 : void 0),'',(temp & Watch.Fans ? 0 : void 0)];
            }
            else if (script in list)
            {
                delete list[script];
            }
            await GM.setValue('list', JSON.stringify(list));
        },false);

        var curr = showScript[1];
        if (curr in script.list && script.list[curr][0])
        {
            script.list[curr][0] = false;
            await GM.setValue('list', JSON.stringify(script.list));
        }
    }
    else
    {
        var topics = xpath("//tr[starts-with(@id,'scripts-')]");
        var map = [1,2,5,3,4];

        for ( var ai = 0 , at = topics.length ; ai < at ; ++ai )
        {
            var topic = topics[ai];

            var curr = topic.id.match(/\d+$/);

            if (curr in script.list)
            {    // checks if current script is in the list of watched scripts
                var updated = script.list[curr][0];

                for ( var bi = 1 , bt = topic.cells.length ; bi < bt ; ++bi )
                {
                    var cell = topic.cells[bi];
                    var data = [
                        !!cell.childNodes[1] && cell.childNodes[1].title.trim() || cell.textContent.match(/^\d+/)[0],    // current data
                        script.list[curr][map[bi-1]]    // stored data
                    ];

                    if (!updated)
                    {
                        script.list[curr][0] = true;
                        if (script.list[curr][map[bi-1]] != void 0)
                        {
                            script.list[curr][map[bi-1]] = data[1] = data[0];
                        }
                    }

                    if (data[1] != void 0 && data[0] != data[1])
                    {
                        if (cell.firstChild.nextSibling)
                        {
                            if (bi == 1 && data[1] != data[0])
                            {
                                cell.childNodes[1].setAttribute("style","font-weight: bold");
                            }
                            else if (bi != 1 && Date.parse(data[0].replace(/[TZ]/g,' ').replace(/-/g,'/')).valueOf() < Date.parse(data[1].replace(/[TZ]/g,' ').replace(/-/g,'/')).valueOf())
                            {
                                cell.childNodes[1].setAttribute("style","font-weight: bold");
                            }
                        }
                        else
                        {
                            cell.innerHTML += ' <b>(' + (parseInt(data[0],10)-parseInt(data[1],10)) + ')</b>';
                        }
                    }
                }
            }
        }

        await GM.setValue('list', JSON.stringify(script.list));
    }
})();