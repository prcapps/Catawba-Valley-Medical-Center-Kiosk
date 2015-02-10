var donor_list;
var donor_categories = {};
var looping_slides = [];
var looping_slides_count = [];


var index_pages = [];

var index_page_to_id = {};

var timeout;
var short_timeout;
var restartTimer;
var home_page = false;


function prc_kiosk_process_donor_categories(donor_category_array){
  for(index in donor_category_array){
    item = donor_category_array[index];
    item.donors = [];

    section_key = item.title.toLowerCase().replace(/\ /g, '_');


    donor_categories[section_key] = item;
  }
}


function prc_kiosk_process_donors(response){
  donor_list = [];
  temp_donor_categories = [];

  for(index in response.items){
    donor = response.items[index];

    if(donor.donor_type == "donor"){
      donor_list.push(donor);
    }
    else if(donor.donor_type == "category"){
      temp_donor_categories.push(donor);
    }
  }

  prc_kiosk_process_donor_categories(temp_donor_categories);

  // console.log(response);

  for(index in donor_list){
    donor = donor_list[index];

    for(cat_index in donor.categories){
      cat = donor.categories[cat_index];

      cat_key = cat.title.toLowerCase().replace(/\ /g, '_');

      if(typeof donor_categories[cat_key] != 'undefined'){
        donor_categories[cat_key].donors.push(donor);
      }
    }
  }
  populateDonorList();
  populateDonorCategories();
  createDetailPages();
  createLoopingSlides();

  init_sliders();
  // $('a').on('click', function(e){
  //   // console.log('click');
  //   if($(this).attr('slider-nav')){
  //      target_slide = $(this).attr("slider-nav");
  //     console.log(target_slide);
  //     slidr_level_1.slide(target_slide);
  //     e.preventDefault();
  //   }else{

  //   }
  // });

}

function getSortedArrayByKey(obj, key) {
    array = Object.keys(obj).map(function (key) {return obj[key]});

    return array.sort(function(a, b) {
        var x = parseInt(a[key]); var y = parseInt(b[key]);
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}


function prc_kiosk_process_index_pages(index_pages_raw){
  index_pages = {};
  index_page_to_id = {};

  for(index in index_pages_raw){
    page = index_pages_raw[index];

    page.sub_pages = [];

    index_pages[page.id] = page;
    section_key = page.title.toLowerCase().replace(/\ /g, '_');
    index_page_to_id[section_key] = page.id;

  }

  createIndexPages();
}

function prc_kiosk_process_pages(response){
  // console.log(response);

  index_pages = [];
  inner_pages = [];

  for(index in response.items){
    page = response.items[index];

    if(page.page_type == "index_page"){
      index_pages.push(page);
    }
    else if(page.page_type == "inner_page"){
      inner_pages.push(page);
    }
    else if(page.page_type == "looping_slide"){
      looping_slides.push(page);
    }
  }

  prc_kiosk_process_index_pages(index_pages);

  for(index in inner_pages){
    page = inner_pages[index];


    console.log("Page", page);


    section_id = index_page_to_id[page.section];
    index_pages[section_id].sub_pages.push(page);
  }
  createSubPagesPages();

}

// SETUP DONOR LIST AT THE BEGINNING
function populateDonorList(){
  for(index in donor_list){
    donor = donor_list[index];

    donor_html = "";
    if(donor.detail_image){
      donor_html += "<li class='donor'>" +
                        "<a href='#' slider-nav='" + donor.id +"'>" +
                            "<span>" + 
                               donor.title + 
                            "</span></a></li>";
    }
    else{
      donor_html += "<li class='donor'>" +
                            "<span>" + 
                               donor.title + 
                            "</span></li>";
    }

    $(".donor-list").append(donor_html);
  }
}

function populateDonorCategories(){
  for(cat_index in donor_categories){
    cat = donor_categories[cat_index];

    $("#donor-categories").append(
        "<li>" +
          "<a href='#' slider-nav='" + cat.id +"'>" +
              "<div class='image-container'><img src='http://photos.osmek.com/" + cat.list_image +".png' /></div>" + 
              "<span>" + 
               cat.title + 
              "</span></a></li>"
      );
  }
}

function createLoopingSlides(){
  for(index in looping_slides){
    slide = looping_slides[index];

    $('#slidr-carousel').append(
            "<div data-slidr='" + index + "' class='carousel-slide-" + index + "'>" + 
              "<a href='#'><img src='http://photos.osmek.com/" + slide.looping_slide_image +".loop.png' /></a>" +  
            "</div>"
      );

      looping_slides_count.push(index);
    }
    

  // delete looping_slides_count[0];

  looping_slides_count.push("0");

  console.log(looping_slides_count);
}



function createDetailPages(){
  for(index in donor_list){
    donor = donor_list[index];

    $("#slidr-level-1").append(
        "<div data-slidr='"+donor.id+"' class='slide-"+donor.id+"'>" + 
          "<div class=\"page-wrapper\">" +
            "<img class='detail-image' src='http://photos.osmek.com/" + donor.detail_image +".loop.png' />" + 
          "</div>" + 
        "</div>"
      );
  }

  for(cat_index in donor_categories){
    cat = donor_categories[cat_index];

    cat_html =  "<div data-slidr='"+cat.id+"' class='slide-"+cat.id+"'>" + 
                  "<div class=\"page-wrapper\">" +
                    "<div class=\"page-left\"><div>" + 
                      "<img src='http://photos.osmek.com/" + cat.list_image +".png' />" + 
                      "<h1>" + cat.title + "</h1>" + 
                        cat.postbody +
                      "</div></div><div class='page-right'>" +
                      "<ul class='two-per-row large-links'>";

    for(donor_index in cat.donors){
      donor = cat.donors[donor_index];

      if(donor.detail_image){
        cat_html += "<li class='donor donor-with-detail'><a href='#' slider-nav='" + donor.id +"'>" +
                            "<span>" + 
                               donor.title + 
                            "</span></a></li>";
      }
      else{
          cat_html += "<li class='donor donor-without-detail'>"+donor.title+"</li>";
      }
      
    }

    cat_html += "</ul></div></div></div>";

    $("#slidr-level-1").append(cat_html);
  }

  for(index_page_index in index_pages){
      active_index_page = index_pages[index_page_index];
      console.log('Active index page for detail page generation', active_index_page);

      for(sub_index in active_index_page.sub_pages){
        active_sub_page = active_index_page.sub_pages[sub_index];
        console.log("Deatil Sub Page", active_sub_page);
        
         cat_html =  "<div data-slidr='"+active_sub_page.id+"' class='slide-"+active_sub_page.id+"'>" + 
                        "<div class=\"page-wrapper\">" +
                          "<img class='detail-image' src='http://photos.osmek.com/" + active_sub_page.detail_image +".loop.png' />" + 
                        "</div>" + 
                      "</div>";

          $("#slidr-level-1").append(cat_html);
      }
    }
}


function createIndexPages(){
    sorted_index_pages = getSortedArrayByKey(index_pages, "c_sort");

    for(index_page_index in sorted_index_pages){
      active_index_page = sorted_index_pages[index_page_index];
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
       active_slide = $('div[data-slidr="' + active_index_page.id + '"]');

       // Populate Index Page Image and Description
       active_slide.find('.header-image').attr('src', "http://photos.osmek.com/" + active_index_page.header_image + ".png");
       active_slide.find('p').replaceWith(active_index_page.postbody);
    }
}


function createSubPagesPages(){
    $(".cms-subpage-list").each(function(){
      list = $(this);

      active_id = list.attr('data-index-page-id');
      active_index_page = index_pages[active_id];

      sorted_sub_pages = getSortedArrayByKey(active_index_page.sub_pages, "c_sort");


      for(sub_index in sorted_sub_pages){
          active_sub_page = sorted_sub_pages[sub_index];
          console.log("Sub Page", active_sub_page);

          $(list).append(
                          "<li>" +
                            "<a href='#' slider-nav='" + active_sub_page.id +"'>" +
                              "<div class='image-container'><img src='http://photos.osmek.com/" + active_sub_page.list_image +".l.png' /></div>" + 
                                "<span>" + 
                                 active_sub_page.title + 
                                "</span>" +
                            "</a>" +
                          "</li>"
                        );
      }
    });
}


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


// START VIRTUAL KEYBOARD

$(function () {
   jsKeyboard.init("virtualKeyboard");

   //first input focus
   var $firstInput = $('#donor-search-input').focus();
   jsKeyboard.currentElement = $firstInput;
   jsKeyboard.currentElementCursorPosition = 0;


});   

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


function init_sliders(){
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

    // START HOME CAROUSEL SLIDER
     slidr_carousel = slidr.create('slidr-carousel', {
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
        transition: 'linear',
      }).start(); 

    slidr_carousel.auto(10000); 
    slidr_carousel.add('h', looping_slides_count);
    //   carousel_slide_count[i - 1] = (i.toString());

    // carousel_slide_count.push('1');
}

// READY PAGE
$(document).ready(function(){
//-------------------------------------------------------------------------------------------

// SLIDER

//-------------------------------------------------------------------------------------------

  
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
      // console.log('target slide: '+ target_slide);
      var active_nav = $(".landing-page-navigation a[slider-nav = '" + target_slide + "']");
      e.preventDefault();
      active_nav.parent('li').addClass('nav-active').siblings().removeClass('nav-active');

    }else{

    }
  });

  // PARALLAX

  $('.parallax a').on('click', function(e){
    $('.parallax').fadeOut(function(){
      $('.slider-nav-wrapper').removeClass('prc-invisible').animate({ opacity: 1 }, function(){
        $('.landing-page-navigation').fadeIn();
      });
    });
    e.preventDefault();
  });

  $('.parallax-button').on('click', function(e){
    $('.slider-nav-wrapper').animate({ opacity: 0 }, function(){
      $(this).addClass('prc-invisible');
      $('.landing-page-navigation').fadeOut();
    });
    $('.parallax').fadeIn();
    e.preventDefault();
  });

  $('#slidr-carousel a').click(function(){
    $('#slidr-carousel').fadeOut(function(){
      $('.parallax').fadeIn();
      slidr_carousel.stop();      
    });

  });

 
  // $('.parallax a').on('click', function(e){
  //   $('.parallax').fadeOut(function(){
  //     $('.slider-level-1, .landing-page-navigation').animate({ opacity: 1 }, function(){

  //     });
      
  //   });
  //   e.preventDefault();
  // });

  // $('.parallax-button').on('click', function(e){
  //   $('.slider-level-1, .landing-page-navigation').animate({
  //     opacity: 0
  //   });
  //   $('.parallax').fadeIn();
  //   e.preventDefault();
  // });
  
  $(document).on('click', '.input', function(){
    value = $(this).val().toUpperCase();
    performDonorSearch(value);
   });

  $(document).on('keyup', '.input', function(){
    value = $(this).val().toUpperCase();
    performDonorSearch(value);
   });

  $('#donor-search-input').change(function(){
    console.log('keyed1');
  });


});



/* Timeout Stuff */
function timeout_trigger(){
  $('.timeout-notification').fadeIn(); 
  clearTimeout(timeout);
  short_timeout = setTimeout('short_timeout_trigger()', 5000);
}

function short_timeout_trigger(){

  $('.slider-nav-wrapper').animate({ opacity: 0 }, function(){
    $(this).addClass('prc-invisible');
    $('.landing-page-navigation').fadeOut();
  });  
  $('.parallax').fadeOut();
  $('#slidr-carousel').fadeIn();
  slidr_carousel.auto(10000);  
  $('.timeout-notification').fadeOut();

  home_page = true;

  restartTimer();
  
  $(document).unbind("click keydown keyup mousemove", restartTimer); 

  
}

restartTimer = function(){
  clearTimeout(timeout);
  clearTimeout(short_timeout);
  $('.timeout-notification').fadeOut();

  if(home_page == false){
    timeout = setTimeout('timeout_trigger()', 60000);
  }
  
}


/* Looping Slide Stuff */
$('#slidr-carousel a').on('click', function(){
  $(document).bind("click keydown keyup mousemove", restartTimer);
  timeout = setTimeout('timeout_trigger()', 60000); 
  console.log(timeout);

  home_page = false;
});


