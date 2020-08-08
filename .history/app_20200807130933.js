//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require ("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:2m7017/todolistDB", { useNewUrlParser: true });

const itemsSchema = {

  // example of required field validation

  name: {
    type: String,
    required: [true, 'Must enter todolist item name']
  },
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this do delete an item."
});

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

// const day = date.getDate();
  // res.render("list", {listTitle: day, newListItems: items});

  Item.find({}, function(err, items){
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items inserted successfully.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item ({
    name: itemName
  });

  item.save();

  res.redirect("/");
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemID, function(err) {
    if (err) {
      console.log("Delete ERROR:  ", err);
    }
  });
  res.redirect("/");
});

app.get("/:postName", function(req,res){
  res.render("list", {listTitle: req.params.postName, newListItems: items});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
