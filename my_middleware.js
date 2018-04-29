module.exports = function(options) {
    return function(req, res, next) {
        // Implement the middleware function based on the options object
        console.log('-------')
        console.log(options)
        console.log('-------');
        
        next()
    }
}