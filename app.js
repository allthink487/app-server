require('dotenv').config();

const express = require('express')

const cors = require('cors')

const multer = require('multer')

const path = require('path')

storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'uploads/')
    },
    filname: (req,file,cb)=>{
        cb(null,Date.now()+path.extname(file.originalname))
    }
})

const upload = multer({storage:storage})

const session = require('express-session')

const mysql = require('mysql2')

app = express()

app.use(session(
    {
        name:'sid',
        resave:false,
        saveUninitialized:false,
        secret:'jbkjbjbjbjbjbjb',
        cookie: {
            maxAge: 10000 * 60 ,
            secure:false,
            
            
        }
    }
))


connection = mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME
})

function createTbuser(){
sql = `CREATE TABLE user (
    id int AUTO_INCREMENT PRIMARY KEY ,
    email VARCHAR(255) UNIQUE,
    password int 
    )`
connection.query(sql,(err,result)=>{
    if(err){
        console.log(err)
    }
})}
function createTbposts(){
sql = `CREATE TABLE posts (
    id int AUTO_INCREMENT PRIMARY KEY ,
    publisher VARCHAR(255),
    titre VARCHAR(255),
    content TEXT,
    img TEXT
    )`
connection.query(sql,(err,result)=>{
    if(err){
        console.log(err)
    }
})}

function isAuthentifed(req,res,next){
    if(req.session.session_id){
        console.log(req)
        return next()
    }else{
        res.redirect("http://127.0.0.1:5500/connexion.html")
    }
}

app.use(express.json())

app.use(cors())

app.use(express.urlencoded({extended:true}))

app.use('/uploads',express.static('uploads'))

app.post('/formulaire',(req,res)=>{
    sql = `SELECT email FROM user WHERE email="${req.body.email}"`
    connection.query(sql,(err,user)=>{
        if(err){
            console.log(err)
        }else{
            
            if(user[0]){
            sql = `SELECT id,password FROM user WHERE password="${req.body.password}" AND email="${req.body.email}"`
            connection.query(sql,(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                  
                    if(result[0]){
                        
                        req.session.session_id = result[0].id
                        console.log('connexion')
                        console.log(req.session)
                       
                        
                        res.redirect('http://127.0.0.1:5500/post.html')
                    }else{
                        res.status('404').send('404 not founded mot de passe incorrect') 
                    }
                }
            })
            
    }else{
        res.status('404').send('404 not founded votre email est incorrect')  
    }
        }
    }) 
})
app.post('/inscription',(req,res)=>{
    sql = `INSERT INTO user (email,password) VALUES (?,?) `
    connection.query(sql,[req.body.email,req.body.password],(err,result)=>{
        if(err){
            console.log(err)
            res.status(404).send("votre email existe deja")
        }else{
            res.redirect('http://127.0.0.1:5500/post.html')

        }
    })
})
app.post('/publish',isAuthentifed,upload.array('img',10),(req,res)=>{
    
    connection.query(`SELECT email FROM user WHERE id=?`,[req.session.session_id],(err,publisher)=>{
        if(err){
            console.log(err)
        }
    else{
    
    publisher = publisher[0].email.replace('@gmail.com','').replace('@hotmail.com','').replace('@yahoo.com','')
    
    req.session.session_name = publisher
    console.log('publish')
    console.log(req.session)
    const filesname = req.files.map(file => `/uploads/${file.filename}`)
    sql =`INSERT INTO posts (publisher,titre,content,img) VALUES (?,?,?,?)`
    connection.query(sql,[publisher,req.body.name,req.body.describ,filesname.toString()],(err,result)=>{
        if(err){
            console.log(err)
        }
        res.redirect('http://127.0.0.1:5500/post.html')
        
    })}
    })
    
})
app.get('/sendpost',(req,res)=>{
    console.log('sendpost')
    console.log(req.session)
    sql = `SELECT * FROM posts`
    connection.query(sql,(err,result)=>{
        if(err){
            console.log(err)
        }
        res.json(result)
        
      
    })
    
})
app.get('/deconnexion',(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err)
        }else{
            res.redirect('http://127.0.0.1:5500/post.html')
        }
    })
})
/*app.get('/edit',(req,res)=>{
    res.redirect('http://127.0.0.1:5500/.html')
    console.log('edit')
    console.log(req.session)
})*/


app.listen(process.env.PORT,()=>{console.log("Server en ecoute...")})


