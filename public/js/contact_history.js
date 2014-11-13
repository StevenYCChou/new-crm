$("#create_contact_history").click(function() {
  var agentId = $(this).attr("value");
  var customerId = $(this).attr("name");
  location.href="/contact_history/create?agentId=" + agentId + "&customerId=" + customerId;
});

$(function() {
  $( "#time" ).datepicker();
});

$("#create_contact_submit").click(function() {
  var contact_summary = $("#TextSummary").val();
  var contact_model = $("#model_select").val();
  var contact_time = $("#time").val();
  var contact_data = $("#data").val();
  if (contact_summary && contact_model && contact_time && contact_data){
    var agentId = $(this).attr("value");
    var customerId = $(this).attr("name");
    $.post(
      '/contact_history',
      { time: contact_time,
        data: contact_data,
        textSummary: contact_summary,
        model: contact_model,
        agentId: agentId,
        customerId: customerId,
      },
      function(res) {
        location.href = "/agent/"+ agentId + "/customer/" + customerId;
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Summary, model, time, data is required");
  }
});

$("#create_contact_cancel").click(function() {
  var agentId = $(this).attr("value");
  var customerId = $(this).attr("name");
  location.href = "/agent/"+ agentId + "/customer/" + customerId;
});

$("#contact_history_back_customer").click(function() {
  var agentId = $(this).attr("value");
  var customerId = $(this).attr("name");
  location.href='/agent/' + agentId+ '/customer/' + customerId;
});

$("#contact_history_back_agent").click(function() {
  var agentId = $(this).attr("value");
  location.href='/agent/' + agentId;
});

$("#contact_history_back_agents").click(function() {
  location.href= '/agents';
});
