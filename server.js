// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var router = express.Router();
var assert = require('assert');
// var objectID = require('mongojs').ObjectID;

var PORT = 3000;
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

//Set handlebars as the default templating engine:
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData", "discussions"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

var MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URL, {useNewUrlParser: true}, { useUnifiedTopology: true });

// Main route (simple Hello World Message)
app.get("/testJSON", function(req, res) {
    db.scrapedData.find({}, function(error, found) {
        // Throw any errors to the console
        if (error) {
          console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
          res.json(found);
        }
      });
});
  
 

  //Retrieve Data from db
  app.get("/", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}).sort({'_id': -1 }).toArray(function(error, found) {
      
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.render("index", {stories: found});
      }
    });
  });

 //Update for a new comment
 app.post('/update-comment', function(req, res,) {
   console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
   console.log("ID: " + req.body.id);
   console.log("Author: " + req.body.author);
   console.group("Comment: " + req.body.content);
    let objectId = "Object("+ req.body.id +")";
    console.log(objectId);

   db.scrapedData.update({"_id": objectId }
    , {
     $push: {
       "comments": {author: req.body.author, content: req.body.content}
        }
     }, function(err, post) {
      console.log("Updated with Comment");
   });
 })


  
  // Scrape data from one site and place it into the mongodb db
  app.get("/api/scrape", function(req, res) {
    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://www.newsweek.com/newsfeed").then(function(response) {
      // Load the html body from axios into cheerio
      let $ = cheerio.load(response.data);
      // For each element with a "title" class
      $(".inner").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        let title = $(element).children("h3").children("a").text();
        let link = "https://www.newsweek.com" + $(element).children("h3").children("a").attr("href");
        let summary = $(element).children(".summary").text();
        let comments = {};
  
        // If this found element had both a title and a link
        if (title && link && summary) {
          // Insert the data in the scrapedData db
          db.scrapedData.insert({
            title: title,
            link: link,
            summary: summary,
            comments: comments
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
            else {
              // Otherwise, log the inserted data
              console.log("Scraped data inserted");
            }
          });
        }
      });
    });
  
    // Send a "Scrape Complete" message to the browser
    console.log('Referesh Worked');
  });
  
  
  // Listen on port 3000
  app.listen(PORT, function() {
    console.log("App running on port " + PORT);
  });