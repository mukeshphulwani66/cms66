const express  = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars'); 
const port = process.env.PORT;
const mongoose = require('mongoose');
const bodyParser  = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbUrl }= require('./config/database');
const passport = require('passport');


mongoose.Promise = global.Promise;

//connecting to database
mongoose.connect(mongoDbUrl).then((db)=>{
    console.log('mongo is connected successfully');
}).catch(err=>{
    console.log(err);
});

app.use(express.static(path.join(__dirname,'public')));
//our view engine

const {select , generateTime, paginate} = require('./helpers/handlebars-helpers');
app.engine('handlebars',exphbs({defaultLayout:'home',helpers:{select:select,generateTime:generateTime,paginate:paginate}}));
app.set('view engine','handlebars');

//upload middleware

app.use(upload());

//our body parser for post request
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//our method override
app.use(methodOverride('_method'));

app.use(session({
    secret:'codersneverquit',
    resave:true,
    saveUninitialized:true
}))
app.use(flash());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


//local variable
app.use((req,res,next)=>{
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.forms_error = req.flash('form_error');
    res.locals.error = req.flash('error');
    next();
})

const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

app.use('/',home);
app.use('/admin',admin);
app.use('/admin/posts',posts);
app.use('/admin/categories',categories);
app.use('/admin/comments',comments);

app.listen(port,()=>{
    console.log(`listening on ${port}`);
});