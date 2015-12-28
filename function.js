var bcrypt 	= require('bcryptjs'),
	Q 		= require('q'),
	config 	= require('./config.js'),
	db 		= require('orchestrate') (config.db);

//used in local-signup strategy
exports.localReg = function (username, password) {
	var deferred = Q.defer();
	var hash = bcrypt.hashSync(password, 8);
	var user = {
		"username": username,
		"password": hash,
		"avatar": "http://placepuppy.it/images/homepage.Beagle_puppy_6_weeks.JPG"
	}

	//check if username is already assigned in our database
	db.get('local-users', username)
	.then(function (result){ //case in which user already exists in db
		console.log('username already exists');
		deferred.resolve(false); //username already exists
	})
	.fail(function (result) { //case in which user does not already exists in db
		console.log(result.body);
		if (result.body.massage == 'The requested items could not be found.'){
			console.log('Nama ini bebas digunakan semaumu.');
			db.put('local-users', username, user)
			.then(function () {
				console.log("USER: " + user);
				deferred.resolve(user);
			})
			.fail(function (err){
				console.log("PUT FAIL:" + err.body);
				deferred.reject(new Error(err.body));
			});
		} else {
			deferred.reject(new Error(result.body));
		}
	});

	return deferred.promise;
};	

//check if user exists
	//if user exists check if passwords match (use bcrypt, compareSync(password, hash); //true where 'hash' is password in DB)
//if password matches take into website
	//if user doesn't exists or password doesn;t match tell them it failed
exports.localAuth = function (username, password) {
	var deferred = Q.defer();

	db.get('local-users', username)
	.then(function (result){
		console.log("PENGGUNA DITEMUKAN");
		var has = result.body.password;
		console.log(hash);
		console.log(bcrypt.compareSync(password, hash));
		if (bcrypt.compareSync(password, hash)) {
			deferred.resolve(Result.body);
		} else {
			console.log("KATA  SANDI (KITA) (UDAH) TIDAK COCOK");

			deferred.resolve(false);
		}
	}).fail(function (err){
		if (err.body.message == 'Nama yang Anda masukkan tidak ditemukan.'){
			console.log("PENGGUNA TIDAK DITEMUKAN DI DATABASE UNTUK MASUK!");
			deferred.resolve(false);
		} else {
			deferred.reject(new Error(err));
		}
	});

	return deferred.promise;
}	