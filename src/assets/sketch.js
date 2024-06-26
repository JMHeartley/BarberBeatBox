let audio, amp, fft;

let isPressed = false;
// const bins = 64
// let binWidth 
// let peakDetect

let myShader;
const targetId = 'visualizer';

let angle = 0.0;
let jitter = 0.0;

let audioFilePath;
let volume;
let shortestCanvasDimension;

function preload() {
  // audio = loadSound('assets/audio/Are you gonna dance or what.mp3');
  myShader = loadShader('assets/shader/vertex.vert', 'assets/shader/fragment.frag');
  frameRate(60);
}

function visualizerChangeSong(songFilePath, startTime) {
  if (audio && audio.isPlaying()) {
    audio.stop();
  }

  console.log('changing song to ' + songFilePath);
  console.log('starting song from ' + startTime);

  audioFilePath = songFilePath;
  audio = loadSound(songFilePath, () => {
    audio.setVolume(volume);
    audio.play();
    audio.jump(startTime);
  });
}

function visualizerSeek(time) {
  audio.jump(time);
}

function setup() {
  let albumArt = select(`#${targetId}`);
  shortestCanvasDimension = Math.min(albumArt.width, albumArt.height);

  let canvas = createCanvas(albumArt.width, albumArt.height, WEBGL);
  canvas.parent(targetId);

  shader(myShader);

  // getAudioContext().suspend()
  // audio.setVolume(0.1)

  userStartAudio();

  // fill(255, 255, 255)

  amp = new p5.Amplitude();
  fft = new p5.FFT();

  // peakDetect = new p5.PeakDetect()
  // peakDetect.onPeak(peakDetected)
}

function draw() {
  background(200, 200, 234, 0);
  // background(0)

  drawingContext.filter = 'blur(px)';

  //TODO: 
  // console.log(audio.currentTime());

  // stroke(255)

  fft.analyze();

  const volume = amp.getLevel();
  let freq = fft.getCentroid();

  freq *= 0.001;

  if (second() % 2 == 0) {
    jitter = random(0, 0.1);
    jitter += jitter;
  }

  angle = angle + jitter;

  rotateX(sin(freq) + angle * 0.1);
  rotateY(cos(volume) + angle * 0.1);



  const mapF = map(freq, 0, 1, 0, 20);
  const mapV = map(volume, 0, 0.2, 0, 0.5);
  // translate(0, height / 2)
  // rect(0, 0, mapW, mapW)
  // const waveform = audio.getPeaks()

  // for(let i = 0; i < waveform.length; i++){
  //   line(i, waveform[i] * 100, i, waveform[i] * -100)
  // }

  // const waveform = fft.waveform()

  // for(let i = 0; i < waveform.length; i++){
  //   const x = map(i, 0, waveform.length, 0, width)
  //   const y = map(waveform[i], -1, 1, 0, height)
  //   point(x, y) 
  // } 
  myShader.setUniform('uTime', frameCount);

  myShader.setUniform('uFreq', mapF);
  myShader.setUniform('uAmp', mapV);


  const portionRatio = 0.28125;
  let radius = shortestCanvasDimension * portionRatio;
  sphere(radius, 400, 400);
}

function visualizerTogglePlay(isPlaying) {
  if (isPlaying) {
    audio.pause();
  }
  else {
    audio.play();
  }
}

function visualizerSetVolume(playerVolume) {
  volume = playerVolume;

  if (audio) {
    audio.setVolume(playerVolume);
  }
}

function visualizerSetMute(isMuted) {
  audio.setVolume(isMuted ? 0 : volume);
}

// function peakDetected() {
//   console.log('peak detected')
// }

function windowResized() {
  let albumArt = select(`#${targetId}`);
  resizeCanvas(albumArt.width, albumArt.height);

  shortestCanvasDimension = Math.min(albumArt.width, albumArt.height);
}