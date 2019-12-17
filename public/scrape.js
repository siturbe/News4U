

    $('.scrapeRefresh').on("click", function(event){
        event.preventDefault();

        $.get("/api/scrape", function(data){
            console.log(data);
            location.reload();
        })
    })

// $(document).on('click','.commentClass', addComment);


// function addComment(){
//     event.preventDefault();

//     let item ={
//         author: $('.commentAuthor').val().trim(),
//         content: $('.commentBody').val().trim()
//     };

//     console.log(item.content);

    

//     // $.get('/update-comment', item)
//     //     .then(function(){
//     //         let row = $('<li>');
//     //         row.append(item.content + " --- " + item.author);
//     //         $('#userComments').prepend(row);
//     //     })
// }