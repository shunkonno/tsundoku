import { fetchSessions } from '../../../lib/db-admin'

const sessions = async (req, res) => {
  try {
    const sessions = await fetchSessions()
    res.status(200).json(sessions)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default sessions
