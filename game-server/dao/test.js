var mongoose = require('mongoose');
var testSchema = mongoose.Schema({
    name: String,
    pwd: String,
});
var Test = mongoose.model('test', testSchema);
module.exports.save = function() {
    var test = new Test({ name: 'kaka', pwd: '111113'});
    test.save(function (err) {
        if (err)
            console.log('false');

    });
}
/*
Kitten.find(function (err, kittens) {
    console.log('aaaaaaaaaaaaaaaaaaaaa');
    if (err) return console.error(err);
    console.log(kittens);
})*/
