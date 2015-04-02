// YOUTUBE API STUFF

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

// END YOUTUBE API STUFF

var donor_list;
var donor_categories = {};
var looping_slides = [];
var looping_slides_count = [];


var index_pages = [];

var index_page_to_id = {};

var timeout;
var short_timeout;
var restartTimer;
var home_page = true;


function prc_kiosk_process_donor_categories(donor_category_array){
  for(index in donor_category_array){
    item = donor_category_array[index];
    item.donors = [];

    section_key = item.url_title.toLowerCase().replace(/\ /g, '_');


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

      cat_key = cat.url_title.toLowerCase().replace(/\ /g, '_');
      // cat_key = cat_key.replace("_", "");

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

function getSortedArrayByKey(obj, key, text) {
    array = Object.keys(obj).map(function (key) {return obj[key]});

    return array.sort(function(a, b) {

        if(text){
          var x = a[key]; var y = b[key];

          // console.log("Test", x, y, ((x < y) ? 1 : ((x > y) ? -1 : 0)));
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        else{
          var x = parseInt(a[key]); var y = parseInt(b[key]);

          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
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
  sorted_full_donors = getSortedArrayByKey(donor_list, "search_name", true);


  for(index in sorted_full_donors){
    donor = sorted_full_donors[index];

    donor_html = "";

    donor_search_key = donor.search_name.toUpperCase();

    if(donor.categories.length == 0){
      donor_html += "<li class='donor' data-search-name='" + donor_search_key + "' >" +
                      "<span>" + 
                         donor.title + 
                      "</span></li>";
    }

    for(cat_index in donor.categories){
      cat = donor.categories[cat_index];

      cat_key = cat.url_title.toLowerCase().replace(/\ /g, '_');

      real_cat = donor_categories[cat_key];

      donor_text = "<span class='donor-display-name'>" + donor.title + "</span><span class='donor-display-cat'>" + real_cat.title + "<span>" ;

      donor_html = "";
      donor_html += "<li class='donor donor-with-detail' data-search-name='" + donor_search_key + "'>" +
                        "<a href='#' slider-nav='" + real_cat.id +"'>" +
                               donor_text + 
                            "</a></li>";
    

      $(".donor-list").append(donor_html);

    }
  }
}

function populateDonorCategories(){
  for(cat_index in donor_categories){
    cat = donor_categories[cat_index];

    $("#donor-categories").append(
        "<li>" +
          "<a href='#' slider-nav='" + cat.id +"'>" +
              "<img src='http://photos.osmek.com/" + cat.list_image +".png' />" + 
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
            "<div data-slidr='" + index + "' class='carousel-slide carousel-slide-" + index + "'>" + 
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

    donor_detail_html = "";

    donor_detail_html += 
        "<div data-slidr='"+donor.id+"' class='slide-"+donor.id+"'>" + 
          "<div class=\"page-wrapper donor-detail\">";

    if(donor.video){
      donor_detail_html += 
        "<a href='#' id='video-" + donor.id + "' class='video-play-button' data-video-id='" + donor.video.id + "' >" +
          "<img class='detail-image' src='http://photos.osmek.com/" + donor.detail_image +".o.png' />" +
        "</a>";
    }else{
      donor_detail_html += 
        "<img class='detail-image' src='http://photos.osmek.com/" + donor.detail_image +".o.png' />";
    }          
            

    if(donor.video){
      // donor_detail_html += "<a class='video-play-button'>PLAY VIDEO</a>";
    }

    donor_detail_html +=
          "</div>" + 
        "</div>";


    $("#slidr-level-1").append(donor_detail_html);


    // PRC Disabled this

    // current_donor = ".slide-" + donor.id;

    // if(donor.video){
    //   donor_video_html = "";
    //   donor_video_html += "<div class='video-container slide-"+donor.id+"-video'>"; 
    //   donor_video_html +=   "<a href='#' class='close-video'>x</a>";
    //   // donor_video_html +=   '<iframe id="player" width="1020" height="630" src="https://www.youtube.com/embed/y_tklwbFsRo?enablejsapi=1" frameborder="0" allowfullscreen></iframe>';
    //   donor_video_html += "</div>";     

    //   $(current_donor).append(donor_video_html);
    // }
    

  }

  for(cat_index in donor_categories){
    cat = donor_categories[cat_index];

    cat_html =  "<div data-slidr='"+cat.id+"' class='donor-category-slide slide-"+cat.id+"'>" + 
                  "<div class=\"page-wrapper\">" +
                    "<div class=\"page-left\"><div>" + 
                      "<img src='http://photos.osmek.com/" + cat.list_image +".png' />" + 
                      "<h1>" + cat.title + "</h1>" + 
                        cat.postbody +
                      "</div></div><div class='page-right'><a href='#' class='page-up'>Click to page Up</a>" +
                      "<ul class='two-per-row large-links'>";


    sorted_donors = getSortedArrayByKey(cat.donors, "search_name", true);

    console.log("sorted");

    for(donor_index in sorted_donors){
      donor = sorted_donors[donor_index];

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

    cat_html += "</ul><a href='#' class='page-down'>Click to page down</span></div></div></div>";

    $("#slidr-level-1").append(cat_html);
  }

  for(index_page_index in index_pages){
      active_index_page = index_pages[index_page_index];
      console.log('Active index page for detail page generation', active_index_page);

      for(sub_index in active_index_page.sub_pages){
        active_sub_page = active_index_page.sub_pages[sub_index];
        console.log("Deatil Sub Page", active_sub_page);
        
         cat_html =  "<div data-slidr='"+active_sub_page.id+"' class='slide-"+active_sub_page.id+"'>" + 
                        "<div class=\"page-wrapper inner-page\">" +
                          "<img class='detail-image' src='http://photos.osmek.com/" + active_sub_page.detail_image +".loop.png' />" + 
                        "</div>" + 
                      "</div>";

          $("#slidr-level-1").append(cat_html);
      }
    }
}


function createIndexPages(){
    sorted_index_pages = getSortedArrayByKey(index_pages, "c_sort", false);

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

      sorted_sub_pages = getSortedArrayByKey(active_index_page.sub_pages, "c_sort", false);


      for(sub_index in sorted_sub_pages){
          active_sub_page = sorted_sub_pages[sub_index];
          console.log("Sub Page", active_sub_page);

          $(list).append(
                          "<li>" +
                            "<a href='#' slider-nav='" + active_sub_page.id +"'>" +
                              "<img src='http://photos.osmek.com/" + active_sub_page.list_image +".l.png' />" + 
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
    console.log("Search Value", value);

    $('.donor-list li span').each(function(){
      donor_key =  $(this).parents('li').attr('data-search-name');
      // console.log("Donor Value", donor_key);

      if(typeof donor_key == 'undefined' || donor_key.indexOf(value) != 0){
        $(this).parents('li').addClass('donor-not-found'); 
      }
      else{
        $(this).parents('li').removeClass('donor-not-found');
        values_found++; // Patrick switched this to ++
      }   
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
        $('h3.no-results-keyboard').slideUp();
        $('.donor-list').slideUp();
        $('h3.no-results').fadeOut('slow', function(){
          $('h3.prompt-text').fadeIn();
        });                        
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
  
  $('h3.no-results').fadeOut('slow', function(){
    $('h3.prompt-text').fadeIn();
  }); 
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
  $('h3.no-results').fadeOut('slow', function(){
    $('h3.prompt-text').fadeIn();
  });
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
        timing: { 'cube': '1s ease-in' },
        touch: true,
        transition: 'fade',
      }).start(); 

    slidr_carousel.auto(10000); 
    slidr_carousel.add('h', looping_slides_count);
    //   carousel_slide_count[i - 1] = (i.toString());

    // carousel_slide_count.push('1');
}



function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    events: {
      // 'onReady': onPlayerReady,
      // 'onStateChange': onPlayerStateChange
    }
  });

  // 
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
      active_nav.parent('li').addClass('nav-active').siblings().removeClass('nav-active');

      //PRC Added Scroll Clear - This could be moved somewhere else
      $(".donor-category-slide ul").scrollTop(0);

      e.preventDefault();

    }else{

    }
  });

  // PARALLAX

  $('.parallax a').on('click', function(e){
    $('.parallax-wrapper').fadeOut(function(){
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
    $('.parallax-wrapper').fadeIn();
    $('.parallax-3').animate({ opacity: 1 });
    e.preventDefault();
  });

  $('#slidr-carousel a, #slidr-carousel .touch-icon').click(function(e){
    $('#slidr-carousel').fadeOut(function(){
      $('.parallax-wrapper').fadeIn();
      $('.parallax-wrapper').scrollTop(3000);
      slidr_carousel.stop();      
    });
    e.preventDefault();

  });

 
  // $('.parallax a').on('click', function(e){
  //   $('.parallax-wrapper').fadeOut(function(){
  //     $('.slider-level-1, .landing-page-navigation').animate({ opacity: 1 }, function(){

  //     });
      
  //   });
  //   e.preventDefault();
  // });

  // $('.parallax-button').on('click', function(e){
  //   $('.slider-level-1, .landing-page-navigation').animate({
  //     opacity: 0
  //   });
  //   $('.parallax-wrapper').fadeIn();
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


  $('.parallax-wrapper').scroll(function(){
    console.log('parallax', $('.parallax-1').position() );
    current_pos = $(".parallax-1").position().top;
    current_pos *= -1;
    max_height = 580;

    /* PRC Fade Breakpoint */
    opacity_1_start = 200;
    opacity_1_end = 400;
    opacity_2_fadein_start = 800;
    opacity_2_fadein_end = 1000;
    opacity_2_fadeout_start = 1200;
    opacity_2_fadeout_end = 1500;
    opacity_3_start = 1800;
    opacity_3_end = 2200;



    if(current_pos < opacity_1_start){
      // console.log("Opacity 1 Pre", current_pos, opacity_1_start);
      opacity_1 = 1;
    }
    else if(current_pos > opacity_1_end){
      // console.log("Opacity 1 Post", current_pos, opacity_1_end);
      opacity_1 = 0;
    }
    else{
      opacity_1_window = opacity_1_end - opacity_1_start;
      opacity_1_pos = current_pos - opacity_1_start;

      opacity_1_progress = opacity_1_pos / opacity_1_window;
      opacity_1 = 1.0 - opacity_1_progress;
      // console.log("Opacity 1", current_pos, opacity_1_window, opacity_1_pos, opacity_1_progress, opacity_1);
    }
    // console.log("Opacity 1", current_pos, opacity_1_window, opacity_1_pos, opacity_1_progress, opacity_1);




    if(current_pos < opacity_2_fadein_start){
      // console.log("Opacity 2 Fadein Pre Start", current_pos, opacity_2_fadein_start);
      opacity_2 = 0;
    }
    else if(current_pos > opacity_2_fadein_end){
      // console.log("Opacity 2 Fadein Post Window", current_pos, opacity_2_fadein_end);
      opacity_2 = 1;
    }
    else{
      opacity_2_window = opacity_2_fadein_end - opacity_2_fadein_start;
      opacity_2_pos = current_pos - opacity_2_fadein_start;

      opacity_2_progress = opacity_2_pos / opacity_2_window;
      opacity_2 = opacity_2_progress;
      // console.log("Opacity 2 Fadein", current_pos, opacity_2_window, opacity_2_pos, opacity_2_progress, opacity_2);
    }


    if(current_pos < opacity_2_fadeout_start){
      // console.log("Opacity 2 Fadeout Pre Start", current_pos, opacity_2_fadeout_start);
      // opacity_2 = 0;
    }
    else if(current_pos > opacity_2_fadeout_end){
      // console.log("Opacity 2 FadeOut Post Window", current_pos, opacity_2_fadeout_end);
      opacity_2 = 0;
    }
    else{
      opacity_2_window = opacity_2_fadeout_end - opacity_2_fadeout_start;
      opacity_2_pos = current_pos - opacity_2_fadeout_start;

      opacity_2_progress = opacity_2_pos / opacity_2_window;
      opacity_2 = 1.0 - opacity_2_progress;
      // console.log("Opacity 2 FadeOut", current_pos, opacity_2_window, opacity_2_pos, opacity_2_progress, opacity_2);
    }


    /* Part Three */
    if(current_pos < opacity_3_start){
      // console.log("Opacity 3 Pre", current_pos, opacity_3_start);
      opacity_3 = 0;
    }
    else if(current_pos > opacity_3_end){
      // console.log("Opacity 3 Post", current_pos, opacity_3_end);
      opacity_3 = 1;
    }
    else{
      opacity_3_window = opacity_3_end - opacity_3_start;
      opacity_3_pos = current_pos - opacity_3_start;

      opacity_3_progress = opacity_3_pos / opacity_3_window;
      opacity_3 = opacity_3_progress;
      // console.log("Opacity 3", current_pos, opacity_3_window, opacity_3_pos, opacity_3_progress, opacity_3);
    }



    $(".parallax-1").css('opacity', opacity_1);
    $(".parallax-2").css('opacity', opacity_2);
    $(".parallax-3").css('opacity', opacity_3);
  });


});



/* Timeout Stuff */

/* ToDo: Add Reload Page Logic */
// function reload_timeout_trigger(){
  
// }

// function timeout_trigger(){
//   if(!home_page){
//     $('.timeout-notification').fadeIn(); 
//     clearTimeout(timeout);
//     short_timeout = setTimeout('short_timeout_trigger()', 5000);    
//   }
// }

// function short_timeout_trigger(){
//   $('.slider-nav-wrapper').animate({ opacity: 0 }, function(){
//     $(this).addClass('prc-invisible');
//     $('.landing-page-navigation').fadeOut();
//   });  
//   $('.parallax-wrapper').fadeOut();
//   $('#slidr-carousel').fadeIn();
//   slidr_carousel.auto(10000);  
//   $('.timeout-notification').fadeOut();

//   home_page = true;

//   restartTimer();
  
//   $(document).unbind("click keydown keyup mousemove", restartTimer); 
// }

// restartTimer = function(){
//   clearTimeout(timeout);
//   clearTimeout(short_timeout);

//   $('.timeout-notification').fadeOut();

//   if(home_page == false){
//     // THE LONG ONE - 60 SEC
//     timeout = setTimeout('timeout_trigger()', 60000);
//   }
  
// }
  

/* Looping Slide Stuff */
$(document).on('click', '#slidr-carousel a, #slidr-carousel .touch-icon', function(){
  $(document).bind("click keydown keyup mousemove", restartTimer);
  // THE LONG ONE - 60 SEC
  timeout = setTimeout('timeout_trigger()', 60000); 
  console.log(timeout);
  home_page = false;
});

// VIDEO PLAY BUTTON STUFF
$(document).on('click', '.video-play-button', function(e){
  video_id = $(this).attr('data-video-id');
  if(video_id){
    player.loadVideoById(video_id);
    player.playVideo();
  }
  $('.video-container').fadeIn();

  e.preventDefault();
});

$(document).on('click', '.close-video', function(e){
  $('.video-container').fadeOut();
  player.pauseVideo();
  e.preventDefault();
})

// PAGERS
$(document).on('click', '.page-up', function(e){
  scrolled_list = $(this).siblings('ul');
  scrolled_list.animate({scrollTop: $(scrolled_list).scrollTop() - 500}, '500', 'swing');
  e.preventDefault();
});

$(document).on('click', '.page-down', function(e){
  scrolled_list = $(this).siblings('ul');
  scrolled_list.animate({scrollTop: $(scrolled_list).scrollTop() + 500}, '500', 'swing');
  e.preventDefault();
});







