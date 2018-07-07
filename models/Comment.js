const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var CommentSchema =new Schema({

        user:{
            type:Schema.Types.ObjectId,
            ref:'users'
        },
        approveComment:{
            type:Boolean,
            default:false
        },

        body:{
            type:String,
            require:true
        },
        date:{
            type:Date,
            default:Date.now()
        }

});



module.exports = mongoose.model('comments',CommentSchema);
