var helper ={
    parsePrice: function (num) {

        function isInteger(obj) {
            return Math.floor(obj) === obj
        }

        var p = (num / 100);
        // p.toFixed(1)
        if (isInteger(p)) {
            return parseInt(p)
        } else if (Number(p.toFixed(2)) == Number(p.toFixed(1))) {
            return p.toFixed(1)
        } else {
            return p.toFixed(2)
        }

    },
}
module.exports = helper;
