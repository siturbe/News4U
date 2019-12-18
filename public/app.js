// $(document).ready(function(){
//   $('.modal').modal()
// });

// Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//   }
// });


// // Whenever someone clicks a p tag
// $(document).on("click", "p", function() {
//   // Empty the notes from the note section
//   $("#notes").empty();
//   // Save the id from the p tag
//   var thisId = $(this).attr("data-id");

//   // Now make an ajax call for the Article
//   $.ajax({
//     method: "GET",
//     url: "/articles/" + thisId
//   })
//     // With that done, add the note information to the page
//     .then(function(data) {
//       console.log(data);
//       // The title of the article
//       $("#notes").append("<h2>" + data.title + "</h2>");
//       // An input to enter a new title
//       $("#notes").append("<input id='titleinput' name='title' >");
//       // A textarea to add a new note body
//       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//       // A button to submit a new note, with the id of the article saved to it
//       $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//       // If there's a note in the article
//       if (data.note) {
//         // Place the title of the note in the title input
//         $("#titleinput").val(data.note.title);
//         // Place the body of the note in the body textarea
//         $("#bodyinput").val(data.note.body);
//       }
//     });
// });

// When you click the savenote button
$(document).on("click", "#addNote-btn", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log(thisId);

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/notes/" + thisId,
    data: {
      // Value taken from title input
      author: $("#author-input").val(),
      // Value taken from note textarea
      body: $("#comment-input").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
  
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#author-input").val("");
  $("#comment-input").val("");
});


//Code to save article
$(document).on("click", "#saved-btn", function(e){
    e.preventDefault();
    let thisId = $(this).attr("data-id");
    console.log(thisId);


    $.ajax({
      method: "POST",
      url:"/articles/" + thisId,
      data: {
        saved: true
      }
    })
    .then(function(data){
      alert("Article Saved");
      console.log(data);
      window.location.reload()
    })

});


//New Code to scrape on command
$(document).on("click", "#update", function(){
  $.get("/scrape", function(){
    alert("Scraped New Data");
    window.location.reload();
  })

});

$(document).on("click","#delete-btn", function(e){
  e.preventDefault();
  let thisId = $(this).attr("data-id");
  if(confirm("Are you sure you want to delte this article")){

    $.ajax({
      method: "POST",
      url:"/delete/" + thisId,
    })
    .then(function(){
      window.location.reload();
    })
  }
})


// $(document).on("click", "#savenote", function() {
//   let thisId = $(this).attr("data-id");

//   $.ajax({
//     method: "POST",
//     url: "/notes/" + thisId,
//     data: {
//       title: $("#titleinput").val(),
//       body: $("#bodyinput").val()
//     }
//   })
//     .then(function(data) {
//       console.log(data);
//       ;
//     });

 
//   $("#titleinput").val("");
//   $("#bodyinput").val("");
// });