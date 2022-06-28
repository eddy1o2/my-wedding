function renderMessage(name, content) {
  return `
    <div class="item-loop item">
        <div class="card">
            <div class="card-body">
              <h5 class="card-title">${name}</h5>
              <p class="card-text">${content}</p>
            </div>
        </div>
    </div>`;
}

function renderMessageList(data, $) {
  for (var i in data) {
    $("#messages-list").append(renderMessage(`${data[i].name}`, `${data[i].content}`));
  }
}

async function refreshMessageList($) {
  $("#messages-list").empty();
  $("#messages-list").removePagination();

  const messageList = await getMessages($);
  renderMessageList(messageList, $);

  if (window.innerWidth <= 480) {
    if (window.innerHeight <= 603) $(".item-loop").paginate(1);
    else if (window.innerHeight <= 685) $(".item-loop").paginate(2);
    else $(".item-loop").paginate(4);
  } else if (window.innerWidth <= 600) {
    $(".item-loop").paginate(2);
  } else if (window.innerWidth <= 936) {
    if (window.innerHeight > 929) $(".item-loop").paginate(6);
    else if (window.innerHeight <= 568) $(".item-loop").paginate(2);
    else if (window.innerHeight <= 929) $(".item-loop").paginate(3);
    else $(".item-loop").paginate(4);
  } else {
    if (window.innerHeight <= 675) $(".item-loop").paginate(4);
    else $(".item-loop").paginate(6);
  }
}

function showErrorToast(content, $) {
  $.toast({
    heading: "Error",
    text: `Something wrong${content}!`,
    showHideTransition: "fade",
    icon: "error",
    hideAfter: false,
    allowToastClose: false,
    stack: 3,
  });
}

async function getMessages($) {
  return await $.ajax({
    url: `https://my-wedding-1707-default-rtdb.asia-southeast1.firebasedatabase.app/message.json`,
    type: "GET",
    success: function (data) {
      return data;
    },
    error: function (err) {
      showErrorToast(" with getting messages", $);
    },
  });
}

function resetForm($) {
  $("#message-name").val("");
  $("#message-content").val("");

  $("#btn-send button").attr("disabled", false);
  $("#btn-send button").html("Send Message");
}

async function createMessage($) {
  var data = JSON.stringify(getFormData($("#form-messages"), $))
  console.log('data: ', data)
  return await $.ajax({
    url: `https://my-wedding-1707-default-rtdb.asia-southeast1.firebasedatabase.app/message.json`,
    type: "POST",
    contentType: "application/json",
    data: data,
    success: function (data) {
      return data;
    },
    error: function (err) {
      console.log('err:', err)
      showErrorToast(" with creating messages", $);
    },
  });
}

function getFormData($form, $){
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};

  $.map(unindexed_array, function(n, i){
      indexed_array[n['name']] = n['value'];
  });

  return indexed_array;
}

$(document).ready(async function ($) {
  if (window.innerWidth <= 600) {
    $("#container-messages").removeClass("messages-background overlay-pink");
    $("#messages-carousel").addClass("messages-background overlay-pink");
  }
  await refreshMessageList($);

  $("#form-messages").validate({
    rules: {
      name: "required",
      content: "required",
    },
    messages: {
      name: "Oops your name is missing!",
      content: "Say something!",
    },
  });

  $("#btn-send button").click(async function (e) {
    const isValid = $("#form-messages").valid();
    if (!isValid) {
      return;
    }

    $("#btn-send button").attr("disabled", true);
    $("#btn-send button").html(
      `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>&nbsp;
      Sending`
    );

    e.preventDefault();

    await createMessage($);

    await refreshMessageList($);

    resetForm($);
  });
});
