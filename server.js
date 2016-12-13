(() => {

    'use strict';

    var express = require("express");
    var app = express();
    var exec = require("child_process").exec;
    var async = require("async");

    var v1Router = express.Router();

    v1Router.post("/shell", (req, res, next) => {
        var json = "";

        req.on("data", data => json += data);

        req.on("end", () => {
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

    app.use("/api/v1", v1Router);

    app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`));

    app.listen("1234", () => console.log("Listening on port 1234"));

})();