const { postitem } = require("../models/category");
const messageschema = require("../models/messages");
require("dotenv").config({ path: "../../.env" });
// const { requestitem } = require("../models/category");
const { requireSignin, userMiddleware } = require("../middleware");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const shortid = require("shortid");
var aws = require("aws-sdk");
var multerS3 = require("multer-s3");
// const upload=multer({dest:'uploads/'})
const path = require("path");
const log = console.log;
const SignUp = require("../models/signup");
const category = require("../models/category");
const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51N5bDDSG9fEPKjvoUx9GroQUA9UQfkYeirLC8G4CVdQU7tem9hALpWG2LJe03HIL7t8AAuJtZNSoqHp1tVr8dqS000E3Yx0upg"
);
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, shortid.generate() + "-" + file.originalname + "-" + Date.now());
//   },
// });

// var upload = multer({ storage });

// const AWS = new aws.S3({
//   accessKeyId: process.env.AWSACCESSKEY,
//   secretAccessKey: process.env.AWSSECRETACCESSKEY,
// });

const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");

// const config = require("../config/firebase.config");
const firebaseConfig = require("../config/firebase.config");

//Initialize a firebase application
initializeApp(firebaseConfig.firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });

// var uploadS3 = multer({
//   storage: multerS3({
//     s3: AWS,
//     bucket: "lost-and-found-system",
//     acl: "public-read",
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       cb(null, shortid.generate() + "-" + file.originalname + "-" + Date.now());
//     },
//   }),
// });

router.post(
  "/postitem",
  requireSignin,
  userMiddleware,
  upload.single("itemPictures"),
  async (req, res) => {
    // console.log(req)
    console.log("Hitted the POST successfully ");
    try {
      console.log("try");
      const { name, description, question, type } = req.body;
      console.log(req.files);
      console.log(req.body);
      // console.log(createdBy)
      // var itemPictures = [];
      // if (req.files.length > 0) {
      //   itemPictures = req.files.map((file) => {
      //     return { img: file.key };
      //   });
      // }

      const dateTime = giveCurrentDateTime();

      const storageRef = ref(
        storage,
        `files/${req.file.originalname + dateTime}`
      );

      // Create file metadata including the content type
      const metadata = {
        contentType: req.file.mimetype,
      };

      // Upload the file in the bucket storage
      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      );
      //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

      // Grab the public url
      const itemPictures = await getDownloadURL(snapshot.ref);
      console.log({ itemPictures });
      //Saving data to db
      const imageDetails = {
        img: itemPictures,
      };
      const newPost = await postitem.create({
        name: name,
        description: description,
        question: question,
        type: type,
        createdBy: req.user._id,
        itemPictures: imageDetails,
      });
      await newPost.save((error, item) => {
        if (error) return res.status(400).json({ error });
        if (item) return res.status(201).json({ item });
      });
      // upload.single('image')

      // if(req.body.itemPictures!=''){
      //   console.log(":Executed:")
      //   newPost.insert({itemPictures:req.body.itemPictures})
      // }

      // sendToken(newSignup,201,req,res)
      // console.log(newPost);
      // res.status(200).json({
      //   body:req.body,
      //   file:req.files
      // });
      // res.send("Done")
    } catch (err) {
      console.log("Error", err);
      res.status(401).json({
        "Message is": err.message,
      });
    }
  }
);

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  return dateTime;
};
// router.post("/founditem", requireSignin, userMiddleware, async (req, res) => {
//   try {
//     console.log(req.body.name,req.body.description,req.body.itemPictures,req.user._id)
//     const newRequest = await requestitem.create({
//       name: req.body.name,
//       description: req.body.description,
//       itemPictures:req.body.itemPictures,
//       createdBy: req.user._id,
//     });
//     // sendToken(newSignup,201,req,res)
//     console.log(newRequest);
//     res.status(200).json({
//       message: "Request Done",
//     });
//     // res.send("Done")
//   } catch (err) {
//     res.status(401).json(err.message);
//   }
// });
router.get("/getitem", async (req, res) => {
  const postitems = await postitem.find({ itemStatus: false });

  // let items_list=[]
  // postitems.map((item)=>{
  //   // console.log(item.createdBy)
  //   SignUp.find({_id:item.createdBy}).lean()
  //   .exec((error,info)=>{
  //     if (error) res.status(400).json({'error':error})
  //     // res.json(info)
  //     // console.log(info[0].username)
  //     // res.status(200).json({
  //     // console.log(typeof(item))
  //     item.username=info[0].username
  //     console.log(item)
  //     items_list.push(item)
  //     // console.log(items_list)
  //     // })
  //   })
  // })
  return res.status(200).json({
    postitems,
  });
});

router.get("/item/:id", (req, res) => {
  const { id } = req.params;
  // console.log(id)
  postitem.find({ _id: id }).exec((err, item) => {
    if (err) return res.status(400).json({ Error: err });
    // console.log(item)
    messageschema.find({ itemId: item[0]._id }).exec((err, answers) => {
      if (err) return res.status(400).json({ Error: err });

      // console.log(answers)
      res.status(200).json({
        Item: item,
        Answers: answers,
      });
    });
  });
});

router.post("/edititem", upload.array("itemPictures"), async (req, res) => {
  const { id, name, description, question, type, createdBy, olditemPictures } =
    req.body;
  console.log(req.files);
  // console.log(req.body)
  // console.log(id)
  console.log(olditemPictures);

  var itemPictures = [];
  if (req.files.length > 0) {
    itemPictures = req.files.map((file) => {
      return { img: file.filename };
    });
  }
  let item = {
    name: name,
    description: description,
    type: type,
    question: question,
    createdBy: createdBy,
  };
  if (olditemPictures) {
    console.log("Old one");
    let itemPictures = [];
    itemPictures = olditemPictures.map((pic) => {
      return { img: pic };
    });
    item.itemPictures = itemPictures;
  } else {
    console.log("New one ", itemPictures);
    item.itemPictures = itemPictures;
  }
  // console.log(item)
  const updateItem = await postitem.findOneAndUpdate({ _id: id }, item, {
    new: true,
  });
  res.status(200).json({
    updateItem,
  });
});

router.post("/deleteitem", async (req, res) => {
  const { item_id } = req.body;
  console.log("Item id is :", item_id);
  const deleteitem = await postitem.findOneAndDelete({ _id: item_id });
  const deletemsgs = await messageschema.deleteMany({ itemId: item_id });

  res.status(200).json({
    body: req.body,
  });
});

router.get("/getnumber/:id", (req, res) => {
  const { id } = req.params;
  console.log("Id is :", id);
  SignUp.find({ _id: id }).exec((err, user) => {
    res.status(200).json({
      Number: user[0].number,
    });
  });
});

router.get("/getquestion/:id", (req, res) => {
  const { id } = req.params;
  console.log("Id is :", id);
  postitem.find({ _id: id }).exec((err, item) => {
    if (err) return res.status(400).json({ Error: err });

    // console.log(item)
    // console.log(item[0].createdBy)
    const createdBy = item[0].createdBy;
    SignUp.find({ _id: createdBy }).exec((err, user) => {
      res.status(200).json({
        Question: user[0].number,
      });
    });
  });
});

router.post("/submitAnswer", async (req, res) => {
  console.log(req.body);
  const { itemId, question, answer, givenBy, belongsTo } = req.body;
  // postitem.find({_id:itemId}).exec(((err,user)=>{
  //   console.log(user[0].createdBy)
  //   belongsTo=user[0].createdBy
  // }))

  const newmessage = await messageschema.create({
    itemId: itemId,
    belongsTo: belongsTo,
    question: question,
    answer: answer,
    givenBy: givenBy,
  });

  newmessage.save((error, item) => {
    if (error) return res.status(400).json({ error });
    if (item) return res.status(201).json({ item });
  });
});

router.get("/myresponses/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Used Id is :", id);
  const item = await messageschema.find({ givenBy: id });
  // if (err) return res.status(400).json({ Error: err });

  console.log(item);
  res.status(200).json({
    item: item,
  });
});

router.get("/mylistings/:id", (req, res) => {
  const { id } = req.params;
  console.log("Used Id is :", id);
  postitem.find({ createdBy: id }).exec((err, item) => {
    if (err) return res.status(400).json({ Error: err });

    // console.log(item)
    res.status(200).json({
      item: item,
    });
  });
});

router.post("/confirmResponse/:id", async (req, res) => {
  const { id } = req.params;
  // console.log("Used Id is :",id)
  console.log(id);
  console.log(req.body);
  await messageschema.updateOne(
    { _id: id },
    { $set: { response: req.body.response } },
    { upsert: false },
    (err, updatedMessage) => {
      if (err) return res.status(400).json({ msg: err });
    }
  );

  const items = await messageschema.findOne({ _id: id });
  const itemId = items.itemId;
  const item = await postitem.findOneAndUpdate(
    { _id: itemId },
    { itemStatus: true }
  );

  const claim = await messageschema.findOneAndUpdate(
    { itemId },
    { response: "Yes" }
  );
  console.log(item);
  res.status(200).json({ msg: "Updated" });
});

//create router for stripe payment initialisation
router.get("/payment", async (req, res) => {
  try {
    const price = req.query.price;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "LOST AND FOUND",
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],

      success_url: `http://localhost:3000`,
      cancel_url: `http://localhost:3000`,
    });
    res.redirect(303, session.url);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
