// Worker da cena Faulty Terminal (boot, feature 004): o shader roda fora da thread principal, e os
// timers da linha do tempo do boot não atrasam (research R1).
import { startFaulty } from '@/lib/scenes/faulty'
import { serveScene } from '@/lib/scenes/serve'

serveScene(startFaulty)
