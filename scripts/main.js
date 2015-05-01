define([
    'jquery',
    'mustache',
    'machina',
    'lodash',
    'parser/heri.js'
], function ($, mustache, machina, _, heri) {
    var tmpl = {
        'bubble': '<div class="row col-lg-12 bubble">{{text}}</div>'
    };

    var heriStateMachine = new machina.Fsm({
        initialState: 'unknownUser',
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
                    console.log('arguments: ', arguments);
                    return 'Hello, please tell me your name.';
                }
            },
            knownUser: {
                getMessage: function () {
                    console.log('arguments: ', arguments);

                    return 'What can I help you with?'
                },
            },
            requestFromUnknownUser: {
                getMessage: function () {
                    return "I see you're requesting {{request}}; however, first tell me your name";
                }
            },
            requestFromPreviouslyUnknownUser: {
                getMessage: function () {
                    return "Thanks {{user.name}}, Now that I know who you are I'll check on your request."
                }
            },
            ptoRequest: {
                getMessage: function () {
                    return '{{user.name}}, you currently have 36 hours.';
                }
            }
        }
    });

    var app = {
        state: {
            user: {}
        },
        speakUp: true,
        pendingRequests: [],
        say: function () {
            var message = heriStateMachine.handle('getMessage');
            var personalizedMessage = mustache.render(message, this.state);

            var renderedText = mustache.render(tmpl.bubble, {text: personalizedMessage});

            if(this.speakUp === true){
                var utterance = new SpeechSynthesisUtterance(personalizedMessage);
                utterance.voice = speechSynthesis.getVoices()[1];

                setTimeout(function () {
                    speechSynthesis.speak(utterance);
                },100);
            }

            $('#response').prepend(renderedText);
        },
        clearMessages: function () {
            $('#response').html('');
        },
        clearInput: function () {
            $('input').val('').focus();
        },
        setupSpeechRecognition: function () {
            var recognition = new webkitSpeechRecognition();
            var debouncedAcceptRequest = _.debounce(this.acceptRequest.bind(this), 1000);

            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.start();

            recognition.onresult = function (e) {
                var interim_transcript = '';
                var finalTranscript = '';

                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interim_transcript += event.results[i][0].transcript;
                    }
                }

                $("#commandline").val(finalTranscript);

                debouncedAcceptRequest();

            };

        },
        setupButtons: function () {
            var self = this;

            $('#listen').click(function () {
                self.setupSpeechRecognition();
            });

            $('#speak').click(function () {
                self.speakUp = true;
            });

        },
        acceptRequest: function () {
            var val = $('input').val(),
                args = null,
                result = heri.parse(val);

            if (/,/.test(result)) {
                var returned = result.split(','),
                    method = returned[0];

                args = returned[1];

                this[method](args);
            } else {
                this[result]();
            }

            this.say();
        },
        start: function () {
            var self = this;

            this.setupButtons();

            // setup button binding
            $('button').click(this.acceptRequest.bind(this));

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
            this.state.user.name = name;

            if (heriStateMachine.state === 'requestFromUnknownUser') {
                heriStateMachine.transition('requestFromPreviouslyUnknownUser');

                // execute previous request.
                this.clearMessages();

                this[this.pendingRequests.pop()]();

            } else {
                heriStateMachine.transition('knownUser', name);
            }
        },
        getPTO: function () {
            console.log('heriStateMachine.state: ', heriStateMachine.state);
            // if user is unknown,
            if (heriStateMachine.state === 'unknownUser') {
                // then transition to "request for unknown user"
                heriStateMachine.transition('requestFromUnknownUser');

                // put the request on a local stack,
                this.pendingRequests.push('getPTO');

                // on exit of that state,
                // then transition to request on stack
                // by the time that request is handled the current user state is known

                console.log('pto request from unknown user');
            } else {
                heriStateMachine.transition('ptoRequest');
            }
        }
    };

    window.app = app;

    return app;
});
