use strict;

fs = require('fs');

var dir = './brains';
const TWO_MILLION = 2000000;
const WEAK = 1000;
var brain = "";
if (!fs.existsSync(dir))
    fs.mkdirSync(dir);


// we braining
for (let i = 0; i < WEAK; ++i) {
    brain += "brain ";
    fs.writeFile("./brains/brain".concat(i), "brain brain brain brain", function (err) {
        if (err)
            return console.log(err);
    });
}

fs.writeFile("./brains.txt", brain, function (err) {
    if (err)
        return console.log(err);
    console.log("Brains written");
});

