if(process.env.NODE_ENV ==='production'){

    module.exports = require('./prod-detabase');
}else{
    module.exports = require('./dev-detabase');
}