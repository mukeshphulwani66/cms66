const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const { isEmpty,uploadDir } = require('../../helpers/upload-helpers');
const fs = require('fs');
const path =  require('path');
const Category = require('../../models/category');
const {userAuthenticated} = require('../../helpers/authentication');


router.all('*',userAuthenticated,(req,res,next)=>{
   req.app.locals.layout = 'admin';
   next();
});

router.get('/',(req,res)=>{

   Post.find({})
    .populate('category')
   .then(posts =>{
         res.render("admin/posts",{posts:posts});  
   })

});

router.get('/my-posts',(req,res)=>{
  Post.find({user:req.user.id})
    .populate('category')
   .then(posts =>{
         res.render("admin/posts/my-posts",{posts:posts});  
   })
});


router.get('/create',(req,res)=>{

  Category.find({}).then(categories=>{
    
     res.render("admin/posts/create",{categories:categories});
  });

  
});

router.post('/create',(req,res)=>{

let errors = [];
if(!req.body.title){
  errors.push({message:'please add a title'});
}
if(!req.body.body){
  errors.push({message:'please add a description'});
}

if(errors.length > 0){
  res.render('admin/posts/create',{
    errors:errors
  })
}else {      


  let filename = 'ye file ka name h';
  if(!isEmpty(req.files)){

    console.log('not empty');

      let file = req.files.file;
      filename = Date.now()+'-'+file.name;

      file.mv('./public/uploads/'+filename,(err)=>{
        if(err) throw err;
      });


  }else console.log('is empty');
  


let allowComments = true;
if(req.body.allowComments) allowComments = true;
else allowComments = false;

 let newPost =new Post({
      
       user:req.user.id,
       title: req.body.title,
       status: req.body.status,
       allowComments: allowComments,
       body: req.body.body,
       category:req.body.category,
       file:filename
   });

   newPost.save().then(savedPost =>{

  //  console.log(savedPost);
    
    req.flash('success_message',`Post ${savedPost.title} was created successfully`)


      res.redirect('/admin/posts');
   }).catch(err=>{

     console.log('could not save this post due to this '+err);
   });
  }
});

router.get('/edit/:id',(req,res)=>{

  Post.findOne({_id:req.params.id}).then(posts =>{

    Category.find({}).then(categories=>{
    
      res.render("admin/posts/edit",{post:posts,categories:categories});
   });
 
})

});


router.put('/edit/:id',(req,res)=>{

  Post.findOne({_id:req.params.id}).then(post =>{
  
    if(req.body.allowComments) allowComments = true;
    else allowComments = false;

    post.user = req.user.id;
    post.title = req.body.title;
    post.status = req.body.status;
    post.allowComments = allowComments;
    post.body = req.body.body;
    post.category=req.body.category;

    if(!isEmpty(req.files)){
  
        let file = req.files.file;
        filename = Date.now()+'-'+file.name;
        post.file = filename;
        file.mv('./public/uploads/'+filename,(err)=>{
          if(err) throw err;
        });
  
  
    }
      post.save().then(updatedPost=>{

      req.flash('success_message','Post was successfuly updated');

        res.redirect('/admin/posts/my-posts');
      })
  })
});

router.delete('/:id',(req,res)=>{

  Post.findOne({_id:req.params.id})
  .populate('comments')
  .then(post=>{
        fs.unlink(uploadDir + post.file,(err)=>{
         // console.log('removed img');
         //if comments are not present
         if(!post.comments.length < 1){
           post.comments.forEach(comment=>{
             comment.remove();
           })
         }

          post.remove().then(postRemoved=>{
            req.flash('success_message','post was successfully deleted');
            res.redirect('/admin/posts/my-posts');
          });
          
        })

     
  });

})


module.exports = router;