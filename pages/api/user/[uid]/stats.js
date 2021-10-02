import { fetchUserStats } from '../../../../lib/db-admin'

// INPUT: uid
// OUTPUT: ユーザーに紐づく userStats
const statsApiHandler = async (req, res) => {
  try {
    const userStats = await fetchUserStats(req.query.uid)
    res.status(200).json(userStats)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default statsApiHandler
