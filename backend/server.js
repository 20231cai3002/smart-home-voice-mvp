import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()

// ✅ Middleware (ORDER IS IMPORTANT)
app.use(cors())
app.use(express.json())

// 🔍 Debug – to see request body
app.use((req, res, next) => {
  console.log("REQ BODY:", req.body)
  next()
})

// ✅ Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const port = 4000

// ----------------------------------
// GET all devices
// ----------------------------------
app.get('/devices', async (req, res) => {
  const { data, error } = await supabase
    .from('devices')
    .select('*')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// ----------------------------------
// TOGGLE DEVICE (OLD WORKING ROUTE)
// ----------------------------------
app.post('/devices/:id/toggle', async (req, res) => {
  const id = parseInt(req.params.id)

  // get current status
  const { data: device, error } = await supabase
    .from('devices')
    .select('status')
    .eq('id', id)
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const newStatus = !device.status

  const { data: updated, error: updateError } = await supabase
    .from('devices')
    .update({ status: newStatus })
    .eq('id', id)
    .select()

  if (updateError) {
    return res.status(500).json({ error: updateError.message })
  }

  res.json(updated[0])
})

// ----------------------------------
// 🎤 HANDLE VOICE COMMAND
// ----------------------------------
app.post('/command', async (req, res) => {
  const { text } = req.body

  if (!text) {
    return res.status(400).json({
      error: "No command text received"
    })
  }

  const command = text.toLowerCase()

  let deviceName = null
  let status = null

  // Device detection
  if (command.includes('living')) deviceName = 'Living Room Light'
  else if (command.includes('kitchen')) deviceName = 'Kitchen Fan'
  else if (command.includes('bedroom')) deviceName = 'Bedroom AC'

  // Action detection
  if (command.includes('turn on')) status = true
  else if (command.includes('turn off')) status = false

  if (!deviceName || status === null) {
    return res.status(400).json({
      error: "Command not recognized",
      received: command
    })
  }

  const { data, error } = await supabase
    .from('devices')
    .update({ status })
    .eq('name', deviceName)
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({
    message: `${deviceName} turned ${status ? 'ON' : 'OFF'}`,
    device: data[0]
  })
})

// ----------------------------------
app.listen(port, () => {
  console.log(`✅ Backend running at http://localhost:${port}`)
})
