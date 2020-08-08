//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://clarson80210:E6EbXaZ4m3UhrXZ@clarson10024.ycj6m.mongodb.net/todolistDB",
  { useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true});

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

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

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

  const listName = req.body.list;
  const itemName = req.body.newItem;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
      List.findOne({name: listName}, function(err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
  }
});

app.post("/delete", function(req, res){

  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err) {
      if (err) {
        console.log("Delete ERROR:  ", err);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: { _id: checkedItemID}}},
      function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        } else {
          console.log("List Delete ERROR: ", err);
        }
    });
  }
});

app.get("/:listName", function(req,res){

  const listName = _.capitalize(req.params.listName);

  List.findOne({name: listName}, function (err, foundList) {
    if(!err) {
      if(!foundList) {

      //create a new list

      const list = new List ({
        name: listName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + listName);

    } else {

      //show existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }}
  });
});

app.get("/about", function(req, res){
  res.render("about");
});


//process.env.PORT is for heroku  5500 is local port

let port = process.env.PORT;

if (port == null || port == ""){
  port = 5500;
}

app.listen(port, function () {
  console.log ("Server started on port:  ", port);
});

