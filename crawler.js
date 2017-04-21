var http = require('http');
var url = 'http://www.imooc.com/learn/348';
var cheerio = require('cheerio');


function filterChapters(html) {
	var $ = cheerio.load(html);
	var chapters = $('.learnchapter');

	// [{
	// 	chapterTite:'',
	// 	videos:[
	// 	{
	// 		title:'',
	// 		id:''
	// 	}
	// 	]
	// }]

	var courseData = [];
	chapters.each(function(item) {
		var chapter = $(this);
		var chapterTite = chapter.find('strong').text();
		var videos = chapter.find('.video').children('li');
		var chapterData = {
			chapterTite : chapterTite,
			videos : []
		}

		videos.each(function(item) {
			var video = $(this).find('.studyvideo');
			var videoTitle = video.text();
			var id = video.attr('href').split('video/')[1];

			chapterData.videos.push({
				title:videoTitle,
				id:id
			})
		})

		courseData.push(chapterData);
	})

	return courseData;
}

function printCrouseInfo(course) {
	courseData.forEach(function(item) {
		var chapterTite = item.chapterTite;

		console.log(chapterTite + '\n');

		item.videos.forEach(function(video) {
			console.log('    ['+video.id +']'+ video.title + '\n');
		})
	})

}

http.get(url, function(res) {
	var html = '';

	res.on('data', function(data) {
		html += data;
	})

	res.on('end', function() {
		var courseData =  filterChapters(html);
		printCrouseInfo(courseData);
	})
}).on('error', function() {
	console.log('获取课程数据出错');
})