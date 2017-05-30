var current_game_obj = {}

var get_game = function (game_name, callback) {
  $.ajax({
    type: "GET",
    url: `/edit/${game_name}`,
    success: callback,
  });
}

var delete_game = function (game_name, callback) {
  if (!(game_name)) {
    callback({success: false});
    return;
  }
  $.ajax({
    type: "DELETE",
    url: `/edit/${game_name}`,
    success: callback,
  });
}

var save_game = function (game_obj, callback) {
    if (!(game_obj.name)) {
      callback({success: false});
      return;
    }
    $.ajax({
    type: "PUT",
    url: `/edit/${game_obj.name}`,
    data: game_obj,
    success: callback,
  });  
}

var add_game = function (game_obj, callback) {
    $.ajax({
    type: "POST",
    url: `/edit/${game_obj.name}`,
    data: game_obj,
    success: callback,
  });  
}

var update_text_areas = function () {
  console.log(current_game_obj)
  $('#game_area').val(current_game_obj.descs[current_game_obj.desc]);
  $('#level_area').val(current_game_obj.levels[current_game_obj.level]);
  $('textarea').each(function () {
    $(this).attr('readonly', false);
  })
}

// Add a new game to the nav bar
var update_nav_bar = function (game_name) {
  $('.side-bar ul li').each(function () {
    $(this).removeClass('active');
  })
  $('#new').remove();
  $('.side-bar ul').append(`<li class="game active" id="${game_name}">${game_name}</li><li id="new">+</li>`)
}

// Update current game object to the given game_obj
var update_game_obj = function (game_obj) {
  current_game_obj = game_obj;
  var i = 0;
  update_text_areas()
  update_pointers();
}

$(document).on("click", '.game',function() {
  $('.side-bar ul li').each(function () {
    $(this).removeClass('active');
  })
  $(this).addClass('active');
  var game_name = $(this).attr('id')
  $('textarea').each(function () {
    $(this).attr('readonly', true);
  })
  $('#game_area').val('loading...');
  $('#level_area').val('loading...');
  get_game(game_name, update_game_obj)
})

// $(document).on("click", '.level',function() {

//   $('.level').each(function () {
//     $(this).removeClass('active');
//   })
//   $(this).addClass('active');
//   current_game_obj.level = parseInt($(this).attr('id'));
//   update_text_areas();

//   // var game_name = $(this).attr('id')
//   // get_game(game_name, update_game_obj)
// })

// $(document).on("click", '#add-level',function() {
//   $('.level').each(function () {
//     $(this).removeClass('active');
//   })
//   current_game_obj.levels.push(['']);
//   $('#add-level').remove();
//   var new_level = current_game_obj.levels.length-1
//   current_game_obj.level = new_level;
//   $('#nav').append(`<li class="level active button" id=${new_level}>${new_level}</li><li class="button" id="add-level">+</li>`)
//   update_text_areas();

//   // var game_name = $(this).attr('id')
//   // get_game(game_name, update_game_obj)
// })

var reset_pointer = function (id_prefix) {
  $(`#${id_prefix}-num`).text(current_game_obj[id_prefix])
  var plus = $(`#${id_prefix}-plus`);
  plus.text('›');
  plus.removeClass('plus');
  plus.addClass('pointer');
  plus.attr('id', `${id_prefix}-up`)
  if (current_game_obj[id_prefix] == current_game_obj[`${id_prefix}s`].length-1) {
    var pointer = $(`#${id_prefix}-up`)
    pointer.text('+')
    pointer.removeClass('pointer');
    pointer.addClass('plus')
    pointer.attr('id', `${id_prefix}-plus`)
  }
}

var update_pointers = function () {
  reset_pointer('level');
  reset_pointer('desc');
}

$(document).on('click', '#level-plus', function (e) {
  current_game_obj.levels.push('');
  current_game_obj.level ++;
  update_text_areas();
  update_pointers();
})

$(document).on('click', '#desc-plus', function (e) {
  current_game_obj.descs.push('');
  current_game_obj.desc ++;
  update_text_areas();
  update_pointers();
})

$(document).on('click', '#level-up', function (e) {
  if (!current_game_obj.name) return;
  current_game_obj.level ++;
  update_text_areas();
  update_pointers()
})

$(document).on('click', '#level-down', function (e) {
  if (!current_game_obj.name) return;
  if (current_game_obj.level > 0) {
    current_game_obj.level --;
    update_text_areas();
    update_pointers();
  }
})

$(document).on('click', '#desc-up', function (e) {
  if (!current_game_obj.name) return;
  current_game_obj.desc ++;
  update_text_areas();
  update_pointers()
})

$(document).on('click', '#desc-down', function (e) {
  if (!current_game_obj.name) return;
  if (current_game_obj.desc > 0) {
    current_game_obj.desc --;
    update_text_areas();
    update_pointers();
  }
})


$(document).on('click', '#new', function (e) {
  create_modal.style.display = 'block';
})

$(document).ready(function () {

  $('#game_area').val('');
  $('#level_area').val('');

  var create_modal = $('#create_modal')[0];

  $('.textbox').keydown(function(e) {
    var keyCode = e.keyCode || e.which;

    // 9 is tab key, presumably. 
    if (keyCode == 9) {
      e.preventDefault();
      var start = $(this).get(0).selectionStart;
      var end = $(this).get(0).selectionEnd;

      // set textarea value to: text before caret + tab + text after caret
      $(this).val($(this).val().substring(0, start)
                  + "\t"
                  + $(this).val().substring(end));

      // put caret at right position again
      $(this).get(0).selectionStart =
      $(this).get(0).selectionEnd = start + 1;
    } 
  });

  $('#name-input').change(e => {
    console.log('updating');
  })

  $('#cancel').click(e => {
    create_modal.style.display = 'none';
  })

  $('#create').click(e => {
    $('.warning').remove()
    var name = $('input').val();
    var regexp = /^[a-zA-Z0-9-_]+$/
    if (name.search(regexp) != -1) {
      new_game_obj = {name: name, descs: [''], levels: [''], level: 0, desc: 0}
      add_game(new_game_obj, function (response) {
        if (response.success) {
          update_game_obj(new_game_obj);
          update_nav_bar(name);
          create_modal.style.display = 'none';
        } else {
          $('#modal-content').append('<p class="warning">Name already taken</p>')
        }
      })
    } else {
      $('#modal-content').append('<p class="warning">Invalid name</p>')
    }
  })



  // fix this code
  $('#play').click(function (e) {
    if (current_game_obj.name) {
      current_game_obj.descs[current_game_obj.desc] = $('#game_area').val();
      current_game_obj.levels[current_game_obj.level] = $('#level_area').val();
      save_game(current_game_obj, function (success) {
        if (success.success) {
          window.location.href = `/play/${current_game_obj.name}/level/${current_game_obj.level}/desc/${current_game_obj.desc}`;
        }
      })
    }
  })

  $('#save').click(function (e) {
    console.log(`save pressed: ${current_game_obj.name}`)
    if (current_game_obj.name) {
      current_game_obj.descs[current_game_obj.desc] = $('#game_area').val();
      current_game_obj.levels[current_game_obj.level] = $('#level_area').val();
      save_game(current_game_obj, function (success) {
        if (success.success) {

        } else {
          console.log('error saving')
        }
      })
    }
  })

  $('#delete').click(e => {
    if (current_game_obj.name) {
      console.log('deleting game');
      delete_game(current_game_obj.name, function () {
         $(`#${current_game_obj.name}`).remove();
         current_game_obj = {};
      })
     
    }
  })

  $('#experiments').click(function (e) {
    window.location.href = '/experiments';
  })

  $('#images').click(function (e) {
    window.location.href = '/images';
  })

  $('#home').click(function (e) {
    window.location.href = '/';
  })

})