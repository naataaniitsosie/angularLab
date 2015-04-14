var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Define variables */
var mongoose = require('mongoose');
var Contestant = mongoose.model('Contestant');
var Comment = mongoose.model('Comment');

/* PARAM, Pre-load a contestant object */  // this is called before any other contestant route handler
router.param('contestant', function(req, res, next, id){
	var query = Contestant.findById(id);
	
	query.exec(function(err, contestant){
		if(err){ return next(err); }
		if(!contestant){ return next(new Error("can't find contestant")); }
		
		req.contestant = contestant;
		console.log("PRELOADED CONTESTANT");
		return next();
	});
});

/* GET, get all contestants */ // this is called a request handler
router.get('/contestants', function(req, res, next) {
	Contestant.find(function(err, contestants) {
		if(err) {	return next(err); }
		
		res.json(contestants);
	});
});

/* POST, add a new contestant */
router.post('/contestants', function(req, res, next){
	var contestant = new Contestant(req.body);
	
	contestant.save(function(err, contestant){
		if(err){ return next(err); }
		
		res.json(contestant);
	});
});

/* GET, get a single contestant */
router.get('/contestants/:contestant', function(req, res){
	req.contestant.populate('comments', function(err, contestant){
		res.json(contestant);	
	});
});

/* PUT, upvote a contestant */
router.put('/contestants/:contestant/upvote', function(req, res, next) {
	req.contestant.upvote(function(err, contestant){
		if(err) { return next(err); }
		
		res.json(contestant);
	});
});

/* PARAM, Pre-load a comment object */
router.param('comment', function(req, res, next, id){
	var query = Comment.findById(id);
	
	query.exec(function(err, comment){
		if(err){ return next(err); }
		if(!comment){ return next(new Error("can't find comment")); }
		
		req.comment = comment;
		console.log("PRELOADED COMMENT");
		return next();
	});
});

/* POST, add a new comment */
router.post('/contestants/:contestant/comments', function(req, res, next) {
	var comment = new Comment(req.body);
	comment.contestant = req.contestant;
	
	comment.save(function(err, comment){
		if(err){ return next(err); }
		
		req.contestant.comments.push(comment);
		req.contestant.save(function(err, contestant){
			if(err){ return next(err); }
			
			res.json(comment);
		});
	});
});

/* PUT, upvote a comment */
router.put('/contestants/:contestant/comments/:comment/upvote', function(req, res, next) {
	req.comment.upvote(function(err, comment){
		if(err) { return next(err); }
		
		res.json(comment);
	});
});

module.exports = router;













