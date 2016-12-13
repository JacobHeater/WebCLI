(function () {

    'use strict';

    $(function () {

        const $cli = $('.cli');
        const newLine = "\r\n";
        const empty = "";
        const KEY_CODE_ENTER = 13;
        const KEY_CODE_UP_ARROW = 38;

        var executedCommands = [];
        var lastCommandIdx;

        printIntro();

        $cli.keyup(e => {
            switch (e.which) {
                case KEY_CODE_ENTER:
                    invokeCommand();
                    break;
                case KEY_CODE_UP_ARROW:
                    copyLastCommand();
                    break;
                default:
                    break;
            }
        });

        function invokeCommand() {
            var lastLine = getLastLine().trim();

            if (lastLine) {
                var lowerTrimmed = lastLine.trim().toLowerCase();
                switch (lowerTrimmed) {
                    case 'go retro':
                        $cli.addClass('retro');
                        break;
                    case 'no retro':
                        $cli.removeClass('retro');
                        break;
                    case 'clear':
                        clearConsole();
                        break;
                    case 'clear history':
                        executedCommands.length = 0;
                        break;
                    default:
                        sendCommandToServer(lastLine, function (res) {
                            printToCli(res);
                        });
                        break;
                }
                executedCommands.push(lastLine);
                lastCommandIdx = undefined;
            }
        }

        function getLastLine() {
            var text = $cli.val();
            var newLineSplit = text.split(/\n/g);
            var noEmpties = newLineSplit.filter(s => !!s.trim());
            var lastLine = noEmpties[noEmpties.length - 1];
            return lastLine;
        }

        function printToCli(message) {
            if (Array.isArray(message)) {
                message = message.join(' ');
            }
            disableCli();
            var text = $cli.val();
            text += message;
            $cli.val(text);
            enableCli();
        }

        function disableCli() {
            $cli.attr('disabled', true);
        }

        function enableCli() {
            $cli.attr('disabled', false).focus();
        }

        function sendCommandToServer(cmd, done) {
            $.ajax({
                type: 'POST',
                url: './api/v1/shell',
                cache: false,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    commands: [cmd]
                })
            }).then(data => {
                var output = data.output;
                done(output);
            });
        }

        function printIntro() {
            printToCli("Welcome to the web CLI! :-)");
            printToCli([newLine, newLine]);
        }

        function clearConsole() {
            $cli.val('');
            printToCli('Cleared!' + newLine);
        }

        function copyLastCommand() {
            $cli.blur();
            disableCli();
            lastCommandIdx = lastCommandIdx ? lastCommandIdx - 1 : executedCommands.length - 1;
            var lastCommand = executedCommands[lastCommandIdx] || executedCommands[executedCommands.length - 1];
            if (lastCommand) {
                var text = $cli.val();
                text += newLine + lastCommand;
                $cli.val(text);
            }
            enableCli();
        }
    });

})();