// Worker da cena CRT do hero (feature 004): o tubo e a chuva Matrix rodam fora da thread principal,
// sem pesar na rolagem nem na interação (research R1).
import { startCrt } from '@/lib/scenes/crt'
import { serveScene } from '@/lib/scenes/serve'

serveScene(startCrt)
