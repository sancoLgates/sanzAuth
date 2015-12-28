var express 			= require('express'),
	exphbs 				= require('express-handlebars'),
	logger 				= require('morgan'),
	cookieParser 		= require('cookie-parser'),
	bodyParser 			= require('body-parser'),
	methodOverride 		= require('method-override'),
	session 			= require('express-session'),
	passport 			= require('passport'),
	LocalStrategy 		= require('passport-local'),
	TwitterStrategy 	= require('passport-twitter'),
	GoogleStrategy 		= require('passport-google'),
	FacebookStrategy 	= require('passport-facebook');

//we will be creating these two files shortly
//var config = require('./config.js'), config file contains all tokens and other private info
//funct = require('./function.js') funct file contains our helper functions for our passport and database work
var config 	= require('./config.js'),
	funct 	= require('./function.js');


var app = express();

//==========PASSPORT==========
//use the LocalStrategy within passport to login/signin users.
passport.use('local-signin', new LocalStrategy(
	{passReqToCallback : true}, //allows us to pass back the request to the callback
	function(req, username, password, done) {
		funct.localAuth(username, password)
			.then(function (user) {
				if (user) {
					console.log("MASUK SEBAGAI: " + user.username);
					req.session.success = " Anda berhasil masuk sebagai " + user.username + "!";
					done(null, user);
				}
				if (!user) {
					console.log("TIDAK BISA MASUK");
					req.session.error = 'Tidak bisa masuk. tolong coba lagi, mungkin lain kali ^_^'; //inform user could not log them in
					done(null, user);
				}
			})
			.fail(function (err) {
				console.log(err.body);
			});
	}
));

//use the LocalStrategy within Passport to Register/"Signup" users.
passport.use('local-signup', new LocalStrategy(
	{passReqToCallback : true}, //allows us to pass back the request to the calback
	function(req, username, password, done) {
		funct.localReq(username, password)
		.then(function (user) {
			if (user) {
				console.log("BERHASIL TERDAFTAR: " + user.username);
				req.session.success = 'Anda berhasil terdaftar dan masuk sebagai ' + user.username + '!';
				done(null, user);
			}
			if (!user) {
				console.log("TIDAK BISA MENDAFTAR, MUNGKIN LAIN KALI.");
				req.session.error = 'Nama itu sudah ada di hati seseorang, tolong coba yang lain T_T.'; //inform user could not log them in
				done(null, user);
			}
		})
		.fail(function (err){
			console.log(err.body);
		});
	}
	));

//passport session setup
passport.serializeUser(function(user, done) {
	console.log("serializing " + user.username);
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	console.log("deserializing " + obj);
	done(null, obj);
});

//passport authorize website yang hanya bisa diakses oleh user login
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	req.session.error = "please sign in!";
	res.redirect('/signin');
}
//	this section will contain our work with Pass[port]
//	
//==========Express==========
//configure Ex[ress]
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X_HTTP-Method-Override'));
app.use(session({ secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

//session-presisted message middleware
app.use(function(req, res, next) {
	var err = req.session.error,
		msg = req.session.notice,
		success = req.session.success;

	delete req.session.error
	delete req.session.success;
	delete req.session.notice;

	if (err) res.locals.error = err;
	if (msg) res.locals.notice = msg;
	if (success) res.locals.success = success;

	next();	
});

//configure express to use handlebars templates
var hbs = exphbs.create({
	defaultLayout: 'main', //we will be creating this layout shortly
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//==========ROUTES==========

//displays our homepage
app.get('/', function(req, res){
	res.render('home', {user:req.user});
});

//display our signup page
app.get('/signin', function(req, res){
	res.render('signin');
});

//sends the request through our local signup strategy, and if success takes user to homepage, otherwise returns then to signin page
app.post('/local-reg', passport.authenticate('local-signup', {
	successRedirect: '/',
	failureRedirect: '/signin'
	})
);

//sends the request through our local login/signin strategy, and if successfull takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', {
	successRedirect: '/',
	failureRedirect: '/signin'
	})
);

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
	var name = req.user.username;
	console.log("Loggin Out " + req.user.username);
	req.logout();
	req.redirect('/');
	req.session.notice = "You have successfully been logged out " + name + "!";
});
//this section will hold our Routes
//
//==========PORT==========
var port = process.env.PORT || 5000; //select your port or let it pull from your env.file
app.listen(port);
console.log("dengerin di port " + port + "!");