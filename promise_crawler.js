var http = require('http');
var Promise = require('Promise');
var url = 'http://www.imooc.com/learn/348';
var cheerio = require('cheerio');

var baseUrl = 'http://www.imooc.com/learn/';
var videoIds = [348,259,197,134,75];


function filterChapters(html) {
	var $ = cheerio.load(html);
	var chapters = $('.chapter');
	var title = $('#course-infos.path span').text();
	var number = parseInt($($('.meta-value strong')[3]).text().trim(),10)

	// courseData = {
	// 	title:title,
	// 	number:number,
	// 	videos :[{
	// 		chapterTite:'',
	// 		videos:[
	// 		{
	// 			title:'',
	// 			id:''
	// 		}
	// 		]
	// 	}]
	// }

	var courseData = {
		title:title,
		number:number,
		videos:[]
	};
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

		courseData.videos.push(chapterData);
	})

	return courseData;
}

function printCrouseInfo(courseData) {
	courseData.forEach(function(courseData) {
		console.log(courseData.number+'人学过'+courseData.title+'\n');
	})
	courseData.forEach(function(courseData) {
		console.log('###'+courseData.title+'\n');
		courseData.videos.forEach(function(item) {
			var chapterTite = item.chapterTite;

			console.log(chapterTite + '\n');

			item.videos.forEach(function(video) {
				console.log('    ['+video.id +']'+ video.title + '\n');
			})
		})

	})

}

function getPageAsync(url) {
	return new Promise(function(resove,reject) {
		console.log('正在爬取'+url);

		http.get(url, function(res) {
			var html = '';

			res.on('data', function(data) {
				html += data;
			})

			res.on('end', function() {
				resove(html);
				
			})
		}).on('error', function(e) {
			reject(e);
			console.log('获取课程数据出错');
		})
	})
}

var fetchCourseArray = [];

videoIds.forEach(function(id) {
	fetchCourseArray.push(getPageAsync(baseUrl + id));
})

Promise
.all(fetchCourseArray)
.then(function(pages) {
	var courseData = [];

	pages.forEach(function(html) {
		var courses = filterChapters(html);

		courseData.push(courses);
	})

	courseData.sort(function(a,b) {
		return a.number < b.number;
	})

	printCrouseInfo(courseData)
})


