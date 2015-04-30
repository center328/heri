define([
    'jquery',
    'mustache',
    'parser/heri.js'
],function ($, mustache, heri) {
    var tmpl = {
        'bubble': '<div class="row col-lg-12 bubble">{{text}}</div>'
    }
    return {
        start: function () {
            console.log('loading application');

            // setup button binding
            $('button').click(function () {
                var val = $('input').val();
                var render = mustache.render(tmpl.bubble, {text: heri.parse(val)});
                $('#response').prepend(render);
            });
        }
    };
});
