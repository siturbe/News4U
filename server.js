var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

//Set handlebars as the default templating engine:
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");


// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/News4U";
console.log(MONGODB_URI)
mongoose.connect(MONGODB_URI, {useNewUrlParser: true}, { useUnifiedTopology: true }, err=>console.log("Error: " + err));

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
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
      let saved = false;
      let note;

      // If this found element had both a title and a link
      if (title && link && summary) {
        // Insert the data in the scrapedData db
        db.Article.create({
          title: title,
          link: link,
          summary: summary,
          saved: saved,
          note: note
        }).then(
        function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err){
          console.log(err);
        })
      }
    });
  })
  .catch(function(err){
    console.log(err);
  });
  // Send a "Scrape Complete" message to the browser
  console.log('Referesh Worked');
});

// Route for getting all Articles from the db with Handlebars
app.get("/", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).sort({_id: -1})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("index", {stories: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: {note: dbNote._id } }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's saved status
app.post("/articles/:id", async function(req, res) {
  // Create a new note and pass the req.body to the entry
  try{
  let doc = await db.Article.findOne({_id: req.params.id});
  doc.saved = true;
  const dbArticle = await doc.save()
    res.json(dbArticle);
  }
  catch(err){
    res.json(err);
  }
});


app.get("/savedArticles", function(req, res){
  db.Article.find({saved: true}).sort({_id: -1})
    .then(function(dbArticle) {
      res.render("saved", {stories: dbArticle});
    })
    .catch(function(err) {
      res.json(err);
    });
});

//For deleting articles
app.post("/delete/:id", function (req,res){
  db.Article.deleteOne({_id: req.params.id})
  .then(function(dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err){
    res.json(err);
  })
})

//For deleting comments
app.post("/delete-comment/:id", function (req,res){
  db.Note.deleteOne({_id: req.params.id})
  .then(function(dbNote){
    res.json(dbNote);
  })
  .catch(function(err){
    res.json(err);
  })
})

// Route to generate 
app.get("/comments/:id",function(req, res){
  db.Article.find({_id: req.params.id}).populate('note')
  .then(function(dbArticle) {
    res.render("comments", {stories: dbArticle});
  })
  .catch(function(err){
    res.json(err);
  })
})



// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
    .then(function(dbNote) {
    
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});



// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});