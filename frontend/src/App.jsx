import { useEffect, useState } from "react"
import "./App.css"

function App() {
  const [devices, setDevices] = useState([])
  const [command, setCommand] = useState("")
  const [input, setInput] = useState("")

  const fetchDevices = async () => {
    const res = await fetch("http://localhost:4000/devices")
    const data = await res.json()
    setDevices(data)
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  // 🎤 Voice (may fail on some systems)
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      setCommand(text)
      sendCommand(text)
    }

    recognition.onerror = () => {
      alert("Voice not working on this system. Use text command.")
    }

    recognition.start()
  }

  // 📤 Send command (used by BOTH voice & text)
  const sendCommand = async (text) => {
    await fetch("http://localhost:4000/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })
    fetchDevices()
  }

  // ⌨️ Text command submit
  const handleSubmit = () => {
    if (!input) return
    setCommand(input)
    sendCommand(input)
    setInput("")
  }

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🏠 Smart Home Dashboard</h1>
      <p>Control your devices easily</p>

      <button onClick={startListening}>🎤 Speak Command</button>

      <br /><br />

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type command (e.g. turn on light)"
        style={{ padding: "8px", width: "300px" }}
      />
      <button onClick={handleSubmit}>Send</button>

      <h3>Last Command:</h3>
      <b>{command}</b>

      <hr />

      <h3>Devices</h3>
      {devices.map(d => (
        <p key={d.id}>
          {d.name} — {d.status ? "ON 🔆" : "OFF ⚫"}
        </p>
      ))}
    </div>
  )
}

export default App
