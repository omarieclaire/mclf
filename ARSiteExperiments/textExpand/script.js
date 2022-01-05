    var words = {
        'happy': {
            count: 1,
            wordArray: ['Welcome to this place!','Be welcome!','Enter friend!','Come on in!','Be welcomed!','Come in!']
        },
      'recently': {
            count: 1,
            wordArray: ['Recently','In the last year','Over the past 365 days','In one orbital period of the Earth','Since our last meeting','In this glorious time']
        },
        'ruth': {
            count: 1,
            wordArray: ['friend','ami','dearest','kindred','friendo','soft one','darling' ]
        },
        'very_busy': {
            count: 1,
            wordArray: ['have been here.','have never stopped hoping.','have wondered and wandered.','have daydreamed.','have climbed trees.','have sat still.','have been laughing.','have softened.']
        },
        'awesome': {
            count: 1,
            wordArray: ['We have also been very awesome.','We have also been very awesome and lovely.','We have also been very awesome and lovely and cool.']
        }
    }

    var links = document.getElementsByTagName('a');
    for(var i = 0, len = links.length; i < len; i++) {
        links[i].onclick = function () {
            var currentWord = words[this.id];
            var currentArray = currentWord.wordArray;
            this.innerHTML = currentArray[currentWord.count++ % currentArray.length]
        }
    }