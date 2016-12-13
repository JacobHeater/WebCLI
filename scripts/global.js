(function (global) {
    global.runCommands = function (commands) {
        var commandsToSend = [];
        
        for (var i = 0; i < arguments.length; i++) {
            commandsToSend.push(arguments[i]);
        }

        $.ajax({
            type: 'POST',
            url: './api/v1/shell',
            cache: false,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                commands: commandsToSend
            })
        }).then(data => {
            var output = data.output;
            console.log.apply(console, output);
        });
    };
})(this);