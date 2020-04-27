const express = require("express");
const router = express.Router();
const multer = require("multer");

const MIME_TYPE_MAP ={
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg'
};

const Inventory = require('../models/inventory');

const storage =multer.diskStorage({
  destination: (req, file ,cb) =>{
    const isValid  = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("mime type invalid");
    if(isValid){
      error = null;
    }
    cb(error, "backend/images");
  },
  filename :(req, file ,cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});


router.post("",multer({storage: storage}).single("image"),(req,res,next)=>{
  const url =req.protocol + '://' + req.get("host");
  const inventory = new Inventory({
    name: req.body.name,
    quantity: req.body.quantity,
    batchId: req.body.batchId,
    expireDate: req.body.expireDate,
    imagePath : url + "/images/" + req.file.filename
    });
  inventory.save().then(createdInventory=>{
  res.status(201).json({
      message:'Inventory Added Successfully',
      inventory: {
        ...createdInventory,
        id : createdInventory._id

      }
      });
  });
});


router.put("/:id", (req,res,next)=>{
  const inventory = new Inventory({
    _id: req.body.id,
    name: req.body.name,
    quantity: req.body.quantity,
    batchId: req.body.batchId,
    expireDate: req.body.expireDate
  });
  Inventory.updateOne({_id: req.params.id}, inventory).then(result => {
    console.log(result);
    res.status(200).json({message : "Update Successful !"});
  });
});


router.get("",(req,res,next)=>{
  Inventory.find().then(documents=>{
    res.status(200).json({
      message : 'inventory added sucessfully',
      inventorys :documents
    });
  });
});


router.get("/:id",(req,res,next)=>{
  Inventory.findById(req.params.id).then(inventory =>{
    if(inventory){
      res.status(200).json(inventory);
    }else{
      res.status(200).json({message:'Inventory not found'});
    }
  });
});


router.delete("/:id", (req, res, next) => {
  Inventory.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: 'Inventory deleted!' });
  });
});

module.exports = router;
