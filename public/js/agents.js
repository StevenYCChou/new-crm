$('#create_agent').click(function() {
  console.log("Create Agent!");
  location.href="/agent/create"; 
});

$('.agent_detail').click(function() {
  var agent_id = $(this).attr("value");
  location.href='/agent/' + agent_id;  
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
  var agent_id = $(this).attr("value");
  location.href= '/agent/' + agent_id +'/edit'; 
});

$("#edit_agent_submit").click(function() {
  var agent_name = $("#agent_name").val();
  var agent_phone = $("#agent_phone").val();
  var agent_email = $("#agent_email").val();
  if (agent_name && agent_phone && agent_email){
    var agent_id = $(this).attr("value");
    $.ajax({
      type: 'PUT',
      url: '/agent/' + agent_id,
      data: {name: agent_name, phone: agent_phone, email: agent_email},
      success: function(res) {
        location.href = "/agent/" + agent_id;
      }
    }).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#edit_agent_cancel").click(function() {
  var agent_id = $(this).attr("value");
  location.href='/agent/' + agent_id;
});

$("#back_agents").click(function() {
  location.href='/agents';  
});
