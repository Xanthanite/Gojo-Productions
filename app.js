var express 						= require('express'),
	app 									= express(),
	bodyParser 						= require('body-parser'),
	favicon								= require('serve-favicon'),
	http    							= require('http').createServer(app);

app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');

// app.use(favicon(__dirname + '/public/images/favicon2.ico'));

app.use(express.static(__dirname + "/public"))

app.get("/", function(req, res) {
  res.render("home", {
		page: req.url,
		nav: {
			page: '/home'
		}
	});
})




http.listen(process.env.PORT || "3000", function() {
  console.log("Connected to app!");
})