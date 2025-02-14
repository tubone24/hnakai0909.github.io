function init_order(array, option) {
  //https://bost.ocks.org/mike/shuffle/
  var m = array.length, t, i;
  for (i = 0; i < m; i++) {
    array[i] = i;
  }
  if (option == "random") {
    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  }
};

(function () {
  var suumo = [
    "あ❗️スーモ❗️<i class='e1'></i>",
    "ダン<i class='e2'></i>", "ダン<i class='e2'></i>",
    "ダン<i class='e2'></i>", "シャーン<i class='e3'></i>",
    "スモ<i class='e4'></i>", "スモ<i class='e1'></i>",
    "スモ<i class='e4'></i>", "スモ<i class='e1'></i>",
    "スモ<i class='e4'></i>", "スモ<i class='e1'></i>",
    "ス〜〜〜モ<i class='e5'></i><i class='e4'></i>",
    "スモ<i class='e4'></i>", "スモ<i class='e1'></i>",
    "スモ<i class='e4'></i>", "スモ<i class='e1'></i>",
    "スモ<i class='e4'></i>", "スモ<i class='e1'></i>",
    "ス〜〜〜モ<i class='e6'></i><i class='e7'></i>"
  ];
  var lyric_pieces = [
    "あ❗️ スーモ❗️🌚",
    "ダン💥", "ダン💥", "ダン💥", "シャーン🎶",
    "スモ🌝", "スモ🌚", "スモ🌝", "スモ🌚",
    "スモ🌝", "スモ🌚", "ス〜〜〜モ⤴🌝",
    "スモ🌚", "スモ🌝", "スモ🌚", "スモ🌝",
    "スモ🌚", "スモ🌝", "ス〜〜〜モ⤵🌞"
  ];
  var song = new Array(suumo.length);
  var lyrics = "";

  // from:http://curtaincall.weblike.jp/portfolio-web-sounder/webaudioapi-basic/demos/demo-08
  // http://curtaincall.weblike.jp/portfolio-web-sounder/webaudioapi-basic/audio

  var onDOMContentLoaded = function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    try {             // Create the instance of AudioContext

      var context = new AudioContext();
    } catch (error) {
      window.alert(error.message + ' : Please use Chrome or Safari.');
      return;
    }          // for legacy browsers

    context.createGain = context.createGain || context.createGainNode;          // Create the instance of GainNode

    var gain = context.createGain();          // for the instances of AudioBuffer

    var buffers = new Array(suumo.length);          // for the instances of AudioBufferSourceNode
    var lyric_elements = new Array(suumo.length);

    var sources = [];
    var interval;  // sec

    var event = document.createEvent('Event');        // Create original event
    event.initEvent('complete', true, true);          // Get ArrayBuffer by Ajax

    var load = function (url, index) {
      var xhr = new XMLHttpRequest();

      xhr.timeout = 30000;                        // Timeout (30sec)
      xhr.ontimeout = function () {
        window.alert('Timeout.');
      };
      xhr.onerror = function () { };
      xhr.onload = function () {
        if (xhr.status === 200) {
          var arrayBuffer = xhr.response;  // Get ArrayBuffer

          if (arrayBuffer instanceof ArrayBuffer) {                         // The 2nd argument for decodeAudioData

            var successCallback = function (audioBuffer) {                             // Get the instance of AudioBuffer

              buffers[index] = audioBuffer;                              // The loading instances of AudioBuffer has completed ?

              for (var i = 0, len = buffers.length; i < len; i++) {
                if (buffers[i] === undefined) {
                  return;
                }
              }                              // dispatch 'complete' event

              document.querySelector('button').dispatchEvent(event);
            };                          // The 3rd argument for decodeAudioData

            var errorCallback = function (error) {
              if (error instanceof Error) {
                window.alert(error.message);
              } else {
                window.alert('Error : "decodeAudioData" method.');
              }
            };                          // Create the instance of AudioBuffer (Asynchronously)

            context.decodeAudioData(arrayBuffer, successCallback, errorCallback);
          }
        }
      };
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
    };

    suumo.forEach(function (value, i) {
      load('./audio/suumo_' + i + ".mp3", i);
    });

    document.querySelectorAll('button').forEach(function (button) {
      button.addEventListener('click', function () {
        if (this.id == "tweet2") {
          if (lyrics == "") {
            window.alert("スーモ文字列が空のままです．再生してからツイートすることをおすすめします");
          }
          window.open('http://twitter.com/intent/tweet/?text=' + encodeURIComponent(lyrics) + '&url=' + encodeURIComponent("http://hnakai0909.github.io/works/suumo/"));
          return;
        } else if (this.id == 'stop') {
          //音の再生を止める
          sources.forEach(function (source) {
            source.onended = function () { };
            source.stop(0);
          });
          sources = [];
          //赤反転を消す
          lyric_elements.forEach(function (element) {
            element.style.background = 'transparent';
          });
          return;
        }

        context.resume();

        // Get base time
        var t0 = context.currentTime;

        var mode = this.id;

        lyrics = "";
        sources = [];
        lyric_elements = [];
        var element = document.getElementById("box"); //歌詞表示リセット
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }

        addSuumo(t0, false);
        lyric_elements[0].style.background = 'rgba(255,0,0,0.5)';

        function addSuumo(startTime, withAppearanceAnimation) {
          init_order(song, mode === "normal" ? "normal" : "random");

          var startIndex = sources.length;
          suumo.forEach(function (value, i) { //歌詞表示
            var sumomi = document.createElement("span");
            document.getElementById("box").appendChild(sumomi);
            sumomi.innerHTML = "" + suumo[song[i]];
            lyric_elements[startIndex + i] = sumomi;
            lyrics += lyric_pieces[song[i]];

            if (withAppearanceAnimation) {
              sumomi.style.transition = "opacity 0.3s linear";
              sumomi.style.opacity = "0";
              setTimeout(function () {
                sumomi.style.opacity = "1";
              }, 0);
            }
          });

          var t0 = startTime;

          suumo.forEach(function (value, i) {

            source = context.createBufferSource();

            source.start = source.start || source.noteGrainOn;  // noteGrainOn

            source.stop = source.stop || source.noteOff;                      // Set the instance of AudioBuffer

            source.buffer = buffers[song[i]];                      // AudioBufferSourceNode (Input) -> GainNode (Master Volume) -> AudioDestinationNode (Output)

            source.connect(gain);
            gain.connect(context.destination);

            interval = source.buffer.duration - 0.05; //フライング

            source.start(t0, 0, interval);
            t0 += interval;
            source.onended = (function (i) {
              return function () {
                lyric_elements[i].style.background = 'transparent';

                if (mode === "infinity" && i === sources.length - 4) {
                  addSuumo(t0, true)
                }

                if (i < sources.length - 1) {
                  lyric_elements[i + 1].style.background = 'rgba(255,0,0,0.5)';
                } else {
                  sources = [];
                }
              }
            })(startIndex + i);
            sources.push(source);
          });
        }
      }, false);
    });
  };
  if ((document.readyState === 'interactive') || (document.readyState === 'complete')) {
    onDOMContentLoaded();
  } else {
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded, true);
  }
})();