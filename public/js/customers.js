$('#create_customer').click(function() {
  var agent_id = $(this).attr("value");
  location.href='/agent/' + agent_id +'/create'; 
});

$('.customer_detail').click(function() {
  var customer_id = $(this).attr("value");
  var agent_id = $(this).attr("name");
  location.href='/agent/' + agent_id + '/customer/' + customer_id;  
});

$("#create_customer_submit").click(function() {
  var customer_name = $("#customer_name").val();
  var customer_phone = $("#customer_phone").val();
  var customer_email = $("#customer_email").val();
  if (customer_name && customer_phone && customer_email){
    var agent_id = $(this).attr("value");
    $.post(
      '/agent/' + agent_id,
      {name: customer_name, phone: customer_phone, email: customer_email, agentid: agent_id},
      function(res) {
        location.href = "/agent/"+ agent_id;
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#create_customer_cancel").click(function() {
  var agent_id = $(this).attr("value");
  location.href='/agent/' + agent_id;
});

$("#edit_customer_submit").click(function() {
  var customer_name = $("#customer_name").val();
  var customer_phone = $("#customer_phone").val();
  var customer_email = $("#customer_email").val();
  if (customer_name && customer_phone && customer_email){
    var agent_id = $(this).attr("value");
    var customer_id = $(this).attr("name");
    $.ajax({
      type: 'PUT',
      url: '/agent/' + agent_id + '/customer/' + customer_id,
      data: {name: customer_name, phone: customer_phone, email: customer_email},
      success: function(res) {
        window.location = '/agent/' + agent_id + '/customer/' + customer_id;
      }
    }).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#edit_customer_cancel").click(function() {
  var agent_id = $(this).attr("value");
  var customer_id = $(this).attr("name");
  location.href='/agent/' + agent_id + '/customer/' + customer_id;
});

$("#edit_customer").click(function() {
  var agent_id = $(this).attr("value");
  var customer_id = $(this).attr("name");
  location.href='/agent/' + agent_id + '/customer/' + customer_id + '/edit';
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
  var agent_id = $(this).attr("value");
  location.href= '/agent/' + agent_id; 
});

$("#customer_back_agents").click(function() {
  location.href= '/agents';
});

$("#customer_delete").click(function() {
  var agent_id = $(this).attr("value");
  var customer_id = $(this).attr("name");
  $.ajax({
    type: 'delete',
    data: {agentid: agent_id, customerid: customer_id},
    url: '/customer/' + customer_id,
    success: function(res) {
      window.location="/agent/" + agent_id;
    }
  })
  .fail(function(res) {
    alert("Error: " + res.getResponseHeader("error"));   
  });  
});

$('#customer_view_edit').click(function() {
  var customer_id = $(this).attr("value");
  location.href= '/customer/' + customer_id + '/edit'; 
});

$("#customer_view_edit_customer_submit").click(function() {
  var customer_name = $("#customer_name").val();
  var customer_phone = $("#customer_phone").val();
  var customer_email = $("#customer_email").val();
  if (customer_name && customer_phone && customer_email){
    var customer_id = $(this).attr("value");
    $.post(
      '/customer/' + customer_id,
      {name: customer_name, phone: customer_phone, email: customer_email},
      function(res) {
        window.location = '/customer/' + customer_id ;
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#customer_view_edit_customer_cancel").click(function() {
  var customer_id = $(this).attr("value");
  location.href= '/customer/' + customer_id;  
});
