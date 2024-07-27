// POST /admin/signup Description: Creates a new admin account. Input: { username: 'admin', password: 'pass' } Output: { message: 'Admin created successfully', token: 'jwt_token_here' }
// POST /admin/login Description: Authenticates an admin. It requires the admin to send username and password in the headers. Input: Headers: { 'username': 'admin', 'password': 'pass' } Output: { message: 'Logged in successfully', token: 'jwt_token_here' }
// POST /admin/courses Description: Creates a new course. Input: Headers: { 'Authorization': 'Bearer jwt_token_here' }, Body: { title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true } Output: { message: 'Course created successfully', courseId: 1 }
// PUT /admin/courses/:courseId Description: Edits an existing course. courseId in the URL path should be replaced with the ID of the course to be edited. Input: Headers: { 'Authorization': 'Bearer jwt_token_here' }, Body: { title: 'updated course title', description: 'updated course description', price: 100, imageLink: 'https://updatedlinktoimage.com', published: false } Output: { message: 'Course updated successfully' }
// GET /admin/courses Description: Returns all the courses. Input: Headers: { 'Authorization': 'Bearer jwt_token_here' } Output: { courses: [ { id: 1, title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true }, ... ] } User Routes:
// User routes
// POST /users/signup Description: Creates a new user account. Input: { username: 'user', password: 'pass' } Output: { message: 'User created successfully', token: 'jwt_token_here' }
// POST /users/login Description: Authenticates a user. It requires the user to send username and password in the headers. Input: Headers: { 'username': 'user', 'password': 'pass' } Output: { message: 'Logged in successfully', token: 'jwt_token_here' }
// GET /users/courses Description: Lists all the courses. Input: Headers: { 'Authorization': 'Bearer jwt_token_here' } Output: { courses: [ { id: 1, title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true }, ... ] }
// POST /users/courses/:courseId Description: Purchases a course. courseId in the URL path should be replaced with the ID of the course to be purchased. Input: Headers: { 'Authorization': 'Bearer jwt_token_here' } Output: { message: 'Course purchased successfully' }
// GET /users/purchasedCourses Description: Lists all the courses purchased by the user. Input: Headers: { 'Authorization': 'Bearer jwt_token_here' } Output: { purchasedCourses: [ { id: 1, title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true }, ... ] }


const express=require('express');
const jwt=require("jsonwebtoken");
const app=express();
const z=require('zod');
const fs=require('fs')
let jwtPassword="123dsde"
let jwtPasswordUsers="ghdhasvfhd3344"
app.use(express.json())
const cors=require("cors")
app.use(cors())



function nameValidation(req,res,next){
    const schema=z.string().email()
    console.log("name validation")
   
    const username=req.body.username;
    
    console.log(req.body)

    
    result=schema.safeParse(username);
    if (!(result.success)){
      console.log("lavda")

        res.status(401).json({msg:"invalid username"})
    }
    else{
      // console.log("name validated")
        next()
    }

}
function passwordValidation(req,res,next){
    const schema=z.string().regex(/^\d+$/).min(5);
    const username=req.body.username;
    const password=req.body.password;
    result=schema.safeParse(password);
    if (!result.success){
        res.sendStatus(401)
    }
    else{
      // console.log("password validaTED")
        next()
    
}
}
//  let admins=[];
//  let courses=[];
//  let users=[];

//   try{admins= JSON.parse(fs.readFileSync('admin.json','utf-8'));
//   courses=JSON.parse(fs.readFileSync('course.json','utf-8'));
//   users=JSON.parse(fs.readFileSync('user.json','utf-8'))
// }
// catch{
//     admins=[];
//     courses=[];
//     users=[];
// }
let admins= JSON.parse(fs.readFileSync('admin.json','utf-8'));
let   courses=JSON.parse(fs.readFileSync('course.json','utf-8'));
 let  users=JSON.parse(fs.readFileSync('user.json','utf-8'))
 

function jwtAuthentication(req,res,next){
    // console.log('authentication')
   const  token=req.headers.authorization;
    // console.log("authentication begun")
    // console.log(token)
    if (token){
         jwt.verify( token,jwtPassword , (err,user)=>{
            if (err) {
                res.status(403).end();
            }
            else{
                req.user=user;
                
            next()
            }
            
        
    })
    }else{
        res.status(401).end();
    }

}

app.post('/admin/sign-up', nameValidation,passwordValidation,(req,res)=>{
     const username=req.body.username;
    const password=req.body.password;
const filtered=admins.filter(elements=> elements.username===username)
if (filtered.length>0){
    res.status(409).end();                                //409 ststus code for conflictiog resourses;
    
}
else{
    newElement={username,password}
    admins.push(newElement);
    fs.writeFileSync('admin.json',JSON.stringify(admins))
    const token=jwt.sign({username,password},jwtPassword);
    console.log("new user created")
    res.status(200).json({msg:"user created succesfully",token:token})
}
})
app.get("/admin/me",jwtAuthentication,(req,res)=>{
    res.json({username:req.user.username})
    
})
app.post('/admin/sign-in',nameValidation,passwordValidation, (req, res) => {
    const { username, password } = req.body;
    const element = admins.find(element => element.username === username);

    if (!element) {
        res.status(401).json({ msg: "User not found" });
    } else {
        if (element.password !== password) {
            res.status(403).json({ msg: "Incorrect password" });
        } else {
            const token = jwt.sign({ username, password }, jwtPassword);
            res.status(200).json({ msg: "User found successfully", token: token });
        }
    }
});
app.post('/admin/courses',jwtAuthentication,(req,res)=>{
    const newCourse=req.body;
    newCourse.id=(courses.length+1)
    courses.push(newCourse);
    fs.writeFileSync('course.json',JSON.stringify(courses));
    res.status(200).json({
        msg:"course created succesfully",courseId:newCourse.id
    })
       
})
app.put('/admin/courses/:courseId',jwtAuthentication,(req,res)=>{
   const courseId=req.params.courseId
  
   const updatedCourse=req.body;
   const finalId=parseInt(courseId)
    let targetCourse=courses.filter(element=>element.id==finalId)
    if (!targetCourse){res.status(403).json({msg:"course id could not be found"})}
    targetCourse=updatedCourse;
    targetCourse.id=finalId;
    console.log(targetCourse.id-1)
    courses[(targetCourse.id-1)]=targetCourse;
    fs.writeFileSync("course.json",JSON.stringify(courses))
    console.log(courses)
    
    res.status(200).json({msg:"course edited succesfully"})
})
app.get("/admin/courses",jwtAuthentication,(req,res)=>{
  res. status(200).json(courses)
})

// user routes

app.post("/user/sign-up",nameValidation,passwordValidation,(req,res)=>{
  const {username,password}=req.body;
  const userFound=users.find(element=> element.username==username);
  if (userFound){
    res.sendStatus(409).end();
  }
   else{let newUser={username:username,password:password}
   users.push(newUser);
   fs.writeFileSync("user.json",JSON.stringify(users));
   console.log('new user added')
   const token=jwt.sign({username,password},jwtPasswordUsers);
   res.status(200).json({msg:"user added succesfully",token})
 }

   
})
app.post('/user/sign-in',nameValidation,passwordValidation,(req,res)=>{
  const {username,password}=req.body;
  let foundUser=users.find(element => element.username==username);
  if (!foundUser) {res.sendStatus(404)}
  if (foundUser.password!==password){
    res.send(403).json({msg:"invalid password"})
  }
  else{
    token=jwt.sign({username,password},jwtPasswordUsers)
    res.status(200).json({msg:"user logged in successfully",token})
  }

})


app.listen((3000),()=>{
    console.log('listening to port 3000')
})