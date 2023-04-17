import { useState } from 'react';

export default function App() {

  var [words, setWords] = useState([]);
  
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    console.log({ stream })
    if (!MediaRecorder.isTypeSupported('audio/webm'))
      return alert('Browser not supported')
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
    })
    const socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
      'token',
      process.env.REACT_APP_DEEPGRAM_API_KEY,
    ])
    socket.onopen = () => {
      console.log("Established connection")
      console.log({ event: 'onopen' })
      mediaRecorder.addEventListener('dataavailable', async (event) => {
        if (event.data.size > 0 && socket.readyState === 1) {
          socket.send(event.data)
        }
      })
      mediaRecorder.start(1000)
    }

    socket.onmessage = (message) => {
      const received = JSON.parse(message.data);
      const transcript = received.channel.alternatives[0].transcript
      if (transcript && received.is_final) {
        setWords([transcript]);
        console.log(transcript);
      }
    }

    socket.onclose = () => {
      console.log({ event: 'onclose' })
    }

    socket.onerror = (error) => {
      console.log({ event: 'onerror', error })
    }
  })

  return (
    <div>
      {words.map(function(word, i) {
        return (<div key={i}>{word}</div>)
      })}
    </div>
  )
}
