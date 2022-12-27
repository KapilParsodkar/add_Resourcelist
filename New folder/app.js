const express=require("express")
const bodyparser=require("body-parser")
const date=require(__dirname+"/date.js")
const mongoose=require("mongoose")
const app=express()


app.set("view engine","ejs")

app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/resourcelistDB")

const itemsch={
  name:String
}

const Item=mongoose.model("Item",itemsch)

const item1=new Item({
  name: "resource list"
})
const item2=new Item({
  name: "+ to add "
})
const item3=new Item({
  name: "- to delete"
})

const defaultitems=[item1,item2,item3]

const listsch={
  name:String,
  items:[itemsch]
}

const List=mongoose.model("List",listsch)


let a=[]
let resourceitems=[]
app.get("/",function(req,res){
  Item.find({},function(err,resourcefound){
   if(resourcefound.length===0){
    Item.insertMany(defaultitems,function(err){
      if(err){
        console.log("error")
      }else{
        console.log("saved to db")
      }
    })
    res.redirect("/")
   }else{

    let day=date.getDate()
    res.render("addr",{listtitle:day,newlistresource:resourcefound})
   }
  })


})

app.get("/:resourcelistname",function(req,res){
  const resourcelistname=req.params.resourcelistname

  List.findOne({name:resourcelistname},function(err,foundlist){
    if(!err){
      if(!foundlist){
      
      const list=new List({
        name:resourcelistname,
        items:defaultitems
    })
       list.save()
       res.redirect("/"+resourcelistname)
      }else{
        res.render("addr",{listtitle:foundlist.name,newlistresource:foundlist.items})
      }
    }
  })


})

app.post("/",function(req,res){
  const resourcename=req.body.newadd
  const resourcelist=req.body.button

  const item = new Item({
    name:resourcename
  })

  if(resourcelist===date.getDate()){

  item.save()
  res.redirect("/")
  }else{
    List.findOne({name:resourcelist},function(err,foundlist){
      foundlist.items.push(item)
      foundlist.save()
      res.redirect("/"+resourcelist)
    })
  }
})
app.post("/delete",function(req,res){
  const deleteitem=req.body.checkbox
  const listName=req.body.listName
  if(listName===date.getDate()){
    Item.findByIdAndRemove(deleteitem,function(err){
      if(err){
        console.log("error")
      }else{
        console.log("delete db")
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteitem}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listName)
      }
    })
  }

})



app.listen(3000,function(){
    console.log("server started on port 3000")
})
