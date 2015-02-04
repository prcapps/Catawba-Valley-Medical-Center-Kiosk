// DONOR SEARCH FUNCTIONALITY
donor_list = 

  [
  'Chad Jones',
  'Joe Smith',
  'Lisa Michelson',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith',  'Chad Jones',
  'Joe Smith'               
  ];

 // START VIRTUAL KEYBOARD
  $(function () {
     jsKeyboard.init("virtualKeyboard");

     //first input focus
     var $firstInput = $('#donor-search-input').focus();
     jsKeyboard.currentElement = $firstInput;
     jsKeyboard.currentElementCursorPosition = 0;


  });   

function keyboardKeyUp(){

}

function populateDonorList(){
  for(index in donor_list){
    donor = donor_list[index];
    donor_key = donor.replace(/\s+/g, '');

    $(".donor-list").append(
      "<li class='donor-"+donor_key+"'>"+donor+"</li>"
      );
  }
}

populateDonorList();

  function handleMouseDown(event){
    console.log(event);
    $(this).parent('li').addClass('nav-down');
    $('.landing-page-navigation li').not($(this).parent('li')).removeClass('nav-down');
  }


function performDonorSearch(){
  if(! value){
      $('.donor-list li').fadeIn('fast');
      return;
    }
    var values_found = 0;
    // console.log(value);
    $('.donor-list li').each(function(){
      test_val = $(this).html();

      last_name = test_val.split(' ')[1].toUpperCase();
      // console.log(last_name);

      
      // console.log(test_val);
      if(last_name.indexOf(value) == -1){
        $(this).fadeOut('fast');
        
      }
      else{
        $(this).fadeIn('fast');
        values_found = values_found + 1;
      }
    });

    if(values_found <= 0){
      placeholder = $('#donor-search-input').val();
      $('.donor-list').slideUp(function(){
        $('h3.no-results-keyboard').slideDown();
        $('h3.no-results').fadeIn();
        $('h3.no-results span').html(placeholder);
      });
    }else{
      $('.donor-list').slideDown(function(){
        $('h3.no-results').fadeOut(); 
        $('h3.no-results-keyboard').slideUp();     
      });      
    }      
}

mouseUpEvent = function(){};


writeEvent = function(){
  $('h3.no-results span').html($('input').val());  
 // PRC Testing
    $('#donor-search-input').focus(); 

    value = $('input').val().toUpperCase();

    performDonorSearch(value);

    console.log(jsKeyboard.currentElementCursorPosition);
    console.log($('input').val());


  };

deleteEvent = function(){
  $('h3.no-results span').html($('input').val());  
 // PRC Testing
    $('#donor-search-input').focus(); 

    value = $('input').val().toUpperCase();

    performDonorSearch(value);

    console.log("cursor position: " + jsKeyboard.currentElementCursorPosition);

    if(jsKeyboard.currentElementCursorPosition < 1){
        console.log("catch");
        $('.donor-list').slideDown(function(){
          $('.donor-list li').fadeIn('fast');    
        }, function(){
          jsKeyboard.currentElementCursorPosition = 0;
        });
        $('h3.no-results').fadeOut(); 
        $('h3.no-results-keyboard').slideUp();         
    }
    console.log('delete');     
}; 



// READY PAGE
$(document).ready(function(){
  
  // $(document).on('click', '.input', function(){
  //   value = $(this).val().toUpperCase();
  //   performDonorSearch(value);
  //  });

  // $(document).on('keyup', '.input', function(){
  //   value = $(this).val().toUpperCase();
  //   performDonorSearch(value);
  //  });

  // $('#donor-search-input').change(function(){
  //   console.log('keyed1');
  // });

  $('.no-results a, .no-results-keyboard a').on('click', function(e){
    $('.donor-list li').fadeIn('fast');
    $('#donor-search-input').val('');
    $('.donor-list').slideDown(function(){
      $('h3.no-results').fadeOut(); 
      $('h3.no-results-keyboard').slideUp();      
    });
    $('#donor-search-input').focus(); 
    e.preventDefault();    
  });



  // START MAIN SLIDER
  slidr_level_1 = slidr.create('slidr-level-1', {
    after: function(e) { console.log('in: ' + e.in.slidr); },
    before: function(e) { console.log('out: ' + e.out.slidr); },
    breadcrumbs: false,
    controls: 'none',
    direction: 'horizontal',
    fade: false,
    keyboard: true,
    overflow: true,
    pause: false,
    theme: '#222',
    timing: { 'cube': '0.5s ease-in' },
    touch: true,
    transition: 'linear'
  }).start();



  // BOTTOM NAVIGATION
  $('.landing-page-navigation a').mouseup(function() {
    $(this).parent('li').addClass('nav-up');
    $('.landing-page-navigation li').not($(this).parent('li')).removeClass('nav-up'); 
  }).mousedown(function() {
    $(this).parent('li').addClass('nav-down');
    $('.landing-page-navigation li').not($(this).parent('li')).removeClass('nav-down');
  }).click(function(e){
    $(this).parent('li').addClass('nav-active');
    $('.landing-page-navigation li').not($(this).parent('li')).removeClass('nav-active');
    e.preventDefault();
  });

  // OTHER 3D Buttons
  $('.donor-search-button').mouseup(function() {
    $(this).addClass('nav-up').removeClass('nav-down');
  }).mousedown(function() {
    $(this).addClass('nav-down').removeClass('nav-up');
  });

  $('a').on('click', function(e){
    if($(this).attr('slider-nav')){
      var target_slide = $(this).attr("slider-nav");
      slidr_level_1.slide(target_slide);
      e.preventDefault();
    }else{

    }
  });  

});
