$('.nav-toggle').click(function(){
    $('.mobile-nav').toggleClass('collapse');
});

document.querySelector( ".nav-toggle" )
    .addEventListener( "click", function() {
    this.classList.toggle( "active" );
});