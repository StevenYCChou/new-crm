require("jquery.1.11.1.js");
$('#create_agent').click(function() {
  location.href="/agent/create"; 
});

$('.agent_detail').click(function() {
  var agent_ID = $(this).attr("value");
  location.href='/agent/' + agent_ID;  
});

$("#create_agent_submit").click(function() {
  var agent_name = $("#agent_name").val();
  var agent_phone = $("#agent_phone").val();
  var agent_email = $("#agent_email").val();
  if (agent_name && agent_phone && agent_email){
    $.post(
      '/agent',
      {name: agent_name, phone: agent_phone, email: agent_email},
      function(res) {
        window.location = "/agents";
      }
    ).fail(function(res) {
    	alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#create_agent_cancel").click(function() {
  location.href="/agents";   
});

$("#edit_agent").click(function() {
  var agent_ID = $(this).attr("value");
  location.href= '/agent/' + agent_ID +'/edit'; 
});

$("#edit_agent_submit").click(function() {
  var agent_name = $("#agent_name").val();
  var agent_phone = $("#agent_phone").val();
  var agent_email = $("#agent_email").val();
  if (agent_name && agent_phone && agent_email){
    var agent_ID = $(this).attr("value");
    $.ajax({
      type: 'PUT',
      url: '/agent/' + agent_ID,
      data: {name: agent_name, phone: agent_phone, email: agent_email},
      success: function(res) {
        window.location = "/agent/" + agent_ID;
      }
    }).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#edit_agent_cancel").click(function() {
  var agent_ID = $(this).attr("value");
  location.href='/agent/' + agent_ID;
});

$("#back_agents").click(function() {
  location.href='/agents';  
});
