/**
 * Created by Obero on 17/02/2015.
 */

/* --------------------
Set connexion screen
-------------------- */

function connectInit()
{
    var btnSubmit = document.getElementById('connect');
    btnSubmit.addEventListener('click', function (event) {
        self.port.emit('req_connect', {
            login: document.getElementById('login').value,
            pwd: document.getElementById('pwd').value
        });
    });
}
connectInit();

self.port.on('connection_fail', function()
{

});

/* --------------------
Set profile screen
-------------------- */

var created = false;
var last_selected = false;
self.port.on('connexion_done', function(msg)
{
    var root = document.getElementsByTagName('body')[0];
    var profileInterface = "<div class=\"row voffset2\">\n    <div class=\"col-xs-12\">\n        <div class=\"input-group\">\n            <label for=\"login\" class=\"control-label sr-only\">Login</label>\n            <input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\'login_x\' />\n            <span class=\"input-group-btn\">\n                <button type=\"submit\" id=\"submit\" class=\"btn btn-primary\">\n                    <span class=\"glyphicon glyphicon-search\" aria-hidden=\"true\"></span> Search\n                </button>\n            </span>\n        </div>\n    </div>\n</div>\n\n<div id=\"msg\"></div>\n\n<div class=\"large-text\">\n    <div class=\"row voffset4\">\n        <div class=\"col-xs-5\">\n            <img id=\"info_photo\" class=\"img-responsive img-rounded img-center\" />\n        </div>\n        <div class=\"col-xs-7\">\n            <div class=\"row voffset4\">\n                <div class=\"col-xs-12 text-center\">\n                    <span id=\"info_login\"></span>\n                </div>\n            </div>\n            <div class=\"row voffset3\">\n                <div class=\"col-xs-12 text-center\"><span id=\"info_fname\"></span> <span id=\"info_lname\"></span></div>\n            </div>\n            <div class=\"row voffset3\">\n                <div class=\"col-xs-12 text-center\"><span id=\"info_mail\"></span></div>\n            </div>\n        </div>\n    </div>\n    <div class=\"row voffset4\">\n        <div class=\"col-xs-4 text-right\">\n            <p>\n                <span id=\"info_year\"></span><br /><br />\n                <span id=\"info_promo\"></span><br /><br />\n                <span id=\"info_cycle\"></span> <span id=\"info_semester\"></span>\n            </p>\n        </div>\n        <div class=\"col-xs-4 text-left\">\n            <p>\n                <br /><span id=\"info_credits\"></span>\n                <br /><br /><span id=\"info_gpa\"></span>\n            </p>\n        </div>\n        <div class=\"col-xs-4 text-center\">\n            <div id=\"vmap\"></div>\n        </div>\n    </div>\n</div>\n";


    // Reset panel interface
    root.innerHTML = profileInterface;
    var vmap_display = document.getElementById('vmap').style.display;
    var photo_display = document.getElementById('info_photo').style.display;

    // Set profiles events
    var btnSubmit = document.getElementById('submit');
    btnSubmit.addEventListener('click', function()
    {
        self.port.emit('req_profile_info', document.getElementById('login').value);
        document.getElementById('info_login').innerHTML = '<img src="./img/loader.gif"/>';
    });

    self.port.on('profile_info', function(msg)
    {
        var info = JSON.parse(msg);

        if (info.error)
        {
            var void_placeholder = '';
            document.getElementById('msg').innerHTML = '<div class="alert alert-danger voffset2" role="alert">Bad login</div>';
            document.getElementById('info_login').innerHTML = void_placeholder;
            document.getElementById('info_fname').textContent = void_placeholder;
            document.getElementById('info_lname').textContent = void_placeholder;
            document.getElementById('info_mail').textContent = void_placeholder;
            document.getElementById('info_year').textContent = void_placeholder;
            document.getElementById('info_promo').textContent = void_placeholder;
            document.getElementById('info_semester').textContent = void_placeholder;
            document.getElementById('info_cycle').textContent = void_placeholder;
            document.getElementById('info_credits').textContent = void_placeholder;
            document.getElementById('info_gpa').textContent = void_placeholder;
            document.getElementById('info_photo').style.display = 'none';
            document.getElementById('vmap').style.display = 'none';
        }
        else
        {
            // GPA, credits & cycle values
            var gpa_value = '\u221E';
            var credits_value = '\u221E';
            var cycle_value = 'Not a student';
            var promo_value = 'Currently IRL';
            var studentyear_value = '+';
            var photo_value = './img/profile-42914_640.png';

            if (info.gpa)
            {
                credits_value = info.credits;
                if (info.gpa[1])
                {
                    gpa_value = info.gpa[1].gpa;
                    cycle_value = "Master";
                }
                else
                {
                    gpa_value = info.gpa[0].gpa;
                    cycle_value = "Bachelor";
                }
            }
            if (info.promo)
            {
                promo_value = info.promo;
            }
            if (info.studentyear)
            {
                studentyear_value = info.studentyear;
            }
            if (info.picture)
            {
                photo_value = info.picture
            }


            var loginHtml = '<button type="button" class="btn btn-default"><span class="glyphicon glyphicon-plus"></span>  ' + info.login + '</input>';
            document.getElementById('info_login').innerHTML = loginHtml;
            document.getElementById('info_login').onclick = function()
            {
                console.log("emit open intra tab");
                self.port.emit('open_intra_tab', info.login);
            };
            document.getElementById('msg').innerHTML = "";
            document.getElementById('info_fname').textContent = info.firstname;
            document.getElementById('info_lname').textContent = info.lastname;
            document.getElementById('info_mail').textContent = info.internal_email;
            document.getElementById('info_year').textContent = 'Tek ' + studentyear_value;
            document.getElementById('info_promo').textContent = promo_value;
            document.getElementById('info_semester').textContent = info.semester;
            document.getElementById('info_cycle').textContent = cycle_value;
            document.getElementById('info_credits').textContent = credits_value + ' credits';
            document.getElementById('info_gpa').textContent = gpa_value + ' GPA';
            document.getElementById('info_photo').style.display = photo_display;
            document.getElementById('info_photo').src = photo_value;
            document.getElementById('vmap').style.display = vmap_display;

            var cities_codes = {
                "FR\/LIL": "FR-O",
                "FR\/PAR": "FR-J",
                "FR\/NCY": "FR-M",
                "FR\/REN": "FR-E",
                "FR\/STG": "FR-A",
                "FR\/NAN": "FR-R",
                "FR\/LYN": "FR-V",
                "FR\/BDX": "FR-B",
                "FR\/TLS": "FR-K",
                "FR\/NCE": "FR-U",
                "FR\/MPL": "FR-K",
                "FR\/MAR": "FR-U"
            };

            var cities_base_color = {
                "FR-O": '#99CCFF',
                "FR-J": '#99CCFF',
                "FR-M": '#99CCFF',
                "FR-E": '#99CCFF',
                "FR-A": '#99CCFF',
                "FR-R": '#99CCFF',
                "FR-V": '#99CCFF',
                "FR-B": '#99CCFF',
                "FR-K": '#99CCFF',
                "FR-U": '#99CCFF'
            };

            var vmap_handler = jQuery('#vmap');
            if (!created)
            {
                vmap_handler.vectorMap({
                    map: 'france_en',
                    backgroundColor: false,
                    color: '#a5bfdd',
                    hoverOpacity: 0,
                    enableZoom: false,
                    showTooltip: true,
                    normalizeFunction: 'polynomial',
                    selectedRegion: cities_codes[info.location],
                    selectedColor: '#E65C5C',
                    onRegionClick: function(){},
                    onRegionOver: function(){}
                });
                vmap_handler.vectorMap('set', 'colors', cities_base_color);
                created = true;
            }

            if (last_selected)
            {
                vmap_handler.vectorMap('deselect', last_selected);
            }
            if (info.location)
            {
                vmap_handler.vectorMap('select', cities_codes[info.location]);
            }
            last_selected = cities_codes[info.location];
        }
    });
});

