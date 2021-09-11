import { fetchAllSessions } from '../../../lib/db-admin'

const allSessions = async (req, res) => {
  try {
    const sessions = await fetchAllSessions()
    res.status(200).json(sessions)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default allSessions
