(() => {

    'use strict';

    var express = require('express');
    var app = express();
    var exec = require('child_process').exec;
    var async = require('async');

    var v1Router = express.Router();

    var staticPaths = [
        '/scripts',
        '/styles'
    ];

    var port = process.env.PORT || 1234;

    v1Router.post('/shell', (req, res, next) => {
        var json = '';

        req.on('data', data => json += data);

        req.on('end', () => {
            if (json) {
                var data = JSON.parse(json);
                var commands = data.commands;
                var output = [];

                if (commands && Array.isArray(commands)) {
                    commands = commands.map(cmd => callback => {
                        exec(cmd, (err, stdout, stderr) => {
                            if (stdout || stderr) {
                                output.push(stdout || stderr);
                            }

                            callback();
                        });
                    });

                    async.series(commands, err => {
                        if (err) {
                            return next(err);
                        }
                        res.json({
                            output: output
                        });
                    });
                }
            }
        });
    });

    app.use('/api/v1', v1Router);

    //Make these directories static so that their files can be served.
    staticPaths.map(p => app.use(p, express.static(__dirname.concat(p))));

    app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`));

    app.listen(port, function() {
        console.log(`Listening on port ${port}.`);
    });

})();