// Worker da cena Letter Glitch (hero, feature 006, research R12): as ~5.000 letras são redesenhadas a cada
// quadro fora da thread principal, e os timers da página (digitação, loader do hero) não atrasam.
import { startLetterGlitch } from '@/lib/scenes/letter-glitch'
import { serveScene } from '@/lib/scenes/serve'

serveScene(startLetterGlitch)
