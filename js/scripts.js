donor_list = 

  [
  'Chad Jones',
  'Joe Smith',
  'Lisa Michelson'
  ];


  for(index in donor_list){
    donor = donor_list[index];
    donor_key = donor.replace(/\s+/g, '');

    $(".donor-list").append(
      "<li class='donor-"+donor_key+"'>"+donor+"</li>"
      );
  }


function performDonorSearch(value){
  if(! value){
      $('.donor-list li').fadeIn('fast');
      return;
    }

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
      }

    }); 
}

$(document).ready(function(){


  $(document).on('click', '.input', function(){
    value = $(this).val().toUpperCase();
    performDonorSearch(value);

       

   });

  $(document).on('keyup', '.input', function(){
    value = $(this).val().toUpperCase();
    performDonorSearch(value);

       

   });


  // START MAIN SLIDER
  slidr_level_1 = slidr.create('slidr-level-1', {
    after: function(e) { console.log('in: ' + e.in.slidr); },
    before: function(e) { console.log('out: ' + e.out.slidr); },
    breadcrumbs: false,
    controls: 'border',
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


  // START VIRTUAL KEYBOARD
  $(function () {
     jsKeyboard.init("virtualKeyboard");

     //first input focus
     var $firstInput = $(':input').first().focus();
     jsKeyboard.currentElement = $firstInput;
     jsKeyboard.currentElementCursorPosition = 0;
  }); 

  // BOTTOM NAVIGATION
  $('.landing-page-navigation a').on('click', function(){
    var target_slide = $(this).attr("class");

    slidr_level_1.slide(target_slide);
  }); 

});
