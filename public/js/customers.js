$('#create_customer').click(function() {
  var agent_ID = $(this).attr("value");
  location.href='/agent/' + agent_ID +'/create'; 
});

$('.customer_detail').click(function() {
  var customer_ID = $(this).attr("value");
  var agent_ID = $(this).attr("name");
  location.href='/agent/' + agent_ID + '/customer/' + customer_ID;  
});

$("#create_customer_submit").click(function() {
  var customer_name = $("#customer_name").val();
  var customer_phone = $("#customer_phone").val();
  var customer_email = $("#customer_email").val();
  if (customer_name && customer_phone && customer_email){
    var agent_ID = $(this).attr("value");
    $.post(
      '/agent/' + agent_ID,
      {name: customer_name, phone: customer_phone, email: customer_email, agentID: agent_ID},
      function(res) {
        window.location = "/agent/"+ agent_ID;
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#create_customer_cancel").click(function() {
  var agent_ID = $(this).attr("value");
  location.href='/agent/' + agent_ID;
});

$("#edit_customer_submit").click(function() {
  var customer_name = $("#customer_name").val();
  var customer_phone = $("#customer_phone").val();
  var customer_email = $("#customer_email").val();
  if (customer_name && customer_phone && customer_email){
    var agent_ID = $(this).attr("value");
    var customer_ID = $(this).attr("name");
    $.ajax({
      type: 'PUT',
      url: '/agent/' + agent_ID + '/customer/' + customer_ID,
      data: {name: customer_name, phone: customer_phone, email: customer_email},
      success: function(res) {
        window.location = '/agent/' + agent_ID + '/customer/' + customer_ID;
      }
    }).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#edit_customer_cancel").click(function() {
  var agent_ID = $(this).attr("value");
  var customer_ID = $(this).attr("name");
  location.href='/agent/' + agent_ID + '/customer/' + customer_ID;
});

$("#edit_customer").click(function() {
  var agent_ID = $(this).attr("value");
  var customer_ID = $(this).attr("name");
  location.href='/agent/' + agent_ID + '/customer/' + customer_ID + '/edit';
});

$(".customer_delete").click(function() {
  var customer_id = $(".customer_id").val();
  if (customer_id){
    $.post(
      '/customer/:id/delete',
      {customer_id: customer_id},
      function(res) {
        window.location = "/customers";
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Id is required");
  }
});

$("#customer_back_agent").click(function() {
  var agent_ID = $(this).attr("value");
  location.href= '/agent/' + agent_ID; 
});

$("#customer_back_agents").click(function() {
  location.href= '/agents';
});

$("#customer_delete").click(function() {
  var agent_ID = $(this).attr("value");
  var customer_ID = $(this).attr("name");
  $.ajax({
    type: 'delete',
    data: {agentID: agent_ID, customerID: customer_ID},
    url: '/customer/' + customer_ID,
    success: function(res) {
      window.location="/agent/" + agent_ID;
    }
  })
  .fail(function(res) {
    alert("Error: " + res.getResponseHeader("error"));   
  });  
});

$('#customer_view_edit').click(function() {
  var customer_ID = $(this).attr("value");
  location.href= '/customer/' + customer_ID + '/edit'; 
});

$("#customer_view_edit_customer_submit").click(function() {
  var customer_name = $("#customer_name").val();
  var customer_phone = $("#customer_phone").val();
  var customer_email = $("#customer_email").val();
  if (customer_name && customer_phone && customer_email){
    var customer_ID = $(this).attr("value");
    $.post(
      '/customer/' + customer_ID,
      {name: customer_name, phone: customer_phone, email: customer_email},
      function(res) {
        window.location = '/customer/' + customer_ID ;
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#customer_view_edit_customer_cancel").click(function() {
  var customer_ID = $(this).attr("value");
  location.href= '/customer/' + customer_ID;  
});
