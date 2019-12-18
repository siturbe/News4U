

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
      window.location.reload();
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
  alert("This may take a few seconds");
  // $.get("/scrape", function(){
  //   console.log("scarped new articles")
  // })

  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  .then(function(){
    window.location.reload();
  })

});

//Deletes whole article
$(document).on("click","#delete-btn", function(e){
  e.preventDefault();
  let thisId = $(this).attr("data-id");
  if(confirm("Are you sure you want to delete this article")){

    $.ajax({
      method: "POST",
      url:"/delete/" + thisId,
    })
    .then(function(){
      window.location.reload();
    })
  }
})


//Deletes selected COMMENT
$(document).on("click","#delete-comment-btn", function(e){
  e.preventDefault();
  let thisId = $(this).attr("data-id");
  if(confirm("Are you sure you want to delete this comment")){

    $.ajax({
      method: "POST",
      url:"/delete-comment/" + thisId,
    })
    .then(function(){
      window.location.reload();
    })
  }
})

