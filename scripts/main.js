define([
    'jquery',
    'mustache',
    'machina',
    'parser/heri.js'
], function ($, mustache, machina, heri) {
    var tmpl = {
        'bubble': '<div class="row col-lg-12 bubble">{{text}}</div>'
    };

    var heriStateMachine = new machina.Fsm({
        initialState: 'uninitialized',
        states: {
            uninitialized: {
                "*": function () {
                    this.transition('unknownUser');
                }
            },
            unknownUser: {
                _onEnter: function () {
                    this.emit('unknownUser');
                },
                getMessage: function () {
                    return 'Hello, please tell me your name.';
                }
            },
            knownUser: {
                _onEnter: function () {
                    this.user = {
                        name: 'sam'
                    };
                },
                getMessage: function () {
                    return 'What can I help you with?'
                },
            },
            ptoRequest: {
                getMessage: function () {
                    console.log(this.user.name + ', you currently have 36 hours');
                    return this.user.name + ', you currently have 36 hours';
                }
            }
        }
    });

    var app = {
        user: null,
        say: function (message) {
            var renderedText = mustache.render(tmpl.bubble, {text: message});

            $('#response').prepend(renderedText);
        },
        start: function () {
            var self = this;

            // setup button binding
            $('button').click(function () {
                var val = $('input').val();

                var result = heri.parse(val);

                if (/,/.test(result)) {
                    var returned = result.split(','),
                        method = returned[0],
                        args = returned[1];

                    self[method](args);
                } else {
                    self[result]();
                }

                self.say(heriStateMachine.handle('getMessage'));
            });

            heriStateMachine.on('unknownUser', function () {
                console.log('unknown user');
            });

            heriStateMachine.on('knownUser', function (name) {
                self.user.name = name;
            });

        },
        greetings: function () {
            heriStateMachine.transition('unknownUser');
        },
        getName: function (name) {
            heriStateMachine.transition('knownUser', name);
        },
        getPTO: function () {
            heriStateMachine.transition('ptoRequest');
        },
        someCommand: function () {

            return 'hi2';
        }
    };

    window.app = app;

    return app;
});
