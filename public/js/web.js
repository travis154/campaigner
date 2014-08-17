$(function(){
	var reg_form = $("#new-member-form");
	$(".btn-group label,.btn-group-vertical label").each(function(){
		var self = $(this);
		var text = self.text();
		self.attr("data-text", text);
	});
	if(reg_form.length){
		var data = reg_form.data().data;
		if(data != "undefined"){
			data = JSON.parse(decodeURIComponent(data));
			reg_form.data("id", data._id);
			for(var i in data){
				$("#" + i).val(data[i]);
			}
			$("#personal_sex label").removeClass("active");
			$("#personal_sex label[data-text='"+data['personal_sex']+"']").addClass("active");

			$("#role label").removeClass("active");
			data['role'].forEach(function(e){
				$("#role label[data-text='"+e+"']").addClass("active");
			});
			
			$("#specialized_constituency label").removeClass("active");
			data['specialized_constituency'].forEach(function(e){
				$("#specialized_constituency label[data-text='"+e+"']").addClass("active");
			});
			
			$("#appointed_location label").removeClass("active");
			data['appointed_location'].forEach(function(e){
				$("#appointed_location label[data-text='"+e+"']").addClass("active");
			});
			
		}
	}
	$("form input, form textarea").each(function(){
		var self = $(this);
		self.attr("name", self.attr("id"));
		return;
		if(self.attr("type") == "email"){
			self.val(Faker.Internet.email())
		}else{
			self.val(Faker.Name.findName());
		}
	});
	$("#new-member-form").on('submit', function(e){
		e.preventDefault();
		var form = $(this);
		if(form.parsley('isValid')){
			var data = form.serializeArray();
			var obj = {};
			data.forEach(function(e){
				obj[e.name] = e.value;
			});
			obj.personal_sex = $("#personal_sex label.active").text();
			obj.membership = $("#membership label.active").text();
			obj.specialized_constituency = JSON.stringify($("#specialized_constituency label.active").map(function(){return $(this).text()}).toArray());
			obj.role = JSON.stringify($("#role label.active").map(function(){return $(this).text()}).toArray());
			obj.appointed_location = JSON.stringify($("#appointed_location label.active").map(function(){return $(this).text()}).toArray());
			var url = "/members/register";
			var update = $("#new-member-form").data().id;
			if(update){
				url = "/members/" + update;
			}
			
			$.post(url, obj, function(res){
				if(res.error){
					return alert(res.error);
				}
				if(update){
					url = "/members/" + update;
					return alert("Member update");
				}
				alert("Member added");
				$("form input").each(function(){
					$(this).val('');
				})
			})
		}
	});

	$("#new-user-form").on('submit', function(e){
		e.preventDefault();
		var form = $(this);
		if(form.parsley('isValid')){
			var data = form.serializeArray();
			var obj = {};
			data.forEach(function(e){
				obj[e.name] = e.value;
			});
			obj.type = $("#type label.active").text();
			var url = "/user/add";			
			$.post(url, obj, function(res){
				if(res.error){
					return alert(res.error);
				}
				alert("User added");
				$("form input").each(function(){
					$(this).val('');
				})
			})
		}
	});
	$("body").on('click', ".remove-member", function(){
		var id = $(this).attr("data-id");
		if(confirm("Are you sure you want to delete this member?")){
			$.ajax({
				url: '/members/' + id,
				type: 'DELETE',
				success: function(result) {
					window.location.reload("true");
				}
			});
		}
	});
	$("body").on('click', ".remove-user", function(){
		var id = $(this).attr("data-id");
		if(confirm("Are you sure you want to delete this user?")){
			$.ajax({
				url: '/user/' + id,
				type: 'DELETE',
				success: function(result) {
					window.location.reload("true");
				}
			});
		}
	});
	
	$("#voter-constituency").on('click', 'label', function(e){
		setTimeout(function(){
			getVoters();
		},0);
	});
	$("#voter-registry").on('click', 'label', function(e){
		setTimeout(function(){
			getVoters();
		},0);
	});
	$("#voter-constituency-search").on("keyup", function(e){
		if(e.keyCode == 13){
			setTimeout(function(){
				getVoters();
			},0);
		}
	});
	$("body").on("click", ".update-survey-mcq label", function(){
		var field = $(this).parent().data().field;
		var id = $(this).parent().data().id;
		var value = $(this).text();
		$.post("/voters/" + id + "/survey",{field:field, value:value}, function(res){
			
		});
	});
	$("body").on("change", ".update-survey-text", function(){
		var field = $(this).data().field;
		var id = $(this).data().id;
		var value = $(this).val();
		$.post("/voters/" + id + "/survey",{field:field, value:value}, function(res){
		});
	});
	$("body").on("click", ".update-survey-location", function(){
		var id = $(this).data().id;
		navigator.geolocation.getCurrentPosition(function(position) {
			$.post("/voters/" + id + "/survey",{field:"address_location", value:JSON.stringify(position)}, function(res){
			
			});
		});
	});
	$("body").on('click', '#recipient_type label', function(){
		var text = $(this).text();
		if(text == "Custom"){
			$("#recipient-toggle-custom").show();
			$("#recipient-toggle-location").hide();
		}else{
			$("#recipient-toggle-custom").hide();
			$("#recipient-toggle-location").show();
		}
	});
	$("#send-sms").on('click', function(){
		var message = $("#sms_message").val();
		var type = $("#recipient_type label.active").text();
		var recipients;
		var dismiss;
		if(type == "Custom"){
			recipients = $("#custom-recipients").val().split(",")
		}else if(type == "Members" || type == "Voters"){
			recipients = $("#recipient-toggle-location label.active").map(function(){return $(this).text()}).toArray();
			dismiss = $(".recipient-name[data-dismiss]").map(function(){ return $(this).data().id }).toArray()
		}
		var post = {};
		post.message = message;
		post.type = type;
		post.recipients = JSON.stringify(recipients);
		post.dismiss = JSON.stringify(dismiss);
		
		var url = "/sms";			
		$.post(url, post, function(res){
			if(res.error){
				return alert(res.error);
			}
			alert("Bulk SMS queue started");
		})

	});
	$("#recipient_type label, #recipient-toggle-location label").click(function(){
		setTimeout(function(){
			var type = $("#recipient_type label.active").text();
			var recipients;
		
			if(type == "Custom"){
				recipients = $("#custom-recipients").val().split(",")
			}else if(type == "Members" || type == "Voters"){
				recipients = $("#recipient-toggle-location label.active").map(function(){return $(this).text()}).toArray();
			}
			var post = {};
			post.type = type;
			post.recipients = JSON.stringify(recipients);
			$.post('/sms/recipients',post, function(res){
				$("#sms-recipient-names").html(jade.render('sms-recipients',{recipients:res}));
			});
		},0);
	});
	$("#recipient_type label:first").trigger('click');
	$("#load").hide();
	$("body").on("click", ".display-voter", function(){
		var self = $(this);
		var row = self.parent();
		var id = self.data().id;
		$(".hidden-row").show().removeClass("hidden-row");
		$(".display-row").remove();		
		$.getJSON("/voters/" + id, function(res){
			var r = row.clone();
			r.insertAfter(row);
			r.hide();
			r.addClass("hidden-row");
			row.addClass("display-row");
			self.siblings().remove();
			self.attr("colspan",7);
			var html = (jade.render('voter-profile',res));
			self.html(html);
			self.removeClass("display-voter");
		});
	});
	$("body").on("click", ".recipient-name span", function(){
		var parent = $(this).parent();
		var person_id = parent.data().id;
		parent.attr("data-dismiss",true);
		parent.hide();
		console.log(parent);
	});
	$("body").on("click",".address", function(){
		var val = $(this).text();
		$("#voter-constituency-search").val(val);
		getVoters();
	});
	$("body").on("click",".toggle-vote", function(){
		var id = $(this).data().id;
		var self = $(this);
		$.post("/vote",{id:id}, function(res){
			if(res == true){
				self.css("background","green");
				self.text("YES");
			}else{
				self.css("background","red");
				self.text("NO");			
			}
		});
	});
	$("#srch").on('click', function(){
		getVoters();
	});
});

var voterconsxhr;
function getVoters(options){
	var template = window.template;
	var island = $("#voter-constituency label.active").text();
	var registry = $("#voter-registry label.active").text();
	var status = $("#voter-status label.active").text();
	var search = $("#voter-constituency-search").val();
	var query = {};
	
	if(island){
		query.island = island;
	}
	if(registry){
		query.registry = registry;
	}
	if(status){
		query.status = status;
	}
	if(search){
		query.search = search;
	}
	if(voterconsxhr){
		voterconsxhr.abort();
	}
	$("#load").show();
	voterconsxhr = $.getJSON("/voters/",query, function(res){
		var html = jade.render(template, {people:res});
		$("#voters-listing").html(html);
		$("#load").hide();
	});
}
function retrieveBalance(){
	$.getJSON('/sms/balance', function(res){
		$("#sms_balance").text(res.balance + " EURO");
	});
}



