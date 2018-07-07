const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var CategorySchema =new Schema({

        name:{
            type:String,
            require:true
        },

});



module.exports = mongoose.model('categories',CategorySchema);
