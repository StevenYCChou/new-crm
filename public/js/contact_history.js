$("#create_contact_history").click(function() {
  var agent_id = $(this).attr("value");
  var customer_id = $(this).attr("name");
  location.href="/contact_history/create?agentid=" + agent_id + "&customerid=" + customer_id;
});

$("#create_contact_submit").click(function() {
  var contact_summary = $("#TextSummary").val();
  var contact_model = $("#model_select").val();
  var contact_time = $("#time").val();
  var contact_data = $("#data").val();
  if (contact_summary && contact_model && contact_time && contact_data){
    var agent_id = $(this).attr("value");
    var customer_id = $(this).attr("name");    
    $.post(
      '/contact_history',
      { time: contact_time,
        data: contact_data,
        textSummary: contact_summary,
        model: contact_model,
        agentid: agent_id,
        customerid: customer_id,
      },
      function(res) {
        location.href = "/agent/"+ agent_id + "/customer/" + customer_id;
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Summary, model, time, data is required");
  }
});

$("#create_contact_cancel").click(function() {
  var agent_id = $(this).attr("value");
  var customer_id = $(this).attr("name");
  location.href = "/agent/"+ agent_id + "/customer/" + customer_id;
});

$(".contact_history_detail").click(function() {
  var contact_history_id = $(this).attr("value");
  location.href = '/contact_history/' + contact_history_id;
});

$("#contact_history_back_customer").click(function() {
  var agent_id = $(this).attr("value");
  var customer_id = $(this).attr("name");
  location.href='/agent/' + agent_id + '/customer/' + customer_id;
});

$("#contact_history_back_agent").click(function() {
  var agent_id = $(this).attr("value");
  location.href='/agent/' + agent_id;
});

$("#contact_history_back_agents").click(function() {
  location.href= '/agents';
});
