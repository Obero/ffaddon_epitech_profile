var toggles = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var requests = require("sdk/request");
var self = require("sdk/self");
var tabs = require("sdk/tabs");

var sessionid;

/* --------------------
[Plugin init]
- Main action button
- Main panel
-------------------- */

// Button creation
var toggle = toggles.ToggleButton(
    {
        id : "show-panel",
        label : "Show Panel",
        icon : {
            "16" : "./img/favicon.png",
            "32" : "./img/favicon.png",
            "64" : "./img/favicon.png"
        },
        onChange: function(state)
        {
            if (state.checked)
                panel.show({position: toggle});
        }
    });

// Panel construction
var panel = panels.Panel(
    {
        height : 435,
        width : 480,
        contentURL : "./login_entry.html",
        contentScriptFile : [
            "./lib/jquery/jquery-2.1.3.min.js",
            "./lib/jqvmap/jquery.vmap.js",
            "./lib/jqvmap/maps/jquery.vmap.france.js",
            "./lib/bootstrap/bootstrap.min.js",
            "./login_request.js"
        ],
        contentScriptWhen : "ready",
        contentStyleFile : [
            "./lib/jqvmap/jqvmap.css",
            "./lib/bootstrap/bootstrap.min.css",
            "./lib/bootstrap/bootstrap-theme.css",
            "./css/panel.css"
        ],
        contextMenu : true,
        onHide: function() {
            toggle.state('window', {checked: false})
        }
    });

/* --------------------
[Events]
ON request connect : connect
    -> EMIT connection done
        -> WAIT

ON request profile info : get profile info
    -> EMIT profile info
        -> WAIT

ON request open login tab : open new tab
-------------------- */

// On "open intra tab" reception -> open new tab
panel.port.on("open_intra_tab", function(msg)
{
    tabs.open("https://intra.epitech.eu/user/" + msg + "/");
});

// --------------------- //

// On "request connect" reception -> request connexion
panel.port.on('req_connect', function(msg)
{
    RequestConnexion(msg.login, msg.pwd, emitConnexionDone);
});

// On connexion request "complete" -> emit "connexion done"
function emitConnexionDone(info)
{
    console.log(info);
    if (JSON.parse(info).message == "Veuillez vous connecter")
    {
        console.log("We have a bad connection !")
        panel.port.emit('connection_fail');
    }
    else
    {
        console.log('emit set interface');
        panel.port.emit('connexion_done', info);
    }
}

// -------------------- //

// On "request profile info" reception -> request login infos
panel.port.on('req_profile_info', function(msg)
{
    RequestLogin(msg, emitProfileInfo);
});

// On login info request complete -> emit "profile info" + info
function emitProfileInfo(info)
{
    console.log('emit profile info');
    panel.port.emit('profile_info', info);
}
/* --------------------
[Intra request functions]
- Get connexion
- Get profile information
-------------------- */

// Get connexion
function RequestConnexion(login, pwd, callback)
{
    // Login request
    console.log('connexion');
    var login_req = requests.Request(
        {
            url : 'https://intra.epitech.eu/?format=json',
            content :
            {
                login : login,
                password : pwd
            },
            onComplete : function(response)
            {
                var info = response.text.replace('// Epitech JSON webservice ...', '');
                sessionid = /PHPSESSID=[^;]*/g.exec(response.headers['Set-Cookie']);
                if (typeof(callback) == "function")
                    callback(info);
            }
        });
    login_req.post();
}

// Get profile information
function RequestLogin(login, callback)
{
    var login_req = requests.Request(
        {
            url : 'https://intra.epitech.eu/user/' + login + '/?format=json',
            headers : {'Cookie': 'PHPSESSID=' + sessionid},
            onComplete : function(response)
            {
                var info = response.text.replace('// Epitech JSON webservice ...', '');
                console.log(info);
                if (typeof(callback) == "function")
                    callback(info);
            }
        });
    login_req.get();
}