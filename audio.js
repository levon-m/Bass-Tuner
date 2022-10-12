function audio(){
  const audioContext = new window.AudioContext();
  const analyser = audioContext.createAnalyser();
  let audioReady = false;
  
  //create microphone stream source
  navigator.getUserMedia(
    {audio: true},
    stream => {
      audioContext.createMediaStreamSource(stream).connect(analyser);
      audioReady = true;
    },
    err => console.log(err)
  );
  
  var E = 41.203;
  var A = 55;
  var D = 73.416;
  var G = 97.999;
  var note = " ";
  var freq = " ";
  var message = " ";
  target = " ";
  targetfreq = 0;

  var autocorrelate = function(data, sampleRate) {
    var bins = 1024;
    var rmax = 0;
    var kmax = -1;
    //k's between 400-1300 will yield Hz range of 120-37, this covers all the notes we need
    //k is offset from the beginning of the wavelength
    //sum multiplies the points of the original wavelength and the offset one
    for(var k = 400; k <= 1300; k++){
      var sum = 0;
      for(var i = 0; i < bins; i++){
        sum = sum + ((data[i] - 128) / 128) * ((data[i + k] - 128) / 128);
      }
      
      //correlation
      var r = sum / bins;
      if(r > rmax){
        //kmax is the period of the frequency
        kmax = k;
        rmax = r;
      }
    }
    
    if(rmax > 0.005){
      var frequency = sampleRate / kmax;
      return frequency;
    }
    if(rmax < 0.005){
      return -1;
    }
  };

  var tuner = function() {
    var buffer = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buffer);
    //find frequency 
    var result = autocorrelate(buffer, audioContext.sampleRate);

    //if valid pitch is detected
    if(result != -1){
      freq = result;
    }

    document.getElementById("freq").innerHTML = freq;

    if(freq < targetfreq){
      message = "Tune higher";
    }
    if(freq > targetfreq){
      message = "Tune lower";
    }

    //fix for E string registering higher octave
    if((freq > E-3 && freq < E+3) || (freq/2 > E-3 && freq/2 < E+3)){
      note = "E";
      if(note == target){
        message = "Tuned!"
      }
    }
    if(freq > A-3 && freq < A+3){
      note = "A";
      if(note == target){
        message = "Tuned!"
      }
    }
    if(freq > D-3 && freq < D+3){
      note = "D";
      if(note == target){
        message = "Tuned!"
      }
    }
    if(freq > G-3 && freq < G+3){
      note = "G";
      if(note == target){
        message = "Tuned!"
      }
    }

    document.getElementById("note").innerHTML = note;
    document.getElementById("message").innerHTML = message;
  };

  setInterval(function(){ 
    tuner();
  }, 50);
}

function setTarget(t){
  document.getElementById("target").innerHTML = t;
  targetfreq = t;
  if(t == 41.203){
    target = "E";
  }
  if(t == 55){
    target = "A";
  }
  if(t == 73.416){
    target = "D";
  }
  if(t == 97.999){
    target = "G";
  }
}