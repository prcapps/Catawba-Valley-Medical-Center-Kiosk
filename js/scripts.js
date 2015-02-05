var donor_list;
var donor_categories = {};

var donor_category_images = {};

donor_category_images[1144] = 'img/red-leaf.png';
donor_category_images[1145] = 'img/green-leaf.png';

var index_pages = [];


function prc_kiosk_process_donor_categories(response){
  for(index in response.items){
    item = response.items[index];
    item.donors = [];

    donor_categories[item.id] = item;
  }
}


function prc_kiosk_process_donors(response){

  donor_list = [];

  // console.log(response);

  donors_raw = response.items;

  for(index in donors_raw){
    donor_raw = donors_raw[index];

    donor_list.push(donor_raw);

    // Possible translate category attribute to donor_cat Osmek ID

    donor_categories[donor_raw.donor_category].donors.push(donor_raw);

    // for(cat_index in donor_raw.categories){
    //   cat = donor_raw.categories[cat_index];

    //   if(typeof donor_categories[cat.id] == 'undefined'){
    //     cat.donors = [];
    //     donor_categories[cat.id] = cat;
    //   }
    //   donor_categories[cat.id].donors.push(donor_raw);
    // }

  }
  populateDonorList();
  populateDonorCategories();
  createDetailPages();


  $('a').on('click', function(e){
    // console.log('click');
    if($(this).attr('slider-nav')){
       target_slide = $(this).attr("slider-nav");
      console.log(target_slide);
      slidr_level_1.slide(target_slide);
      e.preventDefault();
    }else{

    }
  });

}

function prc_kiosk_process_index_pages(response){
  index_pages = {};

  // console.log("Index Page Response");
  // console.log(response);

  pages_raw = response.items;

  for(index in pages_raw){
    page_raw = pages_raw[index];

    page_raw.sub_pages = [];

    index_pages[page_raw.id] = page_raw;
  }

  createIndexPages();
}

function prc_kiosk_process_pages(response){
  // console.log(response);

  pages_raw = response.items;

  for(index in pages_raw){
    page_raw = pages_raw[index];
    
    index_pages[page_raw.index_pages].sub_pages.push(page_raw);
  }
  createSubPagesPages();
}

// SETUP DONOR LIST AT THE BEGINNING
function populateDonorList(){
  for(index in donor_list){
    donor = donor_list[index];

    $(".donor-list").append(
                       "<li class='donor'>" +
                        "<a href='#' slider-nav='" + donor.id +"'>" +
                            "<span>" + 
                               donor.title + 
                            "</span></a></li>"
                  );
  }
}

function populateDonorCategories(){
  for(cat_index in donor_categories){
    cat = donor_categories[cat_index];

    $("#donor-categories").append(
        "<li>" +
          "<a href='#' slider-nav='" + cat.id +"'>" +
              "<img src='http://photos.osmek.com/" + cat.photo +".png' />" + 
              "<span>" + 
               cat.title + 
              "</span></a></li>"
      );
  }
}

function createDetailPages(){
  for(index in donor_list){
    donor = donor_list[index];

    $("#slidr-level-1").append(
        "<div data-slidr='"+donor.id+"' class='slide-"+donor.id+"'>" + 
          donor.title + 
        "</div>"
      );
  }

  for(cat_index in donor_categories){
    cat = donor_categories[cat_index];

    cat_html =  "<div data-slidr='"+cat.id+"' class='slide-"+cat.id+"'>" + 
                  "<div class=\"page-wrapper\">" +
                    "<div class=\"page-left\">" + 
                      "<img src='http://photos.osmek.com/" + cat.photo +".png' />" + 
                      "<h1>" + cat.title + "</h1>" + 
                        cat.postbody +
                      "</div><div class='page-right'>" +
                      "<ul class='two-per-row large-links'>";

    for(donor_index in cat.donors){
      donor = cat.donors[donor_index];
      cat_html += "<li>"+donor.title+"</li>";
    }

    cat_html += "</ul></div></div></div>";

    $("#slidr-level-1").append(cat_html);
  }

  for(index_page_index in index_pages){
      active_index_page = index_pages[index_page_index];

      for(sub_index in active_index_page.sub_pages){
        active_sub_page = active_index_page.sub_pages[sub_index];
        
         cat_html =  "<div data-slidr='"+active_sub_page.id+"' class='slide-"+active_sub_page.id+"'>" + 
                        "<div class=\"page-wrapper\">" +
                          "<img style='width: 100%; margin-top: -300px;' src='http://photos.osmek.com/" + active_sub_page.photo +".l.png' />" + 
                        "</div>" + 
                      "</div>";

          $("#slidr-level-1").append(cat_html);
      }
    }
}


function createIndexPages(){
    for(index_page_index in index_pages){
      active_index_page = index_pages[index_page_index];
      // console.log(active_index_page);

      // Update the Nav Image
      $('#cms-bottom-nav').append(
                                  "<li>" +
                                    "<a slider-nav='" + active_index_page.id + "'>" +
                                      "<img src='http://photos.osmek.com/" + active_index_page.bottom_nav_image +".png' />" + 
                                    "</a>" +
                                  "</li>"
                                  );

        // Get the Active Slide (in HTML)
       active_slide = $('div[data-slidr="' + index_page_index + '"]');

       // Populate Index Page Image and Description
       active_slide.find('.header-image').attr('src', "http://photos.osmek.com/" + active_index_page.photo + ".png");
       active_slide.find('p').replaceWith(active_index_page.postbody);
    }
}


function createSubPagesPages(){
    $(".cms-subpage-list").each(function(){
      list = $(this);

      active_id = list.attr('data-index-page-id');
      active_index_page = index_pages[active_id];

      for(sub_index in active_index_page.sub_pages){
          active_sub_page = active_index_page.sub_pages[sub_index];
          // console.log(active_sub_page);

          $(list).append(
                          "<li>" +
                            "<a href='#' slider-nav='" + active_sub_page.id +"'>" +
                              "<img src='http://photos.osmek.com/" + active_sub_page.photo +".l.png' />" + 
                                "<span>" + 
                                 active_sub_page.title + 
                                "</span>" +
                            "</a>" +
                          "</li>"
                        );
      }
    });
}



// START VIRTUAL KEYBOARD

$(function () {
   jsKeyboard.init("virtualKeyboard");

   //first input focus
   var $firstInput = $('#donor-search-input').focus();
   jsKeyboard.currentElement = $firstInput;
   jsKeyboard.currentElementCursorPosition = 0;


});   


// FIRE WHEN TYPING
function performDonorSearch(){
  if(! value){
    // $('.donor-list li').fadeIn('fast');
    return;
  }

  value = value.toUpperCase();
    
    values_found = 0;
    // console.log(value);

    $('.donor-list li a span').each(function(){
      test_val = $(this).html();
      console.log(test_val);
      last_name = test_val.split(' ')[1].toUpperCase();

      if(last_name.indexOf(value) == -1){
        $(this).parents('li').addClass('donor-not-found'); 
      }
      else{
        $(this).parents('li').removeClass('donor-not-found');
        values_found = values_found + 1;
      }
      console.log(last_name);
      // console.log(test_val);      
    });


    // NO RESULTS TRIGGER
    if(values_found <= 0){
      placeholder = $('#donor-search-input').val();
      $('.donor-list').slideUp(function(){
        $('h3.no-results-keyboard').slideDown();
        $('h3.no-results').fadeIn();
        $('h3.no-results span').html(placeholder);
      });
    }else{
      $('.donor-list').slideDown();
      $('.donor-list').slideDown(function(){
        $('h3.no-results').fadeOut(); 
        $('h3.no-results-keyboard').slideUp();     
      });      
    }      
}

// FIRE WHEN KEYBOARD KEY GOES UP
mouseUpEvent = function(){};


// FIRE WHEN KEYBOARD WRITES
writeEvent = function(){
  $('h3.no-results span').html($('input').val());  
  
  // PRC Testing
  $('#donor-search-input').focus(); 

  value = $('input').val().toUpperCase();

  performDonorSearch(value);

  if(jsKeyboard.currentElementCursorPosition > 0){
      $('h3.prompt-text').fadeOut(); 
      $('h3.clear-search').slideDown();                
  }
  // console.log(jsKeyboard.currentElementCursorPosition);
  // console.log($('input').val());    
};
// FIRE WHEN DELETE BUTTON IS PRESSED


deleteEvent = function(){
  $('h3.no-results span').html($('input').val());  
    // $('#donor-search-input').focus(); 

    value = $('input').val().toUpperCase();

    performDonorSearch(value);

    if(jsKeyboard.currentElementCursorPosition < 1){
        console.log("catch");
        jsKeyboard.currentElementCursorPosition = 0;

        $('h3.clear-search').slideUp();
        $('h3.no-results').fadeOut(); 
        $('h3.no-results-keyboard').slideUp();
        $('.donor-list').slideUp();
        $('h3.prompt-text').fadeIn();                 
    }
    // console.log("cursor position: " + jsKeyboard.currentElementCursorPosition);
    // console.log('delete');     
}; 


// NO RESTULTS FUNCTIONALITY
$('.no-results a, .no-results-keyboard a').on('click', function(e){
  
  jsKeyboard.currentElementCursorPosition = 0;
  
  $('.donor-list li').fadeIn('fast');
  $('#donor-search-input').val('');
  
  $('h3.no-results').fadeOut(); 
  $('h3.no-results-keyboard').slideUp();   
  $('h3.clear-search').slideUp();   
  
  $('#donor-search-input').focus(); 
  e.preventDefault();    
});

// CLEAR SEARCH
$('h3.clear-search').on('click', function(){
  jsKeyboard.currentElementCursorPosition = 0;
  $('#donor-search-input').val('');
  $(this).slideUp();
  $('ul.donor-list').slideUp();
  $('h3.prompt-text').slideDown();
});

//-------------------------------------------------------------------------------------------

// END DONOR SEARCH FUNCTIONALITY

//-------------------------------------------------------------------------------------------


// READY PAGE
$(document).ready(function(){
//-------------------------------------------------------------------------------------------

// SLIDER

//-------------------------------------------------------------------------------------------

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
//-------------------------------------------------------------------------------------------



// BOTTOM NAV/3D BUTTONS

//-------------------------------------------------------------------------------------------

  // function handleMouseDown(event){
  //   console.log(event);
  //   $(this).parent('li').addClass('nav-down');
  //   $('.landing-page-navigation li').not($(this).parent('li')).removeClass('nav-down');
  // }

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


});
