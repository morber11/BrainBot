fs = require('fs');
const TWO_MILLION = 2000000;

var brain = "";
for (let i = 0; i < TWO_MILLION; ++i)
    brain += "brain ";

fs.writeFile("./brains.txt", brain, function (err) {
    if (err)
        return console.log(err);
        console.log("Brains written");
});