import { fetchAllSessions } from '../../../lib/db-admin'

// INPUT: ー
// OUTPUT: すべてのセッションを取得する (過去は除く)

const sessionApiHandler = async (req, res) => {
  try {
    const sessions = await fetchAllSessions()
    res.status(200).json(sessions)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default sessionApiHandler
