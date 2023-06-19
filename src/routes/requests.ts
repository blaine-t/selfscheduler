import { Router }from 'express'
const router = Router()

/**
 * Checks by class code whether a certain class is available
 */
router.get('/classCheck', async (req, res) => {
  res.send('howdy')
})

export { router }