const express = require('express');
const router = express.Router();
const date = require(__dirname + '/datesModule');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
// Load the full build.
const _ = require('lodash');

let items = []

// getting-started.js
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://rellika-admin:rkisyula12@cluster0-fklyc.mongodb.net/todolistdb', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

const itemSchema = new mongoose.Schema({
    name: String,
    done: Boolean
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model('List', listSchema);

/* GET home page. */
router.get('/', function (req, res, next) {
    Item.find({done: false}, {}, function (err, todos) {
        res.render('index',
            {
                title: 'Today',
                date: date().currentDay,
                className: date().className,
                items: todos
            });
    });

});

router.post('/', function (req, res) {
    const itemName = req.body.todo;
    const listName = _.lowerCase(req.body.list);

    console.log(listName)

    const item = new Item({
        name: itemName,
        done: false
    });

    if (listName === "today") {
        item.save();
        res.redirect('/')
    } else {
        List.findOne({name: listName}, function (err, foundList) {
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect('/' + listName)
            }else{
                console.log(err);
            }
        });
    }

});


router.post('/delete', function (req, res, next) {
    const checkBoxItem = req.body.checkbox;
    const specificListName = _.lowerCase(req.body.specificListName);

    if (specificListName === "today") {
        Item.updateOne({_id: checkBoxItem}, {$set: {done: true}}, function (err) {
            if (!err) {
                res.redirect('/')
            } else {
                console.log(err);
            }
        });
    }else{
        List.findOneAndUpdate({name: specificListName},
            {$pull: {items: {_id: checkBoxItem}, $set: {done: true}}}, function (err) {
            if (!err) {
                res.redirect('/' + specificListName)
            } else {
                console.log(err);
            }
        });
    }
});


router.get("/:customListName", function (req, res) {
    const customListName = req.params.customListName;

    List.findOne({name: customListName}, function (err, foundList) {
        if (!err) {
            if (foundList) {
                res.render('index',
                    {
                        title: _.startCase(customListName),
                        date: date().currentDay,
                        className: date().className,
                        items: foundList.items
                    });
            } else {
                const list = new List({
                    name: customListName,
                    items: []
                });
                list.save();
                res.redirect('/' + customListName)
            }
        } else {
            console.log(err);
        }
    });
});
module.exports = router;
