const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


router.all('*',(req,res,next)=>{
    req.app.locals.layout = 'home';
    next();
 });

router.get('/',(req,res)=>{

    const perPage =10;
    const page = req.query.page || 1;

    Post.find({}).populate('user')
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .then(posts=>{

        Post.count().then(postCount=>{
            Category.find({}).then(categories=>{
                        res.render("home/index",{
                            posts:posts,
                            categories:categories,
                            current : parseInt(page),
                            pages:Math.ceil(postCount / perPage)
                        });
                    });

        });

        
        
    });
});

router.get('/about',(req,res)=>{
    res.render("home/about");
});




router.get('/login',(req,res)=>{
    res.render("home/login");
});

passport.use(new LocalStrategy({usernameField:'email'},(email,password,done)=>{
  //  console.log(email,password);
    User.findOne({email:email}).then(user=>{
        if(!user)return done(null,false,{message:'No user found'});
        bcrypt.compare(password,user.password,(err,matched)=>{
            if(err) return err;
            if(matched) 
               return done(null,user);
             else 
               return done(null,false,{message:'Incorrect password.'});  
        });
    })
}));

passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        done(err,user);
    })
});

router.post('/login',(req,res,next)=>{

    passport.authenticate('local',{
        successRedirect:'/admin',
       failureRedirect:'/login',
        failureFlash:true,

    })(req,res,next);

   // res.send("post works");
});

router.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/login');
})

router.get('/register',(req,res)=>{
    res.render("home/register");
});

router.post('/register',(req,res)=>{

    let errors = [];
    

if(!req.body.firstName){
  errors.push({message:'please add a first Name'});
}
if(!req.body.lastName){
  errors.push({message:'please add a last Name'});
}
if(!req.body.email){
    errors.push({message:'please add an E-mail'});
}
if(!req.body.password){
    errors.push({message:'please enter a password'});
}
if(!req.body.passwordConfirm){
    errors.push({message:'please add an password confirmation'});
}
if(req.body.password !== req.body.passwordConfirm){
    errors.push({message:"password field doesn't match"});
}

if(errors.length > 0){
  res.render('home/register',{
    errors:errors,
    firstName :req.body.firstName,
    lastName :req.body.lastName,
    email :req.body.email,

  });
}else{

    User.findOne({email:req.body.email}).then(user=>{
        if(!user){
    const newUser = new User({
        firstName :req.body.firstName,
        lastName :req.body.lastName,
        email :req.body.email,
        password :req.body.password,
    });

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(newUser.password,salt,(err,hash)=>{
            newUser.password = hash;
            newUser.save().then(savedUser=>{
            req.flash('success_message','You are now registered,please login to continue')    
            res.redirect('/login');
    });

        })
    })
        }else{
            req.flash('error_message','That email already exists please try again');
            res.redirect('/login');
        }
    });



    

}

});

router.get('/post/:slug',(req,res)=>{

    Post.findOne({slug:req.params.slug})
    .populate({path:'comments', match:{approveComment:true}, populate:{path:'user',models:'users'}})
    .populate('user')
    .then(post=>{
        //console.log(post);
        Category.find({}).then(categories=>{
            res.render("home/post",{post:post,categories:categories});
        })
        
    })
  
});

module.exports = router;